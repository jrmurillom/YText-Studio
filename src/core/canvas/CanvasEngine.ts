import { CompositeTextGroup } from '@/types';
import { TextRenderer } from './TextRenderer';

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bgImage: HTMLImageElement | null = null;
  private textGroup: CompositeTextGroup | null = null;
  private animFrameId: number | null = null;

  static readonly MASTER_WIDTH = 1280;
  static readonly MASTER_HEIGHT = 720;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo inicializar CanvasRenderingContext2D');
    this.ctx = context;

    // Configurar resolución interna de alta fidelidad
    this.canvas.width = CanvasEngine.MASTER_WIDTH;
    this.canvas.height = CanvasEngine.MASTER_HEIGHT;
  }

  setBaseImage(img: HTMLImageElement): void {
    this.bgImage = img;
    this.render();
  }

  setTextGroup(group: CompositeTextGroup | null): void {
    this.textGroup = group;
    this.render();
  }

  render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CanvasEngine.MASTER_WIDTH, CanvasEngine.MASTER_HEIGHT);

    // 1. Dibujar Imagen Base Fija (16:9 Inmutable)
    if (this.bgImage) {
      ctx.drawImage(this.bgImage, 0, 0, CanvasEngine.MASTER_WIDTH, CanvasEngine.MASTER_HEIGHT);
    } else {
      // Fondo provisional si no hay imagen
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, CanvasEngine.MASTER_WIDTH, CanvasEngine.MASTER_HEIGHT);
    }

    // 2. Dibujar Layer Vectorial de Textos
    if (this.textGroup) {
      ctx.save();
      ctx.translate(this.textGroup.x, this.textGroup.y);
      ctx.rotate((this.textGroup.rotation * Math.PI) / 180);
      ctx.scale(this.textGroup.scale, this.textGroup.scale);

      let offsetY = 0;
      for (const segment of this.textGroup.segments) {
        TextRenderer.renderSegment(ctx, segment, 0, offsetY);
        const metrics = TextRenderer.measureSegment(ctx, segment);
        offsetY += metrics.height + 8;
      }

      ctx.restore();
    }
  }

  destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
