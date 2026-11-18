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

    // 1. Proyección de Sombra Dura 3D (a 45° con steps, silueta pre-renderizada 1 sola vez)
    if (options.hasShadow && shadowDepth > 0) {
      const shadowSilhouette = this.prepareSilhouette(img, width, height, shadowColor);
      if (shadowSilhouette) {
        const steps = Math.min(shadowDepth, 6);
        for (let s = 1; s <= steps; s++) {
          const offset = (shadowDepth * s) / steps;
          ctx.drawImage(
            shadowSilhouette,
            0,
            0,
            width,
            height,
            -halfW + offset,
            -halfH + offset,
            width,
            height
          );
        }
      }
    }

    // 2. Borde Blanco de Sticker (Radial multi-sampling con silueta pre-renderizada 1 sola vez)
    if (options.hasStickerBorder && borderWidth > 0) {
      const borderSilhouette = this.prepareSilhouette(img, width, height, borderColor);
      if (borderSilhouette) {
        const angles = 16;
        for (let i = 0; i < angles; i++) {
          const rad = (i * 2 * Math.PI) / angles;
          const ox = Math.cos(rad) * borderWidth;
          const oy = Math.sin(rad) * borderWidth;
          ctx.drawImage(
            borderSilhouette,
            0,
            0,
            width,
            height,
            -halfW + ox,
            -halfH + oy,
            width,
            height
          );
        }
      }
    }

    // 3. Renderizado de la imagen original en su plano frontal
    ctx.drawImage(img, -halfW, -halfH, width, height);

    ctx.restore();
  }

  /**
   * Pre-genera una silueta rellena de color plano una sola vez en el scratchCanvas
   */
  private static prepareSilhouette(
    img: HTMLImageElement | HTMLCanvasElement,
    width: number,
    height: number,
    colorHex: string
  ): HTMLCanvasElement | null {
    if (typeof document === 'undefined') return null;

    const scratch = this.getScratchCanvas(width, height);
    const sCtx = scratch.getContext('2d');
    if (!sCtx) return null;

    sCtx.clearRect(0, 0, scratch.width, scratch.height);
    sCtx.drawImage(img, 0, 0, width, height);

    sCtx.globalCompositeOperation = 'source-in';
    sCtx.fillStyle = colorHex;
    sCtx.fillRect(0, 0, width, height);
    sCtx.globalCompositeOperation = 'source-over';

    return scratch;
  }
}
