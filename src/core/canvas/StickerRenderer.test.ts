import { describe, it, expect, vi } from 'vitest';
import { StickerRenderer } from './StickerRenderer';

describe('StickerRenderer', () => {
  it('should render image without crashing when no effects are enabled', () => {
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      translate: vi.fn(),
      globalAlpha: 1.0,
    } as unknown as CanvasRenderingContext2D;

    const mockImg = {} as HTMLImageElement;

    StickerRenderer.renderAsset(mockCtx, mockImg, 100, 100, {
      hasStickerBorder: false,
      hasShadow: false,
      opacity: 0.8,
    });

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImg, -50, -50, 100, 100);
  });
});
