import { getDbClient } from '../../db/client';

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider {
  private apiKey: string;
  private model: string = 'gpt-4-turbo-preview';
  private baseUrl: string = 'https://api.openai.com/v1';
  private timeout: number = 30000;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Check if OpenAI is configured
   */
  isConfigured(): boolean {
    const key = (this.apiKey || '').trim();
    if (!key) return false;
    if (key.startsWith('sk-your-')) return false;
    if (key.includes('********')) return false;
    if (key.toLowerCase().includes('your')) return false;
    if (!key.startsWith('sk-')) return false;
    return true;
  }

  /**
   * Send message to OpenAI API
   */
  async sendMessage(
    messages: OpenAIMessage[],
    options?: { model?: string }
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI error: ${error.error?.message || response.statusText}`);
      }

      const data = (await response.json()) as OpenAIResponse;
      return data.choices[0]?.message.content || '';
    } catch (err) {
      console.error('[v0] OpenAI error:', err);
      throw err;
    }
  }

  /**
   * Check if OpenAI API is accessible
   */
  async isAvailable(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Log usage to database for audit
   */
  async logUsage(
    sessionId: string,
    userId: string,
    input: string,
    output: string,
    tokensUsed?: number
  ): Promise<void> {
    try {
      const db = getDbClient();
      await db.auditLog.create({
        data: {
          user: { connect: { id: userId } },
          action: 'AI_GENERATION',
          resource: 'openai',
          details: JSON.stringify({
            sessionId,
            model: this.model,
            inputLength: input.length,
            outputLength: output.length,
            tokensUsed: tokensUsed || 0,
          }),
        },
      });
    } catch (err) {
      console.error('[v0] Failed to log OpenAI usage:', err);
    }
  }
}

/**
 * Singleton for OpenAI provider
 */
let openaiProvider: OpenAIProvider | null = null;

export function getOpenAIProvider(): OpenAIProvider {
  if (!openaiProvider) {
    openaiProvider = new OpenAIProvider();
  }
  return openaiProvider;
}
