import { describe, it, expect } from 'vitest';
import { VisionAnalysisPipeline } from './VisionAnalysisPipeline';
import { LMMConfig } from '@/types';

describe('VisionAnalysisPipeline (Dirección de Arte 100% Autónoma)', () => {
  const dummyConfig: LMMConfig = {
    provider: 'gemini',
    apiKey: '', // Modo local / fallback explícito
    model: 'gemini-2.0-flash',
  };

  it('genera 3 propuestas dinámicas completamente diferenciadas en copy, tipografía y cuadrante', async () => {
    const dummyWebP = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoIAAUAAUA8JaQAA3AA/v30NAAA';
    const result = await VisionAnalysisPipeline.execute(
      dummyWebP,
      'EL SECRETO DE LAS PIRÁMIDES',
      'mystery',
      dummyConfig
    );

    expect(result.isOfflineFallback).toBe(true);
    expect(result.proposals).toHaveLength(3);

    const [propA, propB, propC] = result.proposals;

    // Verificar que cada propuesta tiene su propia identidad tipográfica
    expect(propA.fontFamily).toBe('Anton');
    expect(propB.fontFamily).toBe('Bebas Neue');
    expect(propC.fontFamily).toBe('Poppins');

    // Verificar que las 3 tienen copys creativos diferentes
    expect(propA.copySummary).not.toEqual(propB.copySummary);
    expect(propB.copySummary).not.toEqual(propC.copySummary);

    // Verificar que los segmentos contienen colores y estilos específicos
    expect(propA.previewGroup.segments[0].colorHex).toBe('#FFFFFF');
    expect(propB.previewGroup.segments[1].colorHex).toBe('#38BDF8');
    expect(propC.previewGroup.segments[0].hasBadge).toBe(true);

    // Telemetría con reporte de razonamiento
    expect(result.telemetry).toBeDefined();
    expect(result.telemetry.reasoning).toContain('mystery');
    expect(result.telemetry.isOfflineFallback).toBe(true);
  });

  it('jamas contamina el texto de la miniatura con las palabras de customIntentText cuando intent es other', async () => {
    const dummyWebP = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoIAAUAAUA8JaQAA3AA/v30NAAA';
    const customDirective = 'Cyberpunk retro synthwave dark comedy';

    const result = await VisionAnalysisPipeline.execute(
      dummyWebP,
      'SOBREVIVÍ 100 DÍAS',
      'other',
      { ...dummyConfig, proposalCount: 5 },
      customDirective,
      true
    );

    expect(result.proposals).toHaveLength(5);

    for (const prop of result.proposals) {
      const upperSummary = prop.copySummary.toUpperCase();
      expect(upperSummary).not.toContain('CYBERPUNK');
      expect(upperSummary).not.toContain('SYNTHWAVE');
      expect(upperSummary).not.toContain('COMEDY');

      for (const seg of prop.previewGroup.segments) {
        const upperText = seg.text.toUpperCase();
        expect(upperText).not.toContain('CYBERPUNK');
        expect(upperText).not.toContain('SYNTHWAVE');
        expect(upperText).not.toContain('COMEDY');
      }
    }
  });
});
