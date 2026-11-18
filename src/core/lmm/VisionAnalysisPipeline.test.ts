import { describe, it, expect, vi, afterEach } from 'vitest';
import { VisionAnalysisPipeline } from './VisionAnalysisPipeline';
import { LMMService } from './LMMService';
import { LMMConfig } from '@/types';

describe('VisionAnalysisPipeline (Dirección de Arte 100% Autónoma - Cero Heurística)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const dummyConfig: LMMConfig = {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.0-flash',
  };

  it('lanza error explícito si no hay API key configurada ("no se avanza")', async () => {
    const dummyWebP = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoIAAUAAUA8JaQAA3AA/v30NAAA';

    await expect(
      VisionAnalysisPipeline.execute(
        dummyWebP,
        'EL SECRETO DE LAS PIRÁMIDES',
        'mystery',
        dummyConfig
      )
    ).rejects.toThrow('API Key required');
  });

  it('si el LMM falla o devuelve datos corruptos, lanza error sin inventar propuestas fake', async () => {
    vi.spyOn(LMMService, 'analyze').mockResolvedValueOnce({
      response: {
        proposals: [{ id: 'broken_p1' }], // Falta lines array
      } as unknown as any,
      rawPayloadSent: '{}',
      rawResponseText: '{}',
    });

    const dummyWebP = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoIAAUAAUA8JaQAA3AA/v30NAAA';

    await expect(
      VisionAnalysisPipeline.execute(
        dummyWebP,
        'MI TITULO',
        'hype',
        { ...dummyConfig, apiKey: 'test-key-123' },
        undefined,
        true
      )
    ).rejects.toThrow('Model returned an incomplete or invalid data structure.');
  });

  it('cuando el LMM responde con propuestas válidas, las mapea correctamente con telemetría', async () => {
    vi.spyOn(LMMService, 'analyze').mockResolvedValueOnce({
      response: {
        analysis: {
          subjectZone: 'RIGHT_HALF',
          detectedNegativeSpace: ['TOP_LEFT'],
          dominantColors: ['#000000'],
          contrastAccentColor: '#FFE600',
        },
        reasoning: 'Composición de alto impacto en cuadrante superior izquierdo.',
        proposals: [
          {
            id: 'prop_real_1',
            title: 'Option A: Real AI Hook',
            concept: 'Punchy text in negative space',
            placement: 'TOP_LEFT',
            fontFamily: 'Anton',
            rotation: -2,
            hasBadge: false,
            lines: [
              {
                text: 'EL SECRETO',
                role: 'anchor_secondary',
                fontSizeRatio: 0.7,
                colorHex: '#FFFFFF',
                strokeColorHex: '#000000',
                strokeWidth: 12,
                shadowColorHex: '#000000',
                shadowDepth: 4,
              },
              {
                text: 'DE LAS PIRÁMIDES',
                role: 'power_primary',
                fontSizeRatio: 1.0,
                colorHex: '#FFE600',
                strokeColorHex: '#000000',
                strokeWidth: 16,
                shadowColorHex: '#000000',
                shadowDepth: 6,
              },
            ],
          },
        ],
      },
      rawPayloadSent: '{"prompt": "mock"}',
      rawResponseText: '{"proposals": [...]}',
    });

    const dummyWebP = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoIAAUAAUA8JaQAA3AA/v30NAAA';
    const result = await VisionAnalysisPipeline.execute(
      dummyWebP,
      'EL SECRETO DE LAS PIRÁMIDES',
      'mystery',
      { ...dummyConfig, apiKey: 'test-key-123' },
      undefined,
      true
    );

    expect(result.isOfflineFallback).toBe(false);
    expect(result.proposals).toHaveLength(1);
    expect(result.proposals[0].id).toBe('prop_real_1');
    expect(result.proposals[0].fontFamily).toBe('Anton');
    expect(result.proposals[0].previewGroup.segments).toHaveLength(2);
    expect(result.proposals[0].previewGroup.segments[0].text).toBe('EL SECRETO');
    expect(result.telemetry.isOfflineFallback).toBe(false);
    expect(result.telemetry.provider).toBe('gemini');
  });
});
