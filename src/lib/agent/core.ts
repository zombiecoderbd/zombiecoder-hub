/**
 * AGENT CORE ENGINE
 * Main orchestrator for agent execution, decision-making, and interaction
 * Integrates governance, memory, tools, and LLM communication
 */

import { getDbClient } from '../db/client';
import { Agent, Session, Task, TaskStatus } from '@prisma/client';
import { getGovernanceValidator } from './governance';
import { getAgentMemory } from './memory';
import { getToolExecutor, ToolExecutionRequest } from './tools';

export interface AgentConfig {
  agentId: string;
  name: string;
  description: string;
  persona: string;
  modelProvider: 'ollama' | 'openai' | 'gemini';
  modelName: string;
  temperature: number;
  maxTokens: number;
}

export interface AgentInteraction {
  sessionId: string;
  userId: string;
  userMessage: string;
  timestamp: Date;
}

export interface AgentResponse {
  sessionId: string;
  message: string;
  toolUse?: string;
  confidence: number;
  timestamp: Date;
}

export class AgentCore {
  private agents: Map<string, Agent> = new Map();
  private activeSessions: Map<string, Session> = new Map();

  /**
   * Initialize an agent
   */
  async initializeAgent(agentId: string): Promise<Agent> {
    console.log(`[v0] Initializing agent: ${agentId}`);

    const db = getDbClient();
    const agent = await db.agent.findUnique({
      where: { id: agentId },
      include: {
        config: true
      }
    });

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    this.agents.set(agentId, agent);
    return agent;
  }

  /**
   * Create new session for user with agent
   */
  async createSession(userId: string, agentId: string): Promise<Session> {
    console.log(`[v0] Creating session for user ${userId} with agent ${agentId}`);

    // Ensure agent is initialized
    if (!this.agents.has(agentId)) {
      await this.initializeAgent(agentId);
    }

    // Create session in database
    const db = getDbClient();
    const session = await db.session.create({
      data: {
        userId,
        agentId,
        agentName: this.agents.get(agentId)!.name,
        status: 'ACTIVE'
      }
    });

    this.activeSessions.set(session.id, session);

    // Initialize memory for session
    const memory = getAgentMemory();
    await memory.initializeSession(session.id, agentId, userId);

    // Add system message
    await memory.addMessage(session.id, 'system', `Session started with agent ${agentId}`, {
      agentId,
      timestamp: new Date()
    });

    return session;
  }

  /**
   * Process user interaction
   */
  async processInteraction(interaction: AgentInteraction): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // Validate session
      const db = getDbClient();
      const session = await db.session.findUnique({
        where: { id: interaction.sessionId }
      });

      if (!session) {
        throw new Error(`Session not found: ${interaction.sessionId}`);
      }

      if (session.status !== 'ACTIVE') {
        throw new Error(`Session is not active: ${session.status}`);
      }

      // Add user message to memory
      const memory = getAgentMemory();
      await memory.addMessage(interaction.sessionId, 'user', interaction.userMessage, {
        timestamp: interaction.timestamp
      });

      // Get conversation context
      const conversationHistory = await memory.getConversationHistory(interaction.sessionId, 10);

      // Check governance for analysis
      const governor = await getGovernanceValidator();
      const governanceApproval = await governor.canExecute({
        userId: interaction.userId,
        agentId: session.agentId,
        sessionId: interaction.sessionId,
        operationType: 'READ',
        targetResource: interaction.userMessage.substring(0, 50),
        riskLevel: 'LOW',
        description: 'User interaction processing'
      });

      if (!governanceApproval) {
        throw new Error('Governance check failed for interaction processing');
      }

      // Generate agent response (placeholder - will integrate LLM)
      const agentResponse = await this.generateResponse(
        session.agentId,
        interaction.userMessage,
        conversationHistory
      );

      // Store response in memory
      await memory.addMessage(interaction.sessionId, 'assistant', agentResponse.message, {
        confidence: agentResponse.confidence,
        toolUse: agentResponse.toolUse,
        timestamp: agentResponse.timestamp
      });

      // Execute tools if needed
      if (agentResponse.toolUse) {
        await this.executeTool(interaction.sessionId, interaction.userId, agentResponse.toolUse);
      }

      // Record interaction as task
      const db2 = getDbClient();
      const task = await db2.task.create({
        data: {
          sessionId: interaction.sessionId,
          title: `User: "${interaction.userMessage.substring(0, 50)}..."`,
          description: interaction.userMessage,
          status: 'COMPLETED',
          result: agentResponse.message
        }
      });

      console.log(`[v0] Task completed: ${task.id} in ${Date.now() - startTime}ms`);

      return agentResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[v0] Interaction processing failed: ${errorMessage}`);

      // Store error in memory
      const memory = getAgentMemory();
      await memory.addMessage(interaction.sessionId, 'system', `Error: ${errorMessage}`, {
        error: true,
        timestamp: new Date()
      });

      return {
        sessionId: interaction.sessionId,
        message: `I encountered an error: ${errorMessage}. Please try again.`,
        confidence: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate response from agent
   */
  private async generateResponse(
    agentId: string,
    userMessage: string,
    conversationHistory: any[]
  ): Promise<AgentResponse> {
    // This is a placeholder - real implementation would call LLM
    const agent = this.agents.get(agentId);

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Simple echo response for now
    const response: AgentResponse = {
      sessionId: '', // Will be set by caller
      message: `I received your message: "${userMessage}". I am ${agent.name}, ready to help.`,
      confidence: 0.85,
      timestamp: new Date()
    };

    return response;
  }

  /**
   * Execute tool based on agent decision
   */
  private async executeTool(
    sessionId: string,
    userId: string,
    toolName: string
  ): Promise<void> {
    const db = getDbClient();
    const session = await db.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Get available tools
    const tools = await db.tool.findMany({
      where: { name: toolName }
    });

    if (tools.length === 0) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const tool = tools[0];

    // Execute tool
    const executor = getToolExecutor();
    const result = await executor.executeTool({
      toolId: tool.id,
      toolName,
      agentId: session.agentId,
      sessionId,
      userId,
      parameters: {}
    });

    console.log(`[v0] Tool execution result: ${result.status}`);
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<Session> {
    console.log(`[v0] Ending session: ${sessionId}`);

    const db = getDbClient();
    const session = await db.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endTime: new Date()
      }
    });

    this.activeSessions.delete(sessionId);

    // Clear memory
    const memory = getAgentMemory();
    memory.clearSession(sessionId);

    return session;
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<Record<string, any>> {
    const db = getDbClient();
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        messages: true,
        tasks: true
      }
    });

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const memory = getAgentMemory();
    const memoryStats = await memory.getMemoryStats(sessionId);

    return {
      sessionId,
      agentId: session.agentId,
      status: session.status,
      messageCount: session.messages.length,
      taskCount: session.tasks.length,
      completedTasks: session.tasks.filter(t => t.status === 'COMPLETED').length,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.endTime
        ? session.endTime.getTime() - session.startTime.getTime()
        : Date.now() - session.startTime.getTime(),
      ...memoryStats
    };
  }

  /**
   * Get agent config
   */
  getAgentConfig(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * List active sessions
   */
  getActiveSessions(): Session[] {
    return Array.from(this.activeSessions.values());
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let agentCoreInstance: AgentCore | null = null;

export function getAgentCore(): AgentCore {
  if (!agentCoreInstance) {
    agentCoreInstance = new AgentCore();
  }
  return agentCoreInstance;
}
