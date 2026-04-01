import { getDbClient } from '../db/client';

/**
 * AI Provider types - supports local and cloud models
 * Local: Ollama (free, runs on modest hardware)
 * Cloud: OpenAI, Gemini (fallback for complex tasks)
 */

export type ProviderType = 'ollama' | 'openai' | 'gemini';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: ProviderType;
  tokensUsed?: number;
  executionTime: number;
}

export interface ProviderConfig {
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Abstract provider for all AI models
 */
export abstract class AIProvider {
  protected config: ProviderConfig;
  protected name: string;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.name = config.type;
  }

  abstract sendMessage(messages: AIMessage[]): Promise<AIResponse>;
  abstract validateConnection(): Promise<boolean>;

  protected logUsage(response: AIResponse): Promise<void> {
    const db = getDbClient();
    return db.auditLog.create({
      data: {
        action: `AI_CALL_${this.name.toUpperCase()}`,
        resource: 'ai_provider',
        resourceId: this.config.model,
        details: JSON.stringify({
          provider: this.config.type,
          model: this.config.model,
          tokensUsed: response.tokensUsed,
          executionTime: response.executionTime,
        }),
      },
    });
  }
}

/**
 * Ollama Provider - Local AI model (free, runs on modest hardware)
 * Perfect for: Common people without cloud access, local Ulama
 */
export class OllamaProvider extends AIProvider {
  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama2') {
    super({
      type: 'ollama',
      baseUrl,
      model,
      temperature: 0.7,
      maxTokens: 2048,
    });
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    const startTime = Date.now();
    const baseUrl = this.config.baseUrl || 'http://localhost:11434';

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: messages.map((m) => `${m.role}: ${m.content}`).join('\n'),
          temperature: this.config.temperature,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result: AIResponse = {
        content: data.response || '',
        model: this.config.model,
        provider: 'ollama',
        executionTime: Date.now() - startTime,
      };

      await this.logUsage(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Ollama provider failed: ${message}. Is Ollama running at ${baseUrl}?`);
    }
  }

  async validateConnection(): Promise<boolean> {
    const baseUrl = this.config.baseUrl || 'http://localhost:11434';
    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * OpenAI Provider - Cloud AI (fallback for complex tasks)
 * Used when local model cannot handle the task
 */
export class OpenAIProvider extends AIProvider {
  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    super({
      type: 'openai',
      apiKey,
      model,
      temperature: 0.7,
      maxTokens: 2048,
    });
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    const startTime = Date.now();

    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const result: AIResponse = {
        content: data.choices[0]?.message?.content || '',
        model: this.config.model,
        provider: 'openai',
        tokensUsed: data.usage?.total_tokens,
        executionTime: Date.now() - startTime,
      };

      await this.logUsage(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OpenAI provider failed: ${message}`);
    }
  }

  async validateConnection(): Promise<boolean> {
    if (!this.config.apiKey) return false;
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Provider Manager - Handles fallback chain
 * Primary: Ollama (local, free)
 * Fallback 1: OpenAI (cloud)
 * Fallback 2: Gemini (cloud, if available)
 */
export class ProviderManager {
  private providers: AIProvider[] = [];
  private primaryProvider: AIProvider;

  constructor(config: {
    ollamaUrl?: string;
    ollamaModel?: string;
    openaiKey?: string;
    geminiKey?: string;
  }) {
    // Always start with Ollama (local, free)
    this.providers.push(
      new OllamaProvider(config.ollamaUrl, config.ollamaModel || 'llama2')
    );

    // Add OpenAI fallback if API key provided
    if (config.openaiKey) {
      this.providers.push(new OpenAIProvider(config.openaiKey, 'gpt-3.5-turbo'));
    }

    // Note: Gemini support can be added similarly
    // if (config.geminiKey) { ... }

    this.primaryProvider = this.providers[0]!;
  }

  /**
   * Send message with automatic fallback
   * Tries each provider in order until one succeeds
   */
  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    let lastError: Error | null = null;

    for (const provider of this.providers) {
      try {
        const isHealthy = await provider.validateConnection();
        if (!isHealthy) {
          console.log(`[v0] Provider ${provider['name']} health check failed, trying next...`);
          continue;
        }

        return await provider.sendMessage(messages);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.log(`[v0] Provider ${provider['name']} failed: ${lastError.message}`);
        continue;
      }
    }

    // All providers failed
    throw new Error(
      `All AI providers failed. Last error: ${lastError?.message || 'Unknown'}. ` +
        `Please ensure Ollama is running locally or configure OpenAI API key.`
    );
  }

  /**
   * Get primary provider info
   */
  getPrimaryProvider(): { type: ProviderType; model: string } {
    return {
      type: this.primaryProvider['config'].type,
      model: this.primaryProvider['config'].model,
    };
  }

  /**
   * Check which providers are available
   */
  async getAvailableProviders(): Promise<ProviderType[]> {
    const available: ProviderType[] = [];

    for (const provider of this.providers) {
      const isHealthy = await provider.validateConnection();
      if (isHealthy) {
        available.push(provider['config'].type);
      }
    }

    return available;
  }
}

/**
 * Singleton instance
 */
let providerManager: ProviderManager | null = null;

export function getProviderManager(): ProviderManager {
  if (!providerManager) {
    providerManager = new ProviderManager({
      ollamaUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      ollamaModel: process.env.OLLAMA_MODEL || 'llama2',
      openaiKey: process.env.OPENAI_API_KEY,
      geminiKey: process.env.GEMINI_API_KEY,
    });
  }
  return providerManager;
}
