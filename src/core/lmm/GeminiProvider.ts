import { LMMAdapter, LMMExecutionResult } from './LMMAdapter';
import { LMMVisionRequest, LMMVisionResponse, DEFAULT_LMM_SYSTEM_PROMPT } from './types';
import { cleanAndParseJson } from './jsonSanitizer';

export class GeminiProvider implements LMMAdapter {
  id = 'gemini';
  name = 'Google Gemini';

  async analyzeImageAndText(
    request: LMMVisionRequest,
    apiKey: string,
    model = 'gemini-2.0-flash'
  ): Promise<LMMExecutionResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const effectiveIntent =
      request.intent === 'other' && request.customIntentText
        ? `Personalizado: ${request.customIntentText}`
        : request.intent;

    const basePrompt = request.customPrompt || DEFAULT_LMM_SYSTEM_PROMPT;
    const prompt = basePrompt
      .replace('{RAW_TEXT}', request.rawText)
      .replace('{INTENT}', effectiveIntent);

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/webp',
                data: request.imageBase64WebP.replace(/^data:image\/[a-z]+;base64,/, ''),
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Temperatura determinista para evitar variaciones estocásticas
      },
    };

    const rawPayloadSent = JSON.stringify(
      {
        provider: 'Google Gemini',
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
      `%c[YText LMM] 🚀 Enviando petición a Google Gemini (${model})...`,
      'color: #2563eb; font-weight: bold;',
      {
        intent: effectiveIntent,
        rawText: request.rawText,
        temperature: 0.2,
        imageWebPSizeKB: Math.round(request.imageBase64WebP.length / 1024),
      }
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // Timeout estricto de 20s

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      const isAbort = fetchErr instanceof Error && fetchErr.name === 'AbortError';
      if (isAbort) {
        throw new Error('Tiempo de espera agotado (Timeout 20s): Google Gemini no respondió a tiempo.');
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `%c[YText LMM] ❌ Error Gemini (${res.status}) tras ${latencyMs}ms:`,
        'color: #dc2626; font-weight: bold;',
        errText
      );
      throw new Error(`Gemini API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      throw new Error('No se recibió contenido en la respuesta de Google Gemini');
    }

    console.log(
      `%c[YText LMM] ✅ Respuesta recibida de Gemini en ${latencyMs}ms:`,
      'color: #16a34a; font-weight: bold;',
      rawContent
    );

    const parsed = cleanAndParseJson<LMMVisionResponse>(rawContent);
    return {
      response: parsed,
      rawPayloadSent,
      rawResponseText: rawContent,
    };
  }
}
