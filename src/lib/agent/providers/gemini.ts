/**
 * Gemini Provider - Google AI Integration
 * Fallback provider for ZombieCoder Agent System
 */

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
    index: number;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiProvider {
  private apiKey: string;
  private model: string = 'gemini-flash-latest';
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';
  private timeout: number = 30000;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  /**
   * Check if Gemini is configured
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Convert standard messages to Gemini format
   */
  private convertMessages(messages: Array<{ role: string; content: string }>): GeminiMessage[] {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }

  /**
   * Send message to Gemini API
   */
  async sendMessage(
    messages: Array<{ role: string; content: string }>,
    options?: { model?: string }
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const geminiMessages = this.convertMessages(messages);

      const preferredModel = options?.model || this.model;
      const modelCandidates = Array.from(
        new Set([
          preferredModel,
          'gemini-1.5-flash-latest',
          'gemini-1.5-pro-latest',
          'gemini-2.0-flash',
          'gemini-2.0-flash-lite',
        ])
      );

      let lastError: unknown = null;

      for (const model of modelCandidates) {
        const response = await fetch(
          `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: geminiMessages,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              },
            }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({} as any));
          const message = error?.error?.message || response.statusText;
          const isModelNotFound =
            typeof message === 'string' &&
            (message.includes('is not found') ||
              message.includes('not supported') ||
              message.includes('models/'));

          lastError = new Error(`Gemini error: ${message}`);
          if (isModelNotFound) {
            continue;
          }

          throw lastError;
        }

        const data: GeminiResponse = await response.json();
        return data.candidates[0]?.content?.parts?.[0]?.text || '';
      }

      throw lastError || new Error('Gemini error: No compatible model found');
    } catch (err) {
      console.error('[Gemini] Error:', err);
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Check if Gemini API is accessible
   */
  async isAvailable(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${this.baseUrl}/models?key=${this.apiKey}`,
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Stream message from Gemini
   */
  async *streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: { model?: string }
  ): AsyncGenerator<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const geminiMessages = this.convertMessages(messages);
      const model = options?.model || this.model;

      const response = await fetch(
        `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini stream error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Gemini stream response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        /**
         * Gemini stream (v1beta) returns a JSON array [{},{},...] over the life of the stream.
         * We need to find objects {} inside the buffer.
         */
        let startIdx: number;
        while ((startIdx = buffer.indexOf('{')) !== -1) {
          let depth = 0;
          let endIdx = -1;

          for (let i = startIdx; i < buffer.length; i++) {
            if (buffer[i] === '{') depth++;
            else if (buffer[i] === '}') {
              depth--;
              if (depth === 0) {
                endIdx = i;
                break;
              }
            }
          }

          if (endIdx !== -1) {
            const jsonStr = buffer.substring(startIdx, endIdx + 1);
            buffer = buffer.substring(endIdx + 1);

            try {
              const data = JSON.parse(jsonStr) as GeminiResponse;
              const chunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (chunk) yield chunk;
            } catch (e) {
              // Not a full object yet or parse error
            }
          } else {
            // No full object in buffer yet
            break;
          }
        }
      }
    } catch (err) {
      console.error('[v0] Gemini streaming error:', err);
      throw err;
    }
  }

  /**
   * Log usage to database (placeholder for analytics)
   */
  async logUsage(
    sessionId: string,
    userId: string,
    input: string,
    output: string,
    tokensUsed?: number
  ): Promise<void> {
    console.log('[Gemini] Usage logged:', {
      sessionId,
      userId,
      model: this.model,
      inputLength: input.length,
      outputLength: output.length,
      tokensUsed: tokensUsed || 0,
      timestamp: new Date().toISOString(),
    });
  }
}

// Singleton instance
let geminiProvider: GeminiProvider | null = null;

export function getGeminiProvider(): GeminiProvider {
  if (!geminiProvider) {
    geminiProvider = new GeminiProvider();
  }
  return geminiProvider;
}

export default GeminiProvider;
