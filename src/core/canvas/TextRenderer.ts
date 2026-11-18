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
    const weight = this.getFontWeight(segment.fontFamily);
    ctx.font = `${weight} ${segment.fontSize}px "${segment.fontFamily}", sans-serif`;

    const metrics = ctx.measureText(segment.text);
    const textWidth = metrics.width;
    const textHeight = segment.fontSize * 1.05;

    const posX = x + (segment.offsetX || 0);
    const posY = y + (segment.offsetY || 0);

    // 0. Rotación angular independiente de la línea
    if (typeof segment.rotation === 'number' && segment.rotation !== 0) {
      const lineCenterX = posX + textWidth / 2;
      const lineCenterY = posY + textHeight / 2;
      ctx.translate(lineCenterX, lineCenterY);
      ctx.rotate((segment.rotation * Math.PI) / 180);
      ctx.translate(-lineCenterX, -lineCenterY);
    }

    // 0.1 Inclinación tipográfica (Slant / Italic skew)
    if (typeof segment.slant === 'number' && segment.slant !== 0) {
      const skew = Math.tan((-segment.slant * Math.PI) / 180);
      ctx.translate(posX, posY + textHeight / 2);
      ctx.transform(1, 0, skew, 1, 0, 0);
      ctx.translate(-posX, -(posY + textHeight / 2));
    }

    // 0.2 Si tiene Badge contenedor (pill con esquinas redondeadas)
    if (segment.hasBadge) {
      const padX = 14;
      const padY = 6;
      ctx.fillStyle = segment.badgeBgColor || '#000000';
      this.drawRoundedRect(
        ctx,
        posX - padX,
        posY - padY,
        textWidth + padX * 2,
        textHeight + padY * 2,
        6
      );
    }

    // 1. Pasada 1: Sombra 3D Oblicua (Ángulo 45° para volumen cinematográfico profesional)
    if (segment.shadowDepth > 0) {
      ctx.fillStyle = segment.shadowColorHex || '#000000';
      for (let i = 1; i <= segment.shadowDepth; i++) {
        const offX = Math.round(i * 0.75);
        ctx.fillText(segment.text, posX + offX, posY + i);
      }
    }

    // 2. Pasada 2: Trazo Exterior Fiel a la Especificación
    if (segment.strokeWidth > 0) {
      ctx.strokeStyle = segment.strokeColorHex;
      ctx.lineWidth = segment.strokeWidth;
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 3;
      ctx.strokeText(segment.text, posX, posY);
    }

    // 3. Pasada 3: Relleno Vectorial (Gradiente Cenital o Color Plano Sólido)
    if (segment.gradientColorHex) {
      const grad = ctx.createLinearGradient(0, posY, 0, posY + textHeight);
      grad.addColorStop(0, segment.colorHex);
      grad.addColorStop(1, segment.gradientColorHex);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = segment.colorHex;
    }
    ctx.fillText(segment.text, posX, posY);

    ctx.restore();

    const shadowOffsetX = Math.round(segment.shadowDepth * 0.75);
    return {
      width: textWidth + segment.strokeWidth + shadowOffsetX + Math.abs(segment.offsetX || 0),
      height: textHeight + segment.shadowDepth + Math.abs(segment.offsetY || 0),
      ascent: metrics.actualBoundingBoxAscent || segment.fontSize * 0.8,
      descent: metrics.actualBoundingBoxDescent || segment.fontSize * 0.2,
    };
  }

  static measureSegment(
    ctx: CanvasRenderingContext2D,
    segment: TextSegment
  ): SegmentMetrics {
    ctx.save();
    const weight = this.getFontWeight(segment.fontFamily);
    ctx.font = `${weight} ${segment.fontSize}px "${segment.fontFamily}", sans-serif`;
    const metrics = ctx.measureText(segment.text);
    ctx.restore();

    const shadowOffsetX = Math.round(segment.shadowDepth * 0.75);
    const pad = segment.hasBadge ? 28 : (segment.strokeWidth + shadowOffsetX);
    return {
      width: metrics.width + pad + Math.abs(segment.offsetX || 0),
      height: segment.fontSize * 1.05 + segment.shadowDepth + Math.abs(segment.offsetY || 0),
      ascent: metrics.actualBoundingBoxAscent || segment.fontSize * 0.8,
      descent: metrics.actualBoundingBoxDescent || segment.fontSize * 0.2,
    };
  }

  private static getFontWeight(family: string): string {
    switch (family) {
      case 'Anton':
      case 'Bebas Neue':
      case 'Luckiest Guy':
      case 'Bangers':
      case 'Permanent Marker':
        return '400';
      case 'Teko':
      case 'Cinzel':
        return '700';
      case 'Inter':
        return '800';
      case 'Playfair Display':
      case 'Poppins':
      case 'Rubik':
      case 'Montserrat':
      default:
        return '900';
    }
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
