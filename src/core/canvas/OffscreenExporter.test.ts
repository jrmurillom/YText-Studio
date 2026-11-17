import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OffscreenExporter } from './OffscreenExporter';
import { CompositeTextGroup } from '@/types';

describe('OffscreenExporter', () => {
  const dummyTextGroup: CompositeTextGroup = {
    id: 'test_group',
    x: 100,
    y: 150,
    width: 400,
    height: 120,
    rotation: 0,
    scale: 1,
    segments: [
      {
        id: 's1',
        text: 'TITULO DE PRUEBA',
        role: 'power_primary',
        fontFamily: 'Anton',
        fontSize: 72,
        colorHex: '#FFE600',
        strokeColorHex: '#000000',
        strokeWidth: 12,
        shadowColorHex: '#000000',
        shadowDepth: 6,
        slant: 0,
      },
    ],
  };

  const originalDocument = (globalThis as any).document;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
  });

  it('proporciona las resoluciones oficiales de 720p y 1080p con sus escalas', () => {
    expect(OffscreenExporter.RESOLUTIONS['720p'].width).toBe(1280);
    expect(OffscreenExporter.RESOLUTIONS['720p'].height).toBe(720);
    expect(OffscreenExporter.RESOLUTIONS['720p'].scale).toBe(1.0);

    expect(OffscreenExporter.RESOLUTIONS['1080p'].width).toBe(1920);
    expect(OffscreenExporter.RESOLUTIONS['1080p'].height).toBe(1080);
    expect(OffscreenExporter.RESOLUTIONS['1080p'].scale).toBe(1.5);
  });

  it('renderToCanvas crea un canvas con las dimensiones exactas seleccionadas', async () => {
    const mockCtx = {
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      drawImage: vi.fn(),
      fillStyle: '',
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 200 }),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn((cb) => cb(new Blob(['fake'], { type: 'image/png' }))),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,dummy'),
    } as unknown as HTMLCanvasElement;

    (globalThis as any).document = {
      createElement: vi.fn().mockReturnValue(mockCanvas),
      fonts: { ready: Promise.resolve() },
    };

    const { canvas, width, height } = await OffscreenExporter.renderToCanvas({
      bgImage: null,
      textGroup: dummyTextGroup,
      resolution: '1080p',
    });

    expect(width).toBe(1920);
    expect(height).toBe(1080);
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
    expect(mockCtx.scale).toHaveBeenCalledWith(1.5, 1.5);
  });
});
