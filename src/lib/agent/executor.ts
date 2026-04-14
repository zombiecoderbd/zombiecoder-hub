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

  private async recordUsage(params: {
    providerKey: 'ollama' | 'openai' | 'gemini';
    modelName?: string;
    latencyMs: number;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    const db = getDbClient();
    const providerKey = params.providerKey;
    const modelName = (params.modelName || '').trim();

    const provider = await db.provider.findUnique({
      where: { key: providerKey },
      select: { id: true },
    });

    if (!provider) return;

    await db.providerUsage.upsert({
      where: { providerId: provider.id },
      update: {
        requestCount: { increment: 1 },
        successCount: params.success ? { increment: 1 } : undefined,
        errorCount: params.success ? undefined : { increment: 1 },
        lastLatencyMs: params.latencyMs,
        lastStatus: params.success ? 'ok' : 'error',
        lastError: params.success ? null : params.errorMessage || 'unknown error',
        lastRequestAt: new Date(),
      },
      create: {
        providerId: provider.id,
        requestCount: 1,
        successCount: params.success ? 1 : 0,
        errorCount: params.success ? 0 : 1,
        avgLatencyMs: params.latencyMs,
        lastLatencyMs: params.latencyMs,
        lastStatus: params.success ? 'ok' : 'error',
        lastError: params.success ? null : params.errorMessage || 'unknown error',
        lastRequestAt: new Date(),
      },
    });

    if (!modelName) return;

    const model = await db.model.findFirst({
      where: { providerId: provider.id, name: modelName },
      select: { id: true },
    });
    if (!model) return;

    const usage = await db.modelUsage.upsert({
      where: { providerId_modelId: { providerId: provider.id, modelId: model.id } },
      update: {
        requestCount: { increment: 1 },
        successCount: params.success ? { increment: 1 } : undefined,
        errorCount: params.success ? undefined : { increment: 1 },
        lastLatencyMs: params.latencyMs,
        lastStatus: params.success ? 'ok' : 'error',
        lastError: params.success ? null : params.errorMessage || 'unknown error',
        lastRequestAt: new Date(),
      },
      create: {
        providerId: provider.id,
        modelId: model.id,
        requestCount: 1,
        successCount: params.success ? 1 : 0,
        errorCount: params.success ? 0 : 1,
        avgLatencyMs: params.latencyMs,
        lastLatencyMs: params.latencyMs,
        lastStatus: params.success ? 'ok' : 'error',
        lastError: params.success ? null : params.errorMessage || 'unknown error',
        lastRequestAt: new Date(),
      },
    });

    try {
      const avg = Math.round((usage.avgLatencyMs * (usage.requestCount - 1) + params.latencyMs) / usage.requestCount);
      await db.modelUsage.update({
        where: { id: usage.id },
        data: { avgLatencyMs: avg },
      });
    } catch {
      // ignore avg calc failure
    }
  }

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

    try {
      if (response.provider === 'ollama' || response.provider === 'openai' || response.provider === 'gemini') {
        const ok = !response.content.startsWith('Forced provider');
        await this.recordUsage({
          providerKey: response.provider,
          modelName: response.model,
          latencyMs: response.executionTime,
          success: ok,
          errorMessage: ok ? undefined : response.content,
        });
      }
    } catch (err) {
      console.warn('[v0] Usage stats record failed:', err);
    }

    return {
      content: response.content,
      provider: response.provider,
      executionTime: response.executionTime,
    };
  }

  /**
   * Stream agent execution
   */
  async *executeStream(
    messages: OllamaMessage[],
    overrides?: { provider?: 'ollama' | 'openai' | 'gemini'; model?: string }
  ): AsyncGenerator<{ content: string; provider: string }> {
    const manager = getProviderManager();
    const stream = manager.streamMessage(messages, overrides);

    for await (const chunk of stream) {
      yield chunk;
    }
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
