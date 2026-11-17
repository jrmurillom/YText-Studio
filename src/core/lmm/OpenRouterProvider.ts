import { LMMAdapter, LMMExecutionResult } from './LMMAdapter';
import { LMMVisionRequest, LMMVisionResponse, DEFAULT_LMM_SYSTEM_PROMPT } from './types';
import { cleanAndParseJson } from './jsonSanitizer';

export class OpenRouterProvider implements LMMAdapter {
  id = 'openrouter';
  name = 'OpenRouter (Universal)';

  async analyzeImageAndText(
    request: LMMVisionRequest,
    apiKey: string,
    model = 'anthropic/claude-3.5-sonnet',
    customEndpoint = 'https://openrouter.ai/api/v1/chat/completions'
  ): Promise<LMMExecutionResult> {
    const effectiveIntent =
      request.intent === 'other' && request.customIntentText
        ? `Personalizado: ${request.customIntentText}`
        : request.intent;

    const count = request.proposalCount || 3;
    const basePrompt = request.customPrompt || DEFAULT_LMM_SYSTEM_PROMPT;
    const prompt = `${basePrompt
      .replace('{RAW_TEXT}', request.rawText)
      .replace('{INTENT}', effectiveIntent)
      .replace(/{PROPOSAL_COUNT}/g, String(count))}

IMPORTANT: Return strictly a raw JSON object matching the requested schema. No code fences, no conversational prose.`;

    const imageUrl = request.imageBase64WebP.startsWith('data:')
      ? request.imageBase64WebP
      : `data:image/webp;base64,${request.imageBase64WebP}`;

    const payload = {
      model,
      temperature: 0.2, // Temperatura determinista para máxima disciplina y consistencia
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    };

    const rawPayloadSent = JSON.stringify(
      {
        endpoint: customEndpoint,
        model,
        temperature: 0.2,
        intent: effectiveIntent,
        rawTextEnviado: request.rawText,
        promptCompleto: prompt,
        imageSizeKB: Math.round(request.imageBase64WebP.length / 1024),
      },
      null,
      2
    );

    const startTime = performance.now();
    console.log(
      `%c[YText LMM] 🚀 Enviando petición a OpenRouter (${model})...`,
      'color: #2563eb; font-weight: bold;',
      {
        endpoint: customEndpoint,
        intent: effectiveIntent,
        rawText: request.rawText,
        temperature: 0.2,
      }
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // Timeout estricto de 20s para evitar cuelgues indefinidos

    let res: Response;
    try {
      res = await fetch(customEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/antigravity/ytext',
          'X-Title': 'YText Studio',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      const isAbort = fetchErr instanceof Error && fetchErr.name === 'AbortError';
      if (isAbort) {
        throw new Error('Tiempo de espera agotado (Timeout 20s): El proveedor OpenRouter no respondió a tiempo.');
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const err = await res.text();
      console.error(
        `%c[YText LMM] ❌ Error OpenRouter (${res.status}) tras ${latencyMs}ms:`,
        'color: #dc2626; font-weight: bold;',
        err
      );
      throw new Error(`OpenRouter / LMM API Error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió contenido del proveedor LMM / OpenRouter');
    }

    console.log(
      `%c[YText LMM] ✅ Respuesta recibida de OpenRouter en ${latencyMs}ms:`,
      'color: #16a34a; font-weight: bold;',
      content
    );

    const parsed = cleanAndParseJson<LMMVisionResponse>(content);
    return {
      response: parsed,
      rawPayloadSent,
      rawResponseText: content,
    };
  }
}
