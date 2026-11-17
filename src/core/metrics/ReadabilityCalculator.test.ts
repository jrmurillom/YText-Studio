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
});
