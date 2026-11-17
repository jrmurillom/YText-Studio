import { Point2D } from '@/core/canvas/Transform2D';
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
