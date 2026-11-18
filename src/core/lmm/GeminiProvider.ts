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
        ? `Custom mood & style direction (visual mood only, DO NOT use as literal thumbnail words): ${request.customIntentText.trim()}`
        : `Tone & energy preset: ${request.intent} (visual mood only, DO NOT write "${request.intent}" or its translations in thumbnail text)`;

    const count = request.proposalCount || 3;
    const prompt = DEFAULT_LMM_SYSTEM_PROMPT
      .replace(/\{RAW_TEXT\}/g, () => request.rawText.trim())
      .replace(/\{INTENT\}/g, () => effectiveIntent)
      .replace(/\{PROPOSAL_COUNT\}/g, () => String(count));

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
        temperature: 0.65, // Punto dulce creativo con JSON restringido para garantizar variedad de propuestas
      },
    };

    const rawPayloadSent = JSON.stringify(
      {
        provider: 'Google Gemini',
        model,
        temperature: 0.65,
        intent: effectiveIntent,
        rawTextEnviado: request.rawText,
        promptCompleto: prompt,
        imageSizeKB: Math.round((request.imageBase64WebP.length * 0.75) / 1024),
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
        temperature: 0.65,
        imageWebPSizeKB: Math.round((request.imageBase64WebP.length * 0.75) / 1024),
      }
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // Timeout ampliado de 3 minutos (180s) para vision multimodal

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
        throw new Error('Timeout exceeded (3 min): Google Gemini did not respond in time.');
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
