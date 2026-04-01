import { getDbClient } from '../db/client';
import type { OllamaMessage } from './providers/ollama';
import { getProviderManager } from './provider-manager';
import { getOllamaProvider } from './providers/ollama';
import { getOpenAIProvider } from './providers/openai';
import { getGeminiProvider } from './providers/gemini';

/**
 * Agent Executor - Orchestrates AI provider fallback chain
 * Primary: Ollama (local, free)
 * Fallback 1: OpenAI (cloud, paid)
 * Fallback 2: Gemini (cloud, free tier)
 * Fallback 3: Manual (user provides input)
 */
export class AgentExecutor {
  private sessionId: string;
  private userId: string;
  private agentId: string = 'default-agent';

  constructor(sessionId: string, userId: string) {
    this.sessionId = sessionId;
    this.userId = userId;
  }

  /**
   * Execute agent - get AI response with fallback chain
   */
  async execute(
    messages: OllamaMessage[],
    overrides?: { provider?: 'ollama' | 'openai' | 'gemini'; model?: string }
  ): Promise<{
    content: string;
    provider: 'ollama' | 'openai' | 'gemini' | 'manual';
    executionTime: number;
  }> {
    const manager = getProviderManager();
    const response = await manager.sendMessage(messages, overrides);

    try {
      if (response.provider === 'ollama') {
        const ollama = getOllamaProvider();
        await ollama.logUsage(
          this.sessionId,
          this.userId,
          JSON.stringify(messages),
          response.content
        );
      }

      if (response.provider === 'openai') {
        const openai = getOpenAIProvider();
        await openai.logUsage(
          this.sessionId,
          this.userId,
          JSON.stringify(messages),
          response.content
        );
      }

      if (response.provider === 'gemini') {
        const gemini = getGeminiProvider();
        await gemini.logUsage(
          this.sessionId,
          this.userId,
          JSON.stringify(messages),
          response.content
        );
      }
    } catch (err) {
      console.warn('[v0] Provider usage logging failed:', err);
    }

    return {
      content: response.content,
      provider: response.provider,
      executionTime: response.executionTime,
    };
  }

  /**
   * Store conversation in database
   */
  async storeMessage(
    role: 'user' | 'assistant',
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const db = getDbClient();

    try {
      await db.message.create({
        data: {
          sessionId: this.sessionId,
          role,
          content,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    } catch (err) {
      console.error('[v0] Failed to store message:', err);
    }
  }

  /**
   * Get conversation history
   */
  async getHistory(limit: number = 10): Promise<OllamaMessage[]> {
    const db = getDbClient();

    try {
      const messages = await db.message.findMany({
        where: { sessionId: this.sessionId },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });

      return messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));
    } catch (err) {
      console.error('[v0] Failed to get history:', err);
      return [];
    }
  }

  /**
   * Create new session
   */
  static async createSession(
    userId: string,
    agentId?: string
  ): Promise<{ id: string; userId: string; agentId: string; createdAt: Date }> {
    const db = getDbClient();

    try {
      const session = await db.session.create({
        data: {
          userId,
          agentId: agentId || 'default-agent',
          agentName: 'Default Agent',
          startTime: new Date(),
          status: 'ACTIVE',
        },
      });

      return {
        id: session.id,
        userId: session.userId,
        agentId: session.agentId || 'default-agent',
        createdAt: session.startTime,
      };
    } catch (err) {
      console.error('[v0] Failed to create session:', err);
      throw err;
    }
  }

  /**
   * Get session by ID
   */
  static async getSession(
    sessionId: string
  ): Promise<{ id: string; userId: string; agentId: string; createdAt: Date } | null> {
    const db = getDbClient();

    try {
      const session = await db.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) return null;

      return {
        id: session.id,
        userId: session.userId,
        agentId: session.agentId || 'default-agent',
        createdAt: session.startTime,
      };
    } catch (err) {
      console.error('[v0] Failed to get session:', err);
      return null;
    }
  }
}

/**
 * Get executor for session
 */
export function getAgentExecutor(sessionId: string, userId: string): AgentExecutor {
  return new AgentExecutor(sessionId, userId);
}
