import { describe, it, expect, vi, afterEach } from 'vitest';
import { StickerRenderer } from './StickerRenderer';

describe('StickerRenderer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    (StickerRenderer as unknown as { scratchCanvas: HTMLCanvasElement | null }).scratchCanvas = null;
  });

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

  it('pre-generates silhouette only once per effect (2 source-in fillRect calls total instead of 22)', () => {
    const mockScratchCtx = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      globalCompositeOperation: 'source-over',
      fillStyle: '#000000',
    };
    const mockScratchCanvas = {
      width: 400,
      height: 400,
      getContext: vi.fn(() => mockScratchCtx),
    };

    vi.stubGlobal('document', {
      createElement: vi.fn(() => mockScratchCanvas),
    });

    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      globalAlpha: 1.0,
    } as unknown as CanvasRenderingContext2D;

    const mockImg = {} as HTMLImageElement;

    StickerRenderer.renderAsset(mockCtx, mockImg, 100, 100, {
      hasShadow: true,
      shadowDepth: 6,
      shadowColorHex: '#000000',
      hasStickerBorder: true,
      borderWidth: 6,
      borderColorHex: '#FFFFFF',
    });

    // 1 fillRect para sombra + 1 fillRect para borde = 2 veces en total (no 22)
    expect(mockScratchCtx.fillRect).toHaveBeenCalledTimes(2);
    expect(mockScratchCtx.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
    // 6 pasadas sombra + 16 pasadas borde + 1 imagen frontal = 23 drawImage en targetCtx
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(23);
  });
});
