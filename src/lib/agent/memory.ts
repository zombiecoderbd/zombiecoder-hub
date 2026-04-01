/**
 * AGENT MEMORY SYSTEM
 * Manages agent context, conversation history, and learning state
 * Supports multi-session memory, context preservation, and recall
 */

import { getDbClient } from '../db/client';
import { Message, AgentMemory as PrismaAgentMemory } from '@prisma/client';

export interface MemoryEntry {
  id?: string;
  agentId: string;
  sessionId: string;
  type: 'CONTEXT' | 'LEARNING' | 'DECISION' | 'ERROR' | 'TOOL_RESULT';
  content: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
  relevanceScore?: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolUse?: string;
  metadata?: Record<string, any>;
}

export interface SessionContext {
  sessionId: string;
  agentId: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  contextSize: number;
}

export class AgentMemory {
  private sessionContexts: Map<string, SessionContext> = new Map();
  private conversationCache: Map<string, ConversationMessage[]> = new Map();
  private maxContextTokens = 8000;

  /**
   * Initialize session context
   */
  async initializeSession(
    sessionId: string,
    agentId: string,
    userId: string
  ): Promise<SessionContext> {
    const context: SessionContext = {
      sessionId,
      agentId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      contextSize: 0
    };

    this.sessionContexts.set(sessionId, context);
    console.log(`[v0] Session ${sessionId} initialized for agent ${agentId}`);

    return context;
  }

  /**
   * Add message to conversation history
   */
  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<Message> {
    const db = getDbClient();
    const session = await db.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const message = await db.message.create({
      data: {
        sessionId,
        role,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    // Update cache
    if (!this.conversationCache.has(sessionId)) {
      this.conversationCache.set(sessionId, []);
    }

    this.conversationCache.get(sessionId)!.push({
      role,
      content,
      timestamp: message.createdAt,
      metadata
    });

    // Update session context
    const context = this.sessionContexts.get(sessionId);
    if (context) {
      context.messageCount++;
      context.lastActivity = new Date();
      context.contextSize += content.length;
    }

    return message;
  }

  /**
   * Get recent conversation history
   */
  async getConversationHistory(
    sessionId: string,
    maxMessages: number = 20
  ): Promise<ConversationMessage[]> {
    // Check cache first
    const cached = this.conversationCache.get(sessionId);
    if (cached && cached.length > 0) {
      return cached.slice(-maxMessages);
    }

    // Load from database
    const db = getDbClient();
    const messages = await db.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: maxMessages
    });

    const conversationMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      timestamp: msg.createdAt,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : undefined
    }));

    this.conversationCache.set(sessionId, conversationMessages);
    return conversationMessages;
  }

  /**
   * Store memory entry
   */
  async storeMemory(entry: MemoryEntry): Promise<PrismaAgentMemory> {
    const db = getDbClient();
    const memory = await db.agentMemory.create({
      data: {
        agentId: entry.agentId,
        sessionId: entry.sessionId,
        type: entry.type,
        content: entry.content,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null
      }
    });

    console.log(`[v0] Memory stored for agent ${entry.agentId}: ${entry.type}`);
    return memory;
  }

  /**
   * Retrieve relevant memories
   */
  async retrieveRelevantMemories(
    agentId: string,
    sessionId: string,
    query: string,
    limit: number = 5
  ): Promise<PrismaAgentMemory[]> {
    // Get recent memories for this session
    const db = getDbClient();
    const memories = await db.agentMemory.findMany({
      where: {
        agentId,
        sessionId
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 2
    });

    // Score by relevance (simple keyword matching)
    const scored = memories.map(mem => ({
      memory: mem,
      score: this.calculateRelevance(mem.content, query)
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.memory);
  }

  /**
   * Calculate relevance score (simple implementation)
   */
  private calculateRelevance(content: string, query: string): number {
    if (!query) return 0;

    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    const matches = queryWords.filter(word => contentLower.includes(word)).length;

    return (matches / queryWords.length) * 100;
  }

  /**
   * Get session context
   */
  getSessionContext(sessionId: string): SessionContext | undefined {
    return this.sessionContexts.get(sessionId);
  }

  /**
   * Clear session from memory
   */
  clearSession(sessionId: string): void {
    this.sessionContexts.delete(sessionId);
    this.conversationCache.delete(sessionId);
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats(sessionId: string): Promise<Record<string, any>> {
    const db = getDbClient();
    const context = this.sessionContexts.get(sessionId);
    const messageCount = await db.message.count({
      where: { sessionId }
    });

    const memoryCount = await db.agentMemory.count({
      where: { sessionId }
    });

    return {
      sessionId,
      messageCount,
      memoryEntries: memoryCount,
      contextSize: context?.contextSize || 0,
      startTime: context?.startTime,
      lastActivity: context?.lastActivity,
      duration: context ? new Date().getTime() - context.startTime.getTime() : 0
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let memoryInstance: AgentMemory | null = null;

export function getAgentMemory(): AgentMemory {
  if (!memoryInstance) {
    memoryInstance = new AgentMemory();
  }
  return memoryInstance;
}
