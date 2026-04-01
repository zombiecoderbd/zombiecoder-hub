import { getDbClient } from '../../db/client';

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message?: OllamaMessage;
  response?: string;
  done: boolean;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

export class OllamaProvider {
  private baseUrl: string;
  private model: string;
  private timeout: number;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'mistral';
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT_MS || '30000', 10);
  }

  /**
   * Send message to Ollama and get response
   */
  async sendMessage(
    messages: OllamaMessage[],
    options?: { model?: string }
  ): Promise<string> {
    try {
      const model = options?.model || this.model;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const chatResponse = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages,
            stream: false,
            options: {
              temperature: 0.7,
            },
          }),
          signal: controller.signal,
        });

        if (chatResponse.ok) {
          const chatData = (await chatResponse.json()) as OllamaResponse;
          clearTimeout(timeoutId);

          if (chatData.message?.content) {
            return chatData.message.content;
          }

          if (typeof chatData.response === 'string') {
            return chatData.response;
          }

          return '';
        }
      } catch {}

      // Fallback: generate API (plaintext prompt)
      const prompt = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');
      const generateResponse = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!generateResponse.ok) {
        throw new Error(`Ollama error: ${generateResponse.status}`);
      }

      const data = (await generateResponse.json()) as OllamaResponse;
      if (typeof data.response === 'string') {
        return data.response;
      }

      if (data.message?.content) {
        return data.message.content;
      }

      return '';
    } catch (err) {
      console.error('[v0] Ollama error:', err);
      throw err;
    }
  }

  /**
   * Check if Ollama is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get list of available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json() as { models: Array<{ name: string }> };
      return data.models?.map((m) => m.name) || [];
    } catch {
      return [];
    }
  }

  /**
   * Log usage to database for audit
   */
  async logUsage(
    sessionId: string,
    userId: string,
    input: string,
    output: string
  ): Promise<void> {
    try {
      const db = getDbClient();
      await db.auditLog.create({
        data: {
          user: { connect: { id: userId } },
          action: 'AI_GENERATION',
          resource: 'ollama',
          details: JSON.stringify({
            sessionId,
            model: this.model,
            inputLength: input.length,
            outputLength: output.length,
          }),
        },
      });
    } catch (err) {
      console.error('[v0] Failed to log Ollama usage:', err);
    }
  }
}

/**
 * Singleton for Ollama provider
 */
let ollamaProvider: OllamaProvider | null = null;

export function getOllamaProvider(): OllamaProvider {
  if (!ollamaProvider) {
    ollamaProvider = new OllamaProvider();
  }
  return ollamaProvider;
}
