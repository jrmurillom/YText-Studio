import { CompositeTextGroup } from '@/types';

export interface ReadabilityReport {
  score: number; // 0 - 100
  level: 'optimal' | 'acceptable' | 'critical';
  wordCount: number;
  projectedMobileFontSize: number;
  label: string;
}

export class ReadabilityCalculator {
  /**
   * Calcula el Thumbnail Readability Index (TRI) según la fórmula de STANDARDS.md
   */
  static calculate(group: CompositeTextGroup | null): ReadabilityReport {
    if (!group || group.segments.length === 0) {
      return {
        score: 100,
        level: 'optimal',
        wordCount: 0,
        projectedMobileFontSize: 24,
        label: 'No text',
      };
    }

    // 1. Contar palabras totales de todos los segmentos
    const fullText = group.segments.map((s) => s.text.trim()).join(' ');
    const words = fullText.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // 2. Penalización por densidad de palabras (W)
    let penaltyWords = 0;
    if (wordCount > 6) {
      penaltyWords = 60;
    } else if (wordCount >= 4) {
      penaltyWords = 15 * (wordCount - 3);
    }

    // 3. Tamaño de fuente proyectado en feed móvil de 320x180 px
    // Escala del master canvas (1280) a móvil (320) = factor 0.25
    const primarySegment = group.segments.find((s) => s.role === 'power_primary') || group.segments[0];
    const baseFontSize = primarySegment.fontSize * group.scale;
    const projectedMobileFontSize = Math.round(baseFontSize * (320 / 1280));

    // 4. Penalización por tamaño de fuente proyectado en móvil
    let penaltySize = 0;
    if (projectedMobileFontSize < 10) {
      penaltySize = 50;
    } else if (projectedMobileFontSize < 18) {
      penaltySize = Math.round(10 * (18 - projectedMobileFontSize));
    }

    // 5. Cálculo del score continuo (0 - 100)
    const rawScore = 100 - (penaltyWords + penaltySize);
    const score = Math.max(10, Math.min(100, rawScore));

    let level: 'optimal' | 'acceptable' | 'critical' = 'optimal';
    let label = 'Optimal for mobile';

    if (score < 65) {
      level = 'critical';
      label = 'Illegible on mobile';
    } else if (score < 85) {
      level = 'acceptable';
      label = 'Acceptable';
    }

    return {
      score,
      level,
      wordCount,
      projectedMobileFontSize,
      label,
    };
  }
}
