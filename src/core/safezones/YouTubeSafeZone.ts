import { YouTubeSafeZoneConfig } from '@/types';

export const YOUTUBE_SAFE_ZONE_CONFIG: YouTubeSafeZoneConfig = {
  // En base a la resolución nativa 1280 x 720
  timestampBox: {
    x: 1040,
    y: 640,
    width: 220,
    height: 60,
  },
  paddingX: 64, // 5% de 1280
  paddingY: 43, // 6% de 720
};

export class YouTubeSafeZoneGuard {
  static checkCollision(
    rect: { x: number; y: number; width: number; height: number },
    config = YOUTUBE_SAFE_ZONE_CONFIG
  ): boolean {
    const ts = config.timestampBox;

    const rectRight = rect.x + rect.width;
    const rectBottom = rect.y + rect.height;
    const tsRight = ts.x + ts.width;
    const tsBottom = ts.y + ts.height;

    // AABB intersection check
    const isSeparated =
      rectRight < ts.x ||
      rect.x > tsRight ||
      rectBottom < ts.y ||
      rect.y > tsBottom;

    return !isSeparated;
  }
}
