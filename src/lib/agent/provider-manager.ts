import type { OllamaMessage } from './providers/ollama';
import { getOllamaProvider } from './providers/ollama';
import { getOpenAIProvider } from './providers/openai';
import { getGeminiProvider } from './providers/gemini';
import { prependSystemPrompt } from './system-prompt';

export type ManagedProvider = 'ollama' | 'openai' | 'gemini' | 'manual';

export interface ManagedAIResponse {
  content: string;
  provider: ManagedProvider;
  executionTime: number;
}

export interface ProviderOverrides {
  provider?: Exclude<ManagedProvider, 'manual'>;
  model?: string;
}

export class ProviderManager {
  async sendMessage(
    messages: OllamaMessage[],
    overrides?: ProviderOverrides
  ): Promise<ManagedAIResponse> {
    const startTime = Date.now();
    const withSystem = prependSystemPrompt(messages);

    if (overrides?.provider === 'ollama') {
      try {
        const ollama = getOllamaProvider();
        const content = await ollama.sendMessage(withSystem, { model: overrides.model });
        return { content, provider: 'ollama', executionTime: Date.now() - startTime };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: `Forced provider ollama failed: ${msg}`,
          provider: 'manual',
          executionTime: Date.now() - startTime,
        };
      }
    }

    if (overrides?.provider === 'openai') {
      try {
        const openai = getOpenAIProvider();
        if (!openai.isConfigured()) {
          return {
            content: 'Forced provider openai failed: OPENAI_API_KEY not configured',
            provider: 'manual',
            executionTime: Date.now() - startTime,
          };
        }
        const content = await openai.sendMessage(withSystem, { model: overrides.model });
        return { content, provider: 'openai', executionTime: Date.now() - startTime };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: `Forced provider openai failed: ${msg}`,
          provider: 'manual',
          executionTime: Date.now() - startTime,
        };
      }
    }

    if (overrides?.provider === 'gemini') {
      try {
        const gemini = getGeminiProvider();
        if (!gemini.isConfigured()) {
          return {
            content: 'Forced provider gemini failed: GEMINI_API_KEY not configured',
            provider: 'manual',
            executionTime: Date.now() - startTime,
          };
        }
        const content = await gemini.sendMessage(withSystem, { model: overrides.model });
        return { content, provider: 'gemini', executionTime: Date.now() - startTime };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: `Forced provider gemini failed: ${msg}`,
          provider: 'manual',
          executionTime: Date.now() - startTime,
        };
      }
    }

    try {
      const ollama = getOllamaProvider();
      if (await ollama.isAvailable()) {
        const content = await ollama.sendMessage(withSystem, { model: overrides?.model });
        return { content, provider: 'ollama', executionTime: Date.now() - startTime };
      }
    } catch {
      // fallback
    }

    try {
      const openai = getOpenAIProvider();
      if (openai.isConfigured() && (await openai.isAvailable())) {
        const content = await openai.sendMessage(withSystem, { model: overrides?.model });
        return { content, provider: 'openai', executionTime: Date.now() - startTime };
      }
    } catch {
      // fallback
    }

    try {
      const gemini = getGeminiProvider();
      if (gemini.isConfigured() && (await gemini.isAvailable())) {
        const content = await gemini.sendMessage(withSystem, { model: overrides?.model });
        return { content, provider: 'gemini', executionTime: Date.now() - startTime };
      }
    } catch {
      // fallback
    }

    return {
      content:
        'I could not connect to any AI provider. Please ensure Ollama is running at http://localhost:11434, ' +
        'or configure OPENAI_API_KEY or GEMINI_API_KEY environment variable for cloud fallback.',
      provider: 'manual',
      executionTime: Date.now() - startTime,
    };
  }
}

let providerManager: ProviderManager | null = null;

export function getProviderManager(): ProviderManager {
  if (!providerManager) providerManager = new ProviderManager();
  return providerManager;
}
