import { TextSegment } from '@/types';

export class TextRenderer {
  /**
   * Renderizado vectorial concéntrico en 3 pasadas para evitar el Stroke Bug
   */
  static renderSegment(
    ctx: CanvasRenderingContext2D,
    segment: TextSegment,
    x: number,
    y: number
  ): void {
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = `900 ${segment.fontSize}px "${segment.fontFamily}", sans-serif`;

    // Pasada 1: Sombra 3D Dura (Offset escalonado sin blur)
    if (segment.shadowDepth > 0) {
      ctx.fillStyle = segment.shadowColorHex;
      for (let i = 1; i <= segment.shadowDepth; i++) {
        ctx.fillText(segment.text, x, y + i);
      }
    }

    // Pasada 2: Trazo Exterior Masivo (paintFirst manual)
    if (segment.strokeWidth > 0) {
      ctx.strokeStyle = segment.strokeColorHex;
      ctx.lineWidth = segment.strokeWidth;
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 3;
      ctx.strokeText(segment.text, x, y);
    }

    // Pasada 3: Relleno Vectorial Limpio
    ctx.fillStyle = segment.colorHex;
    ctx.fillText(segment.text, x, y);

    ctx.restore();
  }

  static measureSegment(
    ctx: CanvasRenderingContext2D,
    segment: TextSegment
  ): { width: number; height: number } {
    ctx.save();
    ctx.font = `900 ${segment.fontSize}px "${segment.fontFamily}", sans-serif`;
    const metrics = ctx.measureText(segment.text);
    ctx.restore();

    const width = metrics.width + segment.strokeWidth;
    const height = segment.fontSize * 1.1 + segment.shadowDepth;
    return { width, height };
  }
}
