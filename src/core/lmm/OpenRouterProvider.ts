import { LMMAdapter } from './LMMAdapter';
import { LMMVisionRequest, LMMVisionResponse } from './types';

export class OpenRouterProvider implements LMMAdapter {
  id = 'openrouter';
  name = 'OpenRouter (Universal)';

  async analyzeImageAndText(
    request: LMMVisionRequest,
    apiKey: string,
    model = 'anthropic/claude-3.5-sonnet',
    customEndpoint = 'https://openrouter.ai/api/v1/chat/completions'
  ): Promise<LMMVisionResponse> {
    const prompt = `Act as an expert YouTube Thumbnail Packaging Director.
Analyze this cover image and base text: "${request.rawText}". Intent: "${request.intent}".
Return ONLY a valid JSON object matching the requested schema without markdown quotes or explanation outside the JSON.`;

    const imageUrl = request.imageBase64WebP.startsWith('data:')
      ? request.imageBase64WebP
      : `data:image/webp;base64,${request.imageBase64WebP}`;

    const payload = {
      model,
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

    const res = await fetch(customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/antigravity/ytext',
        'X-Title': 'YText Studio',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter Error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content from OpenRouter');

    return JSON.parse(content) as LMMVisionResponse;
  }
}
