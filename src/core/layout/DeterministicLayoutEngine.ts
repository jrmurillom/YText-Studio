import { Point2D } from '@/core/canvas/Transform2D';
import { TextRenderer } from '@/core/canvas/TextRenderer';
import { TextSegment } from '@/types';
import { YOUTUBE_SAFE_ZONE_CONFIG } from '@/core/safezones/YouTubeSafeZone';

export type PlacementZone =
  | 'TOP_LEFT'
  | 'CENTER_LEFT'
  | 'BOTTOM_LEFT'
  | 'TOP_RIGHT'
  | 'CENTER_RIGHT'
  | 'TOP_CENTER';

export class DeterministicLayoutEngine {
  static readonly MASTER_WIDTH = 1280;
  static readonly MASTER_HEIGHT = 720;

  static readonly PADDING_X = 64; // 5% de 1280
  static readonly PADDING_Y = 48; // 6.6% de 720

  private static measureCanvas: HTMLCanvasElement | null = null;

  private static getMeasureContext(): CanvasRenderingContext2D | null {
    if (typeof document === 'undefined') return null;
    if (!this.measureCanvas) {
      this.measureCanvas = document.createElement('canvas');
    }
    return this.measureCanvas.getContext('2d');
  }

  /**
   * Mide las dimensiones reales (o estimación proporcional en entornos sin DOM) de un grupo de segmentos
   */
  static measureGroupDimensions(segments: TextSegment[]): { width: number; height: number } {
    if (!segments || segments.length === 0) {
      return { width: 120, height: 50 };
    }

    const ctx = this.getMeasureContext();
    let maxWidth = 0;
    let totalHeight = 0;

    for (const seg of segments) {
      const shadowOffsetX = Math.round(seg.shadowDepth * 0.75);
      const pad = seg.hasBadge ? 28 : seg.strokeWidth + shadowOffsetX;

      let segWidth = 0;
      let segHeight = 0;

      if (ctx) {
        const m = TextRenderer.measureSegment(ctx, seg);
        if (m.width - pad > 0 || seg.text.trim().length === 0) {
          segWidth = m.width;
          segHeight = m.height;
        }
      }

      if (segWidth === 0 && seg.text.trim().length > 0) {
        const charWidth = seg.fontSize * 0.58;
        segWidth = seg.text.length * charWidth + pad;
        segHeight = seg.fontSize * 1.05 + seg.shadowDepth;
      }

      maxWidth = Math.max(maxWidth, segWidth);
      totalHeight += segHeight + 10;
    }

    return {
      width: Math.min(1152, Math.max(120, Math.round(maxWidth))),
      height: Math.max(50, Math.round(totalHeight)),
    };
  }

  /**
   * Calcula matemáticamente la posición {x, y} exacta en el canvas master de 1280x720
   */
  static calculateCoordinates(
    placement: PlacementZone,
    groupWidth: number,
    groupHeight: number
  ): Point2D {
    const maxX = this.MASTER_WIDTH - groupWidth - this.PADDING_X;
    const maxY = this.MASTER_HEIGHT - groupHeight - this.PADDING_Y;

    let x = this.PADDING_X;
    let y = this.PADDING_Y;

    switch (placement) {
      case 'TOP_LEFT':
        x = this.PADDING_X;
        y = this.PADDING_Y;
        break;

      case 'CENTER_LEFT':
        x = this.PADDING_X;
        y = Math.round((this.MASTER_HEIGHT - groupHeight) / 2);
        break;

      case 'BOTTOM_LEFT':
        x = this.PADDING_X;
        y = maxY;
        break;

      case 'TOP_RIGHT':
        x = maxX;
        y = this.PADDING_Y;
        break;

      case 'CENTER_RIGHT':
        x = maxX;
        y = Math.round((this.MASTER_HEIGHT - groupHeight) / 2);
        break;

      case 'TOP_CENTER':
        x = Math.round((this.MASTER_WIDTH - groupWidth) / 2);
        y = this.PADDING_Y;
        break;
    }

    // Comprobación de seguridad contra colisión con timestamp inferior derecho
    const ts = YOUTUBE_SAFE_ZONE_CONFIG.timestampBox;
    if (x + groupWidth > ts.x && y + groupHeight > ts.y) {
      // Si choca, empujar hacia arriba
      y = ts.y - groupHeight - 16;
    }

    return {
      x: Math.max(this.PADDING_X, Math.min(x, maxX)),
      y: Math.max(this.PADDING_Y, Math.min(y, maxY)),
    };
  }
}
