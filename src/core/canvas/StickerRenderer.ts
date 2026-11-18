/**
 * StickerRenderer: Renderizado de efectos de stickers para YouTube
 * Soporta borde exterior plano (Sticker White Outline) y sombra dura direccional 3D.
 */

export interface StickerRenderOptions {
  hasStickerBorder?: boolean;
  borderWidth?: number;
  borderColorHex?: string;
  hasShadow?: boolean;
  shadowDepth?: number;
  shadowColorHex?: string;
  opacity?: number;
}

export class StickerRenderer {
  private static scratchCanvas: HTMLCanvasElement | null = null;

  private static getScratchCanvas(w: number, h: number): HTMLCanvasElement {
    if (typeof document === 'undefined') {
      // Mock para entornos SSR o tests sin DOM completo
      return {} as HTMLCanvasElement;
    }
    if (!this.scratchCanvas) {
      this.scratchCanvas = document.createElement('canvas');
    }
    const safeW = Math.max(w, 400);
    const safeH = Math.max(h, 400);
    if (this.scratchCanvas.width < safeW || this.scratchCanvas.height < safeH) {
      this.scratchCanvas.width = safeW;
      this.scratchCanvas.height = safeH;
    }
    return this.scratchCanvas;
  }

  /**
   * Renderiza el asset gráfico centrado en (0, 0) con sus efectos de sticker y sombra
   */
  public static renderAsset(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement | HTMLCanvasElement,
    width: number,
    height: number,
    options: StickerRenderOptions = {}
  ): void {
    const borderWidth = options.borderWidth ?? 6;
    const borderColor = options.borderColorHex || '#FFFFFF';
    const shadowDepth = options.shadowDepth ?? 6;
    const shadowColor = options.shadowColorHex || '#000000';
    const opacity = options.opacity ?? 1.0;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    const halfW = width / 2;
    const halfH = height / 2;

    // 1. Proyección de Sombra Dura 3D (a 45° con steps, consistente con la tipografía)
    if (options.hasShadow && shadowDepth > 0) {
      ctx.save();
      const steps = Math.min(shadowDepth, 6);
      for (let s = 1; s <= steps; s++) {
        const offset = (shadowDepth * s) / steps;
        ctx.save();
        ctx.translate(offset, offset);
        this.drawSilhouette(ctx, img, width, height, shadowColor, halfW, halfH);
        ctx.restore();
      }
      ctx.restore();
    }

    // 2. Borde Blanco de Sticker (Radial multi-sampling para generar silueta expandida sólida)
    if (options.hasStickerBorder && borderWidth > 0) {
      ctx.save();
      const angles = 16;
      for (let i = 0; i < angles; i++) {
        const rad = (i * 2 * Math.PI) / angles;
        const ox = Math.cos(rad) * borderWidth;
        const oy = Math.sin(rad) * borderWidth;
        ctx.save();
        ctx.translate(ox, oy);
        this.drawSilhouette(ctx, img, width, height, borderColor, halfW, halfH);
        ctx.restore();
      }
      ctx.restore();
    }

    // 3. Renderizado de la imagen original en su plano frontal
    ctx.drawImage(img, -halfW, -halfH, width, height);

    ctx.restore();
  }

  /**
   * Pinta la silueta rellena de un color plano aprovechando source-in compositing
   */
  private static drawSilhouette(
    targetCtx: CanvasRenderingContext2D,
    img: HTMLImageElement | HTMLCanvasElement,
    width: number,
    height: number,
    colorHex: string,
    halfW: number,
    halfH: number
  ): void {
    if (typeof document === 'undefined') return;

    const scratch = this.getScratchCanvas(width, height);
    const sCtx = scratch.getContext('2d');
    if (!sCtx) return;

    sCtx.clearRect(0, 0, width, height);
    sCtx.drawImage(img, 0, 0, width, height);

    sCtx.globalCompositeOperation = 'source-in';
    sCtx.fillStyle = colorHex;
    sCtx.fillRect(0, 0, width, height);
    sCtx.globalCompositeOperation = 'source-over';

    targetCtx.drawImage(scratch, 0, 0, width, height, -halfW, -halfH, width, height);
  }
}
