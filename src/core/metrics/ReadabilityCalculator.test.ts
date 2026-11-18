import { describe, it, expect } from 'vitest';
import { ReadabilityCalculator } from './ReadabilityCalculator';
import { CompositeTextGroup } from '@/types';

describe('ReadabilityCalculator (TRI)', () => {
  it('otorga score óptimo (100) para textos de impacto cortos (<=3 palabras) y buen tamaño', () => {
    const group: CompositeTextGroup = {
      id: 'g1',
      x: 100,
      y: 100,
      width: 400,
      height: 120,
      scale: 1,
      rotation: 0,
      segments: [
        {
          id: 's1',
          text: 'EL MEJOR DISCO',
          role: 'power_primary',
          fontFamily: 'Montserrat',
          fontSize: 80, // 80 * 0.25 = 20px en móvil (>18px)
          colorHex: '#FFFF00',
          strokeColorHex: '#000000',
          strokeWidth: 8,
          shadowColorHex: '#000000',
          shadowDepth: 4,
          slant: 0,
        },
      ],
    };

    const report = ReadabilityCalculator.calculate(group);
    expect(report.score).toBe(100);
    expect(report.level).toBe('optimal');
    expect(report.wordCount).toBe(3);
    expect(report.projectedMobileFontSize).toBe(20);
  });

  it('penaliza severamente cuando el copy excede 6 palabras (>6 palabras)', () => {
    const group: CompositeTextGroup = {
      id: 'g2',
      x: 100,
      y: 100,
      width: 400,
      height: 120,
      scale: 1,
      rotation: 0,
      segments: [
        {
          id: 's1',
          text: 'ESTA ES UNA EXPLICACION DEMASIADO LARGA PARA UNA MINIATURA',
          role: 'power_primary',
          fontFamily: 'Montserrat',
          fontSize: 80,
          colorHex: '#FFFF00',
          strokeColorHex: '#000000',
          strokeWidth: 8,
          shadowColorHex: '#000000',
          shadowDepth: 4,
          slant: 0,
        },
      ],
    };

    const report = ReadabilityCalculator.calculate(group);
    expect(report.wordCount).toBe(9);
    expect(report.score).toBeLessThanOrEqual(40);
    expect(report.level).toBe('critical');
  });

  it('penaliza fuertemente tamaños de fuente minúsculos (<10px proyectados)', () => {
    const group: CompositeTextGroup = {
      id: 'g3',
      x: 100,
      y: 100,
      width: 400,
      height: 120,
      scale: 1,
      rotation: 0,
      segments: [
        {
          id: 's1',
          text: 'TITULO PEQUEÑO',
          role: 'power_primary',
          fontFamily: 'Montserrat',
          fontSize: 32, // 32 * 0.25 = 8px proyectado en móvil
          colorHex: '#FFFFFF',
          strokeColorHex: '#000000',
          strokeWidth: 4,
          shadowColorHex: '#000000',
          shadowDepth: 2,
          slant: 0,
        },
      ],
    };

    const report = ReadabilityCalculator.calculate(group);
    expect(report.projectedMobileFontSize).toBe(8);
    expect(report.score).toBeLessThanOrEqual(50);
  });

  it('penaliza con 25 puntos cuando el texto carece de borde, sombra y badge simultáneamente', () => {
    const group: CompositeTextGroup = {
      id: 'g4',
      x: 100,
      y: 100,
      width: 400,
      height: 120,
      scale: 1,
      rotation: 0,
      segments: [
        {
          id: 's1',
          text: 'TEXTO PLANO',
          role: 'power_primary',
          fontFamily: 'Montserrat',
          fontSize: 80,
          colorHex: '#FFFFFF',
          strokeColorHex: '#000000',
          strokeWidth: 0,
          shadowColorHex: '#000000',
          shadowDepth: 0,
          slant: 0,
          hasBadge: false,
        },
      ],
    };

    const report = ReadabilityCalculator.calculate(group);
    expect(report.score).toBe(75);
    expect(report.level).toBe('acceptable');
    expect(report.isContrastProtected).toBe(false);
    expect(report.unprotectedLinesCount).toBe(1);
  });

  it('evalúa reactivamente cambios en líneas secundarias o terciarias (multi-line)', () => {
    const multiGroup: CompositeTextGroup = {
      id: 'g5',
      x: 100,
      y: 100,
      width: 400,
      height: 240,
      scale: 1,
      rotation: 0,
      segments: [
        {
          id: 's1',
          text: 'NO HAY',
          role: 'anchor_secondary',
          fontFamily: 'Montserrat',
          fontSize: 60,
          colorHex: '#FFFFFF',
          strokeColorHex: '#000000',
          strokeWidth: 8,
          shadowColorHex: '#000000',
          shadowDepth: 4,
          slant: 0,
          hasBadge: true,
        },
        {
          id: 's2',
          text: 'NADIE',
          role: 'power_primary',
          fontFamily: 'Montserrat',
          fontSize: 80,
          colorHex: '#FFFFFF',
          strokeColorHex: '#000000',
          strokeWidth: 8,
          shadowColorHex: '#000000',
          shadowDepth: 4,
          slant: 0,
          hasBadge: false,
        },
        {
          id: 's3',
          text: 'DETRÁS',
          role: 'power_primary',
          fontFamily: 'Montserrat',
          fontSize: 76,
          colorHex: '#FFFF00',
          strokeColorHex: '#000000',
          strokeWidth: 0,
          shadowColorHex: '#000000',
          shadowDepth: 0,
          slant: 0,
          hasBadge: false, // Línea 3 desprotegida inicialmente
        },
      ],
    };

    // Con Línea 3 desprotegida
    const initialReport = ReadabilityCalculator.calculate(multiGroup);
    expect(initialReport.isContrastProtected).toBe(false);
    expect(initialReport.unprotectedLinesCount).toBe(1);
    expect(initialReport.score).toBeLessThan(100);

    // Activando badge en Línea 3
    multiGroup.segments[2].hasBadge = true;
    const protectedReport = ReadabilityCalculator.calculate(multiGroup);
    expect(protectedReport.isContrastProtected).toBe(true);
    expect(protectedReport.unprotectedLinesCount).toBe(0);
    expect(protectedReport.score).toBeGreaterThan(initialReport.score);
  });
});
