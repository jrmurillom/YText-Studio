import { LMMAdapter } from './LMMAdapter';
import { LMMVisionRequest, LMMVisionResponse } from './types';

export class GeminiProvider implements LMMAdapter {
  id = 'gemini';
  name = 'Google Gemini';

  async analyzeImageAndText(
    request: LMMVisionRequest,
    apiKey: string,
    model = 'gemini-2.0-flash'
  ): Promise<LMMVisionResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `Act as an expert YouTube Thumbnail Packaging Director and Visual Designer.
Analyze this video cover base image and the base text: "${request.rawText}".
The intended emotional atmosphere / hook is: "${request.intent}".

Output a valid JSON matching this schema:
{
  "analysis": {
    "subjectZone": "LEFT_HALF" | "RIGHT_HALF" | "CENTER" | "FULL_BOTTOM",
    "recommendedPlacement": "TOP_LEFT" | "CENTER_LEFT" | "BOTTOM_LEFT" | "TOP_RIGHT" | "CENTER_RIGHT" | "TOP_CENTER",
    "dominantColors": ["#hex", "#hex"],
    "contrastAccentColor": "#hex"
  },
  "segmentation": {
    "lines": [
      {
        "text": "short hook (2-3 words)",
        "role": "anchor_secondary" | "power_primary",
        "suggestedPresetId": "mrbeast_pop" | "docu_drama" | "gaming_neon" | "authority_badge",
        "fontSizeRatio": 0.7 or 1.0,
        "colorHex": "#hex",
        "strokeColorHex": "#hex"
      }
    ]
  },
  "reasoning": "Brief explanation"
}`;

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
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      throw new Error('No content returned from Gemini');
    }

    return JSON.parse(rawContent) as LMMVisionResponse;
  }
}
