import { describe, it, expect, vi } from 'vitest';
import { TextRenderer } from './TextRenderer';
import { TextSegment } from '@/types';

describe('TextRenderer (Micro-Layout & Segment Transforms)', () => {
  const createMockContext = () => {
    return {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      transform: vi.fn(),
      measureText: vi.fn().mockReturnValue({
        width: 150,
        actualBoundingBoxAscent: 40,
        actualBoundingBoxDescent: 10,
      }),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
    } as unknown as CanvasRenderingContext2D;
  };

  const baseSegment: TextSegment = {
    id: 'seg_1',
    text: 'YOUTUBE COVER',
    role: 'power_primary',
    fontFamily: 'Montserrat',
    fontSize: 60,
    colorHex: '#FFFFFF',
    strokeColorHex: '#000000',
    strokeWidth: 8,
    shadowColorHex: '#000000',
    shadowDepth: 4,
    slant: 0,
  };

  it('renderiza con coordenadas base cuando no hay offsets', () => {
    const ctx = createMockContext();
    const metrics = TextRenderer.renderSegment(ctx, baseSegment, 100, 200);

    expect(metrics.width).toBeGreaterThan(150);
    expect(ctx.fillText).toHaveBeenCalledWith('YOUTUBE COVER', 100, 200);
  });

  it('aplica traslación relativa con offsetX y offsetY por línea', () => {
    const ctx = createMockContext();
    const segmentWithOffset: TextSegment = {
      ...baseSegment,
      offsetX: 45,
      offsetY: -15,
    };

    TextRenderer.renderSegment(ctx, segmentWithOffset, 100, 200);

    // Debe renderizarse en (100 + 45 = 145, 200 - 15 = 185)
    expect(ctx.fillText).toHaveBeenCalledWith('YOUTUBE COVER', 145, 185);
  });

  it('aplica rotación individual centrada en la línea cuando rotation es distinto de 0', () => {
    const ctx = createMockContext();
    const segmentWithRotation: TextSegment = {
      ...baseSegment,
      rotation: -10,
    };

    TextRenderer.renderSegment(ctx, segmentWithRotation, 100, 200);

    expect(ctx.rotate).toHaveBeenCalledWith((-10 * Math.PI) / 180);
    expect(ctx.translate).toHaveBeenCalled();
  });

  it('measureSegment expande las dimensiones del bounding box incorporando los offsets', () => {
    const ctx = createMockContext();
    const mBase = TextRenderer.measureSegment(ctx, baseSegment);
    const mOffset = TextRenderer.measureSegment(ctx, {
      ...baseSegment,
      offsetX: 50,
      offsetY: 25,
    });

    expect(mOffset.width).toBe(mBase.width + 50);
    expect(mOffset.height).toBe(mBase.height + 25);
  });
});
