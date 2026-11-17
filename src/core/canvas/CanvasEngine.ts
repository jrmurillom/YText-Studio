import { CompositeTextGroup } from '@/types';
import { TextRenderer } from './TextRenderer';
import { Transform2D, BoundingBox2D } from './Transform2D';
import { FontLoader } from './FontLoader';

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bgImage: HTMLImageElement | null = null;
  private textGroup: CompositeTextGroup | null = null;
  private isSelected = true;
  private animFrameId: number | null = null;

  static readonly MASTER_WIDTH = 1280;
  static readonly MASTER_HEIGHT = 720;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('No se pudo inicializar CanvasRenderingContext2D');
    this.ctx = context;

    // Configurar resolución maestra 1280x720
    this.canvas.width = CanvasEngine.MASTER_WIDTH;
    this.canvas.height = CanvasEngine.MASTER_HEIGHT;

    // Precargar fuentes vectoriales en segundo plano
    FontLoader.loadAll().then(() => {
      this.render();
    });
  }

  setBaseImage(img: HTMLImageElement): void {
    this.bgImage = img;
    this.render();
  }

  setTextGroup(group: CompositeTextGroup | null): void {
    this.textGroup = group ? { ...group } : null;
    if (this.textGroup) {
      this.autoCalculateDimensions();
    }
    this.render();
  }

  /**
   * Actualiza el grupo de texto en memoria vectorial sin provocar renders de React (60-120 FPS)
   */
  updateTextGroupSilent(group: CompositeTextGroup): void {
    this.textGroup = group;
    this.render();
  }

  setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.render();
  }

  getTextGroup(): CompositeTextGroup | null {
    return this.textGroup;
  }

  getBoundingBox(): BoundingBox2D | null {
    if (!this.textGroup) return null;
    return {
      x: this.textGroup.x,
      y: this.textGroup.y,
      width: this.textGroup.width * this.textGroup.scale,
      height: this.textGroup.height * this.textGroup.scale,
      rotation: this.textGroup.rotation,
    };
  }

  /**
   * Exporta un DataURL limpio del canvas compuesto (sin tiradores ni bounding box)
   */
  exportCleanDataUrl(): string {
    const offscreen = document.createElement('canvas');
    offscreen.width = CanvasEngine.MASTER_WIDTH;
    offscreen.height = CanvasEngine.MASTER_HEIGHT;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return '';

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (this.bgImage) {
      ctx.drawImage(this.bgImage, 0, 0, CanvasEngine.MASTER_WIDTH, CanvasEngine.MASTER_HEIGHT);
    } else {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, CanvasEngine.MASTER_WIDTH, CanvasEngine.MASTER_HEIGHT);
    }

    if (this.textGroup) {
      const w = this.textGroup.width * this.textGroup.scale;
      const h = this.textGroup.height * this.textGroup.scale;
      const centerX = this.textGroup.x + w / 2;
      const centerY = this.textGroup.y + h / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((this.textGroup.rotation * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);
      ctx.scale(this.textGroup.scale, this.textGroup.scale);

      let offsetY = 0;
      for (const segment of this.textGroup.segments) {
        const metrics = TextRenderer.renderSegment(ctx, segment, 0, offsetY);
        offsetY += metrics.height + 10;
      }
      ctx.restore();
    }

    return offscreen.toDataURL('image/png');
  }

  /**
   * Recalcula automáticamente el ancho y alto del grupo de texto según los glifos medidos
   */
  private autoCalculateDimensions(): void {
    if (!this.textGroup) return;

    let maxWidth = 0;
    let totalHeight = 0;

    for (const seg of this.textGroup.segments) {
      const metrics = TextRenderer.measureSegment(this.ctx, seg);
      maxWidth = Math.max(maxWidth, metrics.width);
      totalHeight += metrics.height + 10;
    }

    this.textGroup.width = Math.max(120, maxWidth);
    this.textGroup.height = Math.max(50, totalHeight);
  }

  render(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    this.animFrameId = requestAnimationFrame(() => {
      const ctx = this.ctx;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Dibujar Imagen Base Fija (16:9 Inmutable)
      if (this.bgImage) {
        ctx.drawImage(this.bgImage, 0, 0, CanvasEngine.MASTER_WIDTH, CanvasEngine.MASTER_HEIGHT);
      } else {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, CanvasEngine.MASTER_WIDTH, CanvasEngine.MASTER_HEIGHT);
      }

      // 2. Dibujar Layer Vectorial de Textos (PIVOTE EN EL CENTRO)
      if (this.textGroup) {
        const w = this.textGroup.width * this.textGroup.scale;
        const h = this.textGroup.height * this.textGroup.scale;
        const centerX = this.textGroup.x + w / 2;
        const centerY = this.textGroup.y + h / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((this.textGroup.rotation * Math.PI) / 180);
        ctx.translate(-w / 2, -h / 2);
        ctx.scale(this.textGroup.scale, this.textGroup.scale);

        let offsetY = 0;
        for (const segment of this.textGroup.segments) {
          const metrics = TextRenderer.renderSegment(ctx, segment, 0, offsetY);
          offsetY += metrics.height + 10;
        }

        ctx.restore();

        // 3. Dibujar Bounding Box y Tiradores de Transformación
        if (this.isSelected) {
          this.drawSelectionOverlay(ctx, centerX, centerY, w, h);
        }
      }
    });
  }

  private drawSelectionOverlay(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    w: number,
    h: number
  ): void {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(((this.textGroup?.rotation || 0) * Math.PI) / 180);

    const halfW = w / 2;
    const halfH = h / 2;

    // 1. Contorno de la caja envolvente
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfW, -halfH, w, h);

    // 2. Vástago conector hacia el tirador de rotación
    const rotStemY = -halfH - Transform2D.ROTATION_STEM_OFFSET;
    ctx.beginPath();
    ctx.moveTo(0, -halfH);
    ctx.lineTo(0, rotStemY);
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Tirador de rotación con icono visible circular ↻
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, rotStemY, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibujo del glifo de rotación ↻ en el centro del tirador
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, rotStemY, 6, -Math.PI * 0.7, Math.PI * 0.7, false);
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Flechita del arco
    ctx.beginPath();
    ctx.fillStyle = '#2563EB';
    ctx.moveTo(3, rotStemY + 5);
    ctx.lineTo(8, rotStemY + 5);
    ctx.lineTo(5, rotStemY + 9);
    ctx.fill();
    ctx.restore();

    // 4. Dibujar los 8 tiradores de escala
    const handleSize = 10;
    const half = handleSize / 2;

    const handlePositions = [
      { x: -halfW, y: -halfH }, // TL
      { x: 0, y: -halfH },      // T
      { x: halfW, y: -halfH },  // TR
      { x: halfW, y: 0 },       // R
      { x: halfW, y: halfH },   // BR
      { x: 0, y: halfH },       // B
      { x: -halfW, y: halfH },  // BL
      { x: -halfW, y: 0 },      // L
    ];

    for (const pos of handlePositions) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(pos.x - half, pos.y - half, handleSize, handleSize);
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x - half, pos.y - half, handleSize, handleSize);
    }

    ctx.restore();
  }

  destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
