import { CompositeTextGroup } from '@/types';

export interface ReadabilityReport {
  score: number; // 0 - 100
  level: 'optimal' | 'acceptable' | 'critical';
  wordCount: number;
  projectedMobileFontSize: number;
  label: string;
  isContrastProtected: boolean;
  unprotectedLinesCount: number;
}

export class ReadabilityCalculator {
  /**
   * Calcula el Thumbnail Readability Index (TRI) según la fórmula de STANDARDS.md
   * Evalúa de forma reactiva y holística todas las líneas del grupo compuesto.
   */
  static calculate(group: CompositeTextGroup | null): ReadabilityReport {
    if (!group || group.segments.length === 0) {
      return {
        score: 100,
        level: 'optimal',
        wordCount: 0,
        projectedMobileFontSize: 24,
        label: 'No text',
        isContrastProtected: true,
        unprotectedLinesCount: 0,
      };
    }

    // 1. Contar palabras totales de todos los segmentos con texto
    const nonEmptySegments = group.segments.filter((s) => s.text.trim().length > 0);
    const targetSegments = nonEmptySegments.length > 0 ? nonEmptySegments : group.segments;

    const fullText = targetSegments.map((s) => s.text.trim()).join(' ');
    const words = fullText.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // 2. Penalización por densidad de palabras (W)
    let penaltyWords = 0;
    if (wordCount > 6) {
      penaltyWords = 60;
    } else if (wordCount >= 4) {
      penaltyWords = 15 * (wordCount - 3);
    }

    // 3. Tamaño de fuente proyectado en feed móvil de 320x180 px (factor 0.25)
    // Se calcula el tamaño ponderado de todas las líneas activas, considerando el rol power_primary
    const totalWeight = targetSegments.reduce(
      (acc, s) => acc + (s.role === 'power_primary' ? 1.5 : 1) * Math.max(1, s.text.trim().length),
      0
    );
    const weightedSizeSum = targetSegments.reduce((acc, s) => {
      const sProj = s.fontSize * group.scale * (320 / 1280);
      const w = (s.role === 'power_primary' ? 1.5 : 1) * Math.max(1, s.text.trim().length);
      return acc + sProj * w;
    }, 0);

    const projectedMobileFontSize = Math.round(weightedSizeSum / (totalWeight || 1));

    // 4. Penalización por tamaño de fuente proyectado en móvil
    let penaltySize = 0;
    if (projectedMobileFontSize < 10) {
      penaltySize = 50;
    } else if (projectedMobileFontSize < 18) {
      penaltySize = Math.round(10 * (18 - projectedMobileFontSize));
    }

    // Penalización adicional si alguna línea visible individual cae en rango crítico (<10px)
    const minLineProjectedSize = Math.min(
      ...targetSegments.map((s) => Math.round(s.fontSize * group.scale * (320 / 1280)))
    );
    if (minLineProjectedSize < 10 && penaltySize < 30) {
      penaltySize = 30;
    }

    // 5. Penalización por falta de protección de contraste (sin borde, sin sombra y sin badge)
    const unprotectedSegments = targetSegments.filter(
      (s) => (s.strokeWidth || 0) < 2 && (s.shadowDepth || 0) < 2 && !s.hasBadge
    );
    const unprotectedLinesCount = unprotectedSegments.length;
    const isContrastProtected = unprotectedLinesCount === 0;

    let penaltyContrast = 0;
    if (unprotectedLinesCount > 0) {
      penaltyContrast = Math.round(25 * (unprotectedLinesCount / targetSegments.length));
    }

    // 6. Cálculo del score continuo (0 - 100)
    const rawScore = 100 - (penaltyWords + penaltySize + penaltyContrast);
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
      isContrastProtected,
      unprotectedLinesCount,
    };
  }
}
