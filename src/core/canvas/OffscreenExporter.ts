import { CompositeTextGroup } from '@/types';
import { TextRenderer } from './TextRenderer';

export type ExportResolution = '720p' | '1080p';
export type ExportFormat = 'png' | 'jpeg';

export interface ExportOptions {
  bgImage: HTMLImageElement | string | null;
  textGroup: CompositeTextGroup | null;
  resolution?: ExportResolution;
  format?: ExportFormat;
  filenamePrefix?: string;
}

export interface ExportResult {
  dataUrl: string;
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export class OffscreenExporter {
  public static readonly RESOLUTIONS: Record<ExportResolution, { width: number; height: number; scale: number; label: string }> = {
    '720p': {
      width: 1280,
      height: 720,
      scale: 1.0,
      label: '1280×720 (YouTube HD Standard)',
    },
    '1080p': {
      width: 1920,
      height: 1080,
      scale: 1.5,
      label: '1920×1080 (Full HD • Retina Master)',
    },
  };

  /**
   * Renderiza la portada compuesta en un canvas virtual desacoplado en alta resolución
   */
  public static async renderToCanvas(
    options: ExportOptions
  ): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
    // 1. Asegurar que las fuentes de Google Fonts estén completamente rasterizadas
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready;
    }

    const resConfig = this.RESOLUTIONS[options.resolution || '720p'];
    const canvas = document.createElement('canvas');
    canvas.width = resConfig.width;
    canvas.height = resConfig.height;

    const ctx = canvas.getContext('2d', { alpha: options.format !== 'jpeg' });
    if (!ctx) {
      throw new Error('Failed to initialize 2D context for export canvas');
    }

    // Configuración de máxima fidelidad bicúbica
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 2. Fondo (Imagen base o color por defecto Slate-900)
    let imgElement: HTMLImageElement | null = null;
    if (typeof options.bgImage === 'string' && options.bgImage.trim().length > 0) {
      imgElement = await new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img); // Fallback suave
        img.src = options.bgImage as string;
      });
    } else if (options.bgImage && typeof options.bgImage !== 'string') {
      imgElement = options.bgImage;
    }

    if (imgElement && imgElement.width > 0 && imgElement.height > 0) {
      ctx.drawImage(imgElement, 0, 0, resConfig.width, resConfig.height);
    } else {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, resConfig.width, resConfig.height);
    }

    // 3. Renderizado Vectorial de TextGroup con escalado proporcional
    if (options.textGroup) {
      ctx.save();
      // Escalado global según resolución (1.0 para 720p, 1.5 para 1080p)
      ctx.scale(resConfig.scale, resConfig.scale);

      const tg = options.textGroup;
      const w = tg.width * tg.scale;
      const h = tg.height * tg.scale;
      const centerX = tg.x + w / 2;
      const centerY = tg.y + h / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate((tg.rotation * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);
      ctx.scale(tg.scale, tg.scale);

      let offsetY = 0;
      for (const segment of tg.segments) {
        const metrics = TextRenderer.renderSegment(ctx, segment, 0, offsetY);
        offsetY += metrics.height + 10;
      }

      ctx.restore();
    }

    return { canvas, width: resConfig.width, height: resConfig.height };
  }

  /**
   * Genera el Blob y DataURL de exportación
   */
  public static async export(options: ExportOptions): Promise<ExportResult> {
    const { canvas, width, height } = await this.renderToCanvas(options);
    const format = options.format || 'png';
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpeg' ? 1.0 : undefined;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Fallo al generar Blob de imagen'));
        },
        mimeType,
        quality
      );
    });

    const dataUrl = canvas.toDataURL(mimeType, quality);
    const prefix = options.filenamePrefix || 'ytext-cover';
    const resTag = options.resolution || '720p';
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const filename = `${prefix}-${resTag}-${Date.now()}.${ext}`;

    return {
      dataUrl,
      blob,
      filename,
      width,
      height,
      sizeBytes: blob.size,
    };
  }

  /**
   * Ejecuta la descarga directa en el navegador
   */
  public static async download(options: ExportOptions): Promise<ExportResult> {
    const result = await this.export(options);

    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return result;
  }
}
