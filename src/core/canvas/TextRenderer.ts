import { TextSegment } from '@/types';

export interface SegmentMetrics {
  width: number;
  height: number;
  ascent: number;
  descent: number;
}

export class TextRenderer {
  /**
   * Renderizado vectorial concéntrico en pasadas ordenadas para evitar el Stroke Bug
   */
  static renderSegment(
    ctx: CanvasRenderingContext2D,
    segment: TextSegment,
    x: number,
    y: number
  ): SegmentMetrics {
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = `900 ${segment.fontSize}px "${segment.fontFamily}", sans-serif`;

    const metrics = ctx.measureText(segment.text);
    const textWidth = metrics.width;
    const textHeight = segment.fontSize * 1.05;

    // 0. Si tiene Badge contenedor (pill con esquinas redondeadas)
    if (segment.hasBadge) {
      const padX = 14;
      const padY = 6;
      ctx.fillStyle = segment.badgeBgColor || '#000000';
      this.drawRoundedRect(
        ctx,
        x - padX,
        y - padY,
        textWidth + padX * 2,
        textHeight + padY * 2,
        6
      );
    }

    // 1. Pasada 1: Sombra 3D Dura (Offset escalonado sin desenfoque a 90°)
    if (segment.shadowDepth > 0) {
      ctx.fillStyle = segment.shadowColorHex || '#000000';
      for (let i = 1; i <= segment.shadowDepth; i++) {
        ctx.fillText(segment.text, x, y + i);
      }
    }

    // 2. Pasada 2: Trazo Exterior Masivo (paintFirst = 'stroke' perimetral)
    if (segment.strokeWidth > 0) {
      ctx.strokeStyle = segment.strokeColorHex;
      ctx.lineWidth = segment.strokeWidth;
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 3;
      ctx.strokeText(segment.text, x, y);
    }

    // 3. Pasada 3: Trazo Secundario Interior (si el stroke es ultra ancho > 14px)
    if (segment.strokeWidth > 14) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(3, segment.strokeWidth * 0.25);
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 3;
      ctx.strokeText(segment.text, x, y);
    }

    // 4. Pasada 4: Relleno Vectorial Limpio (con gradiente o plano)
    ctx.fillStyle = this.getFillStyle(ctx, segment, y, textHeight);
    ctx.fillText(segment.text, x, y);

    ctx.restore();

    return {
      width: textWidth + segment.strokeWidth,
      height: textHeight + segment.shadowDepth,
      ascent: metrics.actualBoundingBoxAscent || segment.fontSize * 0.8,
      descent: metrics.actualBoundingBoxDescent || segment.fontSize * 0.2,
    };
  }

  private static getFillStyle(
    ctx: CanvasRenderingContext2D,
    segment: TextSegment,
    y: number,
    height: number
  ): string | CanvasGradient {
    // Si es amarillo tipo MrBeast o cian tipo Gaming, aplicar gradiente vertical
    if (segment.colorHex.toUpperCase() === '#FFE600' || segment.colorHex.toUpperCase() === '#FFD700') {
      const grad = ctx.createLinearGradient(0, y, 0, y + height);
      grad.addColorStop(0, '#FFF500');
      grad.addColorStop(1, '#FF8A00');
      return grad;
    }
    if (segment.colorHex.toUpperCase() === '#00F5FF') {
      const grad = ctx.createLinearGradient(0, y, 0, y + height);
      grad.addColorStop(0, '#00F5FF');
      grad.addColorStop(1, '#0080FF');
      return grad;
    }
    return segment.colorHex;
  }

  static measureSegment(
    ctx: CanvasRenderingContext2D,
    segment: TextSegment
  ): SegmentMetrics {
    ctx.save();
    ctx.font = `900 ${segment.fontSize}px "${segment.fontFamily}", sans-serif`;
    const metrics = ctx.measureText(segment.text);
    ctx.restore();

    const pad = segment.hasBadge ? 28 : segment.strokeWidth;
    return {
      width: metrics.width + pad,
      height: segment.fontSize * 1.05 + segment.shadowDepth,
      ascent: metrics.actualBoundingBoxAscent || segment.fontSize * 0.8,
      descent: metrics.actualBoundingBoxDescent || segment.fontSize * 0.2,
    };
  }

  private static drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }
}
