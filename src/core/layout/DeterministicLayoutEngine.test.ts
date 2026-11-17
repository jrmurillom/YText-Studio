import { describe, it, expect } from 'vitest';
import { DeterministicLayoutEngine } from './DeterministicLayoutEngine';
import { YOUTUBE_SAFE_ZONE_CONFIG } from '@/core/safezones/YouTubeSafeZone';

describe('DeterministicLayoutEngine', () => {
  const groupW = 400;
  const groupH = 150;

  it('calcula la posición TOP_LEFT con márgenes de seguridad', () => {
    const pos = DeterministicLayoutEngine.calculateCoordinates('TOP_LEFT', groupW, groupH);
    expect(pos.x).toBe(DeterministicLayoutEngine.PADDING_X); // 64px
    expect(pos.y).toBe(DeterministicLayoutEngine.PADDING_Y); // 48px
  });

  it('calcula la posición CENTER_LEFT centrada verticalmente', () => {
    const pos = DeterministicLayoutEngine.calculateCoordinates('CENTER_LEFT', groupW, groupH);
    expect(pos.x).toBe(DeterministicLayoutEngine.PADDING_X);
    expect(pos.y).toBe(Math.round((720 - groupH) / 2)); // (720 - 150) / 2 = 285px
  });

  it('calcula la posición TOP_RIGHT alineada al borde derecho con padding', () => {
    const pos = DeterministicLayoutEngine.calculateCoordinates('TOP_RIGHT', groupW, groupH);
    const expectedX = 1280 - groupW - DeterministicLayoutEngine.PADDING_X;
    expect(pos.x).toBe(expectedX);
    expect(pos.y).toBe(DeterministicLayoutEngine.PADDING_Y);
  });

  it('evita la colisión con la zona de exclusión del Timestamp de YouTube', () => {
    // Si se posicionara en la esquina inferior derecha
    const ts = YOUTUBE_SAFE_ZONE_CONFIG.timestampBox;
    const pos = DeterministicLayoutEngine.calculateCoordinates('BOTTOM_LEFT', groupW, groupH);

    // BOTTOM_LEFT no debe chocar
    expect(pos.x).toBe(DeterministicLayoutEngine.PADDING_X);
    expect(pos.y + groupH).toBeLessThanOrEqual(720 - DeterministicLayoutEngine.PADDING_Y);
    expect(pos.x + groupW).toBeLessThan(ts.x);
  });
});
