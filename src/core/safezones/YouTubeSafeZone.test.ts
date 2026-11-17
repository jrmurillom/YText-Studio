import { describe, it, expect } from 'vitest';
import { YouTubeSafeZoneGuard, YOUTUBE_SAFE_ZONE_CONFIG } from './YouTubeSafeZone';

describe('YouTubeSafeZoneGuard', () => {
  it('detecta colisión cuando una caja se superpone con el timestamp inferior derecho', () => {
    // Caja situada exactamente sobre el timestamp (1040, 640)
    const collidingBox = {
      x: 1050,
      y: 650,
      width: 100,
      height: 40,
    };

    const hasCollision = YouTubeSafeZoneGuard.checkCollision(collidingBox);
    expect(hasCollision).toBe(true);
  });

  it('no detecta colisión cuando el texto está en la zona superior izquierda segura', () => {
    const safeBox = {
      x: 64,
      y: 48,
      width: 400,
      height: 120,
    };

    const hasCollision = YouTubeSafeZoneGuard.checkCollision(safeBox);
    expect(hasCollision).toBe(false);
  });

  it('respeta las constantes de la Safe Zone de YouTube en 1280x720', () => {
    expect(YOUTUBE_SAFE_ZONE_CONFIG.timestampBox.x).toBe(1040);
    expect(YOUTUBE_SAFE_ZONE_CONFIG.timestampBox.y).toBe(640);
    expect(YOUTUBE_SAFE_ZONE_CONFIG.timestampBox.width).toBe(220);
    expect(YOUTUBE_SAFE_ZONE_CONFIG.timestampBox.height).toBe(60);
  });

  it('aplica snap-back elástico correctivo si una caja invade el timestamp', () => {
    const invadingPos = { x: 1050, y: 645 };
    const boxSize = { width: 120, height: 50 };

    const correctedPos = YouTubeSafeZoneGuard.applySnapBack(invadingPos, boxSize);

    // Debe empujar Y por encima del timestamp (640 - 50 - 16 = 574)
    expect(correctedPos.y).toBe(574);
    expect(correctedPos.x).toBe(1050);

    // La nueva posición corregida ya no debe colisionar
    const stillColliding = YouTubeSafeZoneGuard.checkCollision({ ...correctedPos, ...boxSize });
    expect(stillColliding).toBe(false);
  });
});
