import { describe, it, expect } from 'vitest';
import { Transform2D, BoundingBox2D, Point2D } from './Transform2D';

describe('Transform2D Engine', () => {
  const sampleBox: BoundingBox2D = {
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    rotation: 0,
  };

  it('calcula puntos locales y globales correctamente sin rotación', () => {
    const globalPt: Point2D = { x: 150, y: 150 };
    const localPt = Transform2D.toLocalPoint(globalPt, sampleBox);

    expect(localPt.x).toBe(50);
    expect(localPt.y).toBe(50);

    const backToGlobal = Transform2D.toGlobalPoint(localPt, sampleBox);
    expect(backToGlobal.x).toBe(150);
    expect(backToGlobal.y).toBe(150);
  });

  it('calcula los 9 tiradores (8 de escala + 1 de rotación)', () => {
    const handles = Transform2D.getLocalHandles(sampleBox);
    expect(handles.length).toBe(9);

    const rotHandle = handles.find((h) => h.type === 'ROT');
    expect(rotHandle).toBeDefined();
    expect(rotHandle?.x).toBe(100); // midX = 200 / 2
    expect(rotHandle?.y).toBe(-Transform2D.ROTATION_STEM_OFFSET);

    const brHandle = handles.find((h) => h.type === 'BR');
    expect(brHandle?.x).toBe(200);
    expect(brHandle?.y).toBe(100);
  });

  it('detecta colisiones precisas de hitTest (ROT, BODY, BR, NONE)', () => {
    // 1. Clic sobre el tirador de rotación
    const rotGlobal: Point2D = {
      x: 100 + 100, // box.x + midX
      y: 100 - Transform2D.ROTATION_STEM_OFFSET,
    };
    expect(Transform2D.hitTest(rotGlobal, sampleBox, 10)).toBe('ROT');

    // 2. Clic en la esquina inferior derecha
    const brGlobal: Point2D = { x: 300, y: 200 };
    expect(Transform2D.hitTest(brGlobal, sampleBox, 10)).toBe('BR');

    // 3. Clic dentro del cuerpo de la caja
    const bodyGlobal: Point2D = { x: 150, y: 150 };
    expect(Transform2D.hitTest(bodyGlobal, sampleBox, 10)).toBe('BODY');

    // 4. Clic fuera de la caja
    const outsideGlobal: Point2D = { x: 50, y: 50 };
    expect(Transform2D.hitTest(outsideGlobal, sampleBox, 10)).toBe('NONE');
  });

  it('proporciona cursores CSS coherentes para cada tirador', () => {
    expect(Transform2D.getCursor('ROT')).toBe('grab');
    expect(Transform2D.getCursor('BODY')).toBe('move');
    expect(Transform2D.getCursor('BR')).toBe('nwse-resize');
    expect(Transform2D.getCursor('TR')).toBe('nesw-resize');
    expect(Transform2D.getCursor('NONE')).toBe('default');
  });
});
