import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getDbClient } from '../db/client';
import { getAgentExecutor } from '../agent/executor';
import { getToolExecutor } from '../agent/tools';
import { getGovernanceValidator } from '../agent/governance';

/**
 * MCP WebSocket Server
 * Real-time bi-directional communication for agent interactions
 * Streams tool results and agent responses in real-time
 */

export interface MCPMessage {
  id: string;
  type: 'message' | 'tool_call' | 'tool_result' | 'error' | 'status';
  sessionId: string;
  content: string;
  toolName?: string;
  toolResult?: any;
  timestamp: Date;
}

export class MCPWebSocketServer {
  private io: SocketIOServer;
  private sessionConnections: Map<string, Set<Socket>> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[v0] WebSocket client connected: ${socket.id}`);

      socket.on('join-session', this.handleJoinSession.bind(this, socket));
      socket.on('send-message', this.handleSendMessage.bind(this, socket));
      socket.on('call-tool', this.handleToolCall.bind(this, socket));
      socket.on('disconnect', this.handleDisconnect.bind(this, socket));
    });
  }

  private async handleJoinSession(
    socket: Socket,
    data: { sessionId: string; userId: string; token: string }
  ): Promise<void> {
    try {
      // Validate JWT token
      const valid = await this.validateToken(data.token);
      if (!valid) {
        socket.emit('error', { message: 'Invalid authentication token' });
        socket.disconnect();
        return;
      }

      const { sessionId, userId } = data;
      socket.join(sessionId);

      // Track session connections
      if (!this.sessionConnections.has(sessionId)) {
        this.sessionConnections.set(sessionId, new Set());
      }
      this.sessionConnections.get(sessionId)!.add(socket);

      // Track user sessions
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, new Set());
      }
      this.userSessions.get(userId)!.add(sessionId);

      socket.emit('joined-session', {
        sessionId,
        status: 'connected',
        timestamp: new Date()
      });

      console.log(`[v0] User ${userId} joined session ${sessionId}`);
    } catch (error) {
      console.error('[v0] Error joining session:', error);
      socket.emit('error', { message: 'Failed to join session' });
    }
  }

  private async handleSendMessage(
    socket: Socket,
    data: { sessionId: string; userId: string; message: string }
  ): Promise<void> {
    try {
      const { sessionId, userId, message } = data;
      const db = getDbClient();

      // Store user message
      await db.message.create({
        data: {
          sessionId,
          role: 'user',
          content: message
        }
      });

      // Emit to all clients in session
      this.io.to(sessionId).emit('message', {
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Get agent for session
      const session = await db.session.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // Get agent executor for session
      const executor = getAgentExecutor(sessionId, userId);
      
      // Get history for context
      const history = await executor.getHistory(10);
      
      // Execute through agent
      const response = await executor.execute([...history, { role: 'user', content: message }]);

      // Store agent response
      await executor.storeMessage('assistant', response.content, {
        provider: response.provider,
        executionTime: response.executionTime
      });

      // Stream response to all clients
      this.io.to(sessionId).emit('message', {
        role: 'assistant',
        content: response.content,
        provider: response.provider,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[v0] Error processing message:', error);
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to process message'
      });
    }
  }

  private async handleToolCall(
    socket: Socket,
    data: {
      sessionId: string;
      userId: string;
      toolName: string;
      parameters: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const { sessionId, userId, toolName, parameters } = data;

      // Validate governance
      const governance = await getGovernanceValidator();
      const compliance = await governance.validateOperation({
        userId,
        agentId: '',
        sessionId,
        operationType: 'EXECUTE',
        targetResource: toolName,
        riskLevel: 'MEDIUM',
        description: `WebSocket tool call: ${toolName}`
      });
      if (!compliance.approved) {
        socket.emit('tool-denied', {
          toolName,
          reason: compliance.policyViolations.join(', ') || 'Governance denied tool execution',
          timestamp: new Date()
        });
        return;
      }

      // Execute tool
      const toolExecutor = getToolExecutor();
      const result = await toolExecutor.executeTool({
        toolId: '',
        toolName,
        agentId: '',
        sessionId,
        userId,
        parameters
      });

      // Stream tool result to all clients in session
      this.io.to(sessionId).emit('tool-result', {
        toolName,
        status: result.status,
        output: result.output,
        executionTime: result.executionTime,
        timestamp: result.timestamp
      });

      // Store tool execution
      // ToolExecutor is responsible for persisting ToolExecution rows.
    } catch (error) {
      console.error('[v0] Error executing tool:', error);
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Tool execution failed'
      });
    }
  }

  private handleDisconnect(socket: Socket): void {
    console.log(`[v0] WebSocket client disconnected: ${socket.id}`);
    // Cleanup session connections
    this.sessionConnections.forEach((clients) => {
      clients.delete(socket);
    });
  }

  private async validateToken(token: string): Promise<boolean> {
    try {
      const { verifyJWT } = await import('../auth/service');
      const payload = await verifyJWT(token);
      return !!payload;
    } catch {
      return false;
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

let wsServer: MCPWebSocketServer | null = null;

export function getMCPWebSocketServer(httpServer?: HTTPServer): MCPWebSocketServer {
  if (!wsServer && httpServer) {
    wsServer = new MCPWebSocketServer(httpServer);
  }
  if (!wsServer) {
    throw new Error('WebSocket server not initialized. Provide httpServer parameter.');
  }
  return wsServer;
}

export function initializeMCPWebSocketServer(httpServer: HTTPServer): MCPWebSocketServer {
  wsServer = new MCPWebSocketServer(httpServer);
  return wsServer;
}
