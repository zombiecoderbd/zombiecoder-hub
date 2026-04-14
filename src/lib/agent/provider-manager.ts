import type { OllamaMessage } from './providers/ollama';
import { getOllamaProvider } from './providers/ollama';
import { getOpenAIProvider } from './providers/openai';
import { getGeminiProvider } from './providers/gemini';
import { prependSystemPrompt } from './system-prompt';

export type ManagedProvider = 'ollama' | 'openai' | 'gemini' | 'manual';

export interface ManagedAIResponse {
  content: string;
  provider: ManagedProvider;
  model?: string;
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
    // ... earlier implementation remains ...
    // (omitted for brevity in replace_file_content but this tool handles full replacement within range)
    const startTime = Date.now();
    const withSystem = prependSystemPrompt(messages);

    if (overrides?.provider === 'ollama') {
      try {
        const ollama = getOllamaProvider();
        const model = overrides.model;
        const content = await ollama.sendMessage(withSystem, { model });
        return { content, provider: 'ollama', model, executionTime: Date.now() - startTime };
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
        const model = overrides.model;
        const content = await openai.sendMessage(withSystem, { model });
        return { content, provider: 'openai', model, executionTime: Date.now() - startTime };
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
        const model = overrides.model;
        const content = await gemini.sendMessage(withSystem, { model });
        return { content, provider: 'gemini', model, executionTime: Date.now() - startTime };
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
        const model = overrides?.model;
        const content = await ollama.sendMessage(withSystem, { model });
        return { content, provider: 'ollama', model, executionTime: Date.now() - startTime };
      }
    } catch {
      // fallback
    }

    try {
      const openai = getOpenAIProvider();
      if (openai.isConfigured() && (await openai.isAvailable())) {
        const model = overrides?.model;
        const content = await openai.sendMessage(withSystem, { model });
        return { content, provider: 'openai', model, executionTime: Date.now() - startTime };
      }
    } catch {
      // fallback
    }

    try {
      const gemini = getGeminiProvider();
      if (gemini.isConfigured() && (await gemini.isAvailable())) {
        const model = overrides?.model;
        const content = await gemini.sendMessage(withSystem, { model });
        return { content, provider: 'gemini', model, executionTime: Date.now() - startTime };
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

  /**
   * Stream message from managed providers
   */
  async *streamMessage(
    messages: OllamaMessage[],
    overrides?: ProviderOverrides
  ): AsyncGenerator<{ content: string; provider: ManagedProvider }> {
    const withSystem = prependSystemPrompt(messages);
    const providerKey = overrides?.provider;

    if (providerKey === 'ollama') {
      const ollama = getOllamaProvider();
      for await (const chunk of ollama.streamChat(withSystem, { model: overrides.model })) {
        yield { content: chunk, provider: 'ollama' };
      }
      return;
    }

    if (providerKey === 'gemini') {
      const gemini = getGeminiProvider();
      for await (const chunk of gemini.streamChat(withSystem, { model: overrides.model })) {
        yield { content: chunk, provider: 'gemini' };
      }
      return;
    }

    // Default: try Ollama then Gemini
    try {
      const ollama = getOllamaProvider();
      if (await ollama.isAvailable()) {
        for await (const chunk of ollama.streamChat(withSystem, { model: overrides?.model })) {
          yield { content: chunk, provider: 'ollama' };
        }
        return;
      }
    } catch {}

    const gemini = getGeminiProvider();
    if (gemini.isConfigured() && (await gemini.isAvailable())) {
      for await (const chunk of gemini.streamChat(withSystem, { model: overrides?.model })) {
        yield { content: chunk, provider: 'gemini' };
      }
      return;
    }

    yield { content: 'No streaming provider available.', provider: 'manual' };
  }
}

let providerManager: ProviderManager | null = null;

export function getProviderManager(): ProviderManager {
  if (!providerManager) providerManager = new ProviderManager();
  return providerManager;
}
