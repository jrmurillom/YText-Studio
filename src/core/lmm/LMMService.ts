import { LMMAdapter, LMMExecutionResult } from './LMMAdapter';
import { GeminiProvider } from './GeminiProvider';
import { OpenRouterProvider } from './OpenRouterProvider';
import { LMMVisionRequest } from './types';
import { LMMConfig } from '@/types';

export class LMMService {
  private static adapters: Map<string, LMMAdapter> = new Map([
    ['gemini', new GeminiProvider()],
    ['openrouter', new OpenRouterProvider()],
    ['openai', new OpenRouterProvider()], // Usa la misma interfaz OpenAI-compatible
    ['ollama', new OpenRouterProvider()],
  ]);

  static async analyze(request: LMMVisionRequest, config: LMMConfig): Promise<LMMExecutionResult> {
    const adapter = this.adapters.get(config.provider);
    if (!adapter) {
      throw new Error(`Proveedor de LMM no soportado: ${config.provider}`);
    }

    let endpoint: string | undefined;
    if (config.provider === 'openai') {
      endpoint = 'https://api.openai.com/v1/chat/completions';
    } else if (config.provider === 'ollama') {
      endpoint = config.customEndpoint || 'http://localhost:11434/v1/chat/completions';
    }

    return adapter.analyzeImageAndText(request, config.apiKey, config.model, endpoint);
  }
}
