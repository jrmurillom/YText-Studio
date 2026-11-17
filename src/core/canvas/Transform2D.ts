export interface Point2D {
  x: number;
  y: number;
}

export interface BoundingBox2D {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // en grados
}

export type HandleType =
  | 'TL'
  | 'TR'
  | 'BL'
  | 'BR'
  | 'T'
  | 'B'
  | 'L'
  | 'R'
  | 'ROT'
  | 'BODY'
  | 'NONE';

export interface HandlePoint {
  type: HandleType;
  x: number;
  y: number;
}

export class Transform2D {
  static readonly ROTATION_STEM_OFFSET = 36; // Distancia del tirador de rotación sobre el borde superior

  static getCenter(box: BoundingBox2D): Point2D {
    return {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };
  }

  /**
   * Transforma un punto global al espacio local no rotado con PIVOTE EN EL CENTRO
   */
  static toLocalPoint(point: Point2D, box: BoundingBox2D): Point2D {
    const center = this.getCenter(box);
    const rotRad = (-box.rotation * Math.PI) / 180;
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
      x: dx * cos - dy * sin + box.width / 2,
      y: dx * sin + dy * cos + box.height / 2,
    };
  }

  /**
   * Transforma un punto local de la caja al espacio global con PIVOTE EN EL CENTRO
   */
  static toGlobalPoint(localPoint: Point2D, box: BoundingBox2D): Point2D {
    const center = this.getCenter(box);
    const rotRad = (box.rotation * Math.PI) / 180;
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);

    const dx = localPoint.x - box.width / 2;
    const dy = localPoint.y - box.height / 2;

    return {
      x: center.x + (dx * cos - dy * sin),
      y: center.y + (dx * sin + dy * cos),
    };
  }

  /**
   * Obtiene la posición local de cada uno de los 9 tiradores
   */
  static getLocalHandles(box: BoundingBox2D): HandlePoint[] {
    const w = box.width;
    const h = box.height;
    const midX = w / 2;
    const midY = h / 2;

    return [
      { type: 'TL', x: 0, y: 0 },
      { type: 'T', x: midX, y: 0 },
      { type: 'TR', x: w, y: 0 },
      { type: 'R', x: w, y: midY },
      { type: 'BR', x: w, y: h },
      { type: 'B', x: midX, y: h },
      { type: 'BL', x: 0, y: h },
      { type: 'L', x: 0, y: midY },
      { type: 'ROT', x: midX, y: -this.ROTATION_STEM_OFFSET },
    ];
  }

  /**
   * Detecta sobre qué tirador o parte del cuerpo se encuentra un punto global
   */
  static hitTest(point: Point2D, box: BoundingBox2D, handleHitRadius = 14): HandleType {
    const local = this.toLocalPoint(point, box);

    // 1. Probar primero el tirador de rotación (con radio generoso para facilidad táctil)
    const rotHandle = { x: box.width / 2, y: -this.ROTATION_STEM_OFFSET };
    if (Math.hypot(local.x - rotHandle.x, local.y - rotHandle.y) <= handleHitRadius + 4) {
      return 'ROT';
    }

    // 2. Probar tiradores de escala
    const handles = this.getLocalHandles(box).filter((h) => h.type !== 'ROT');
    for (const h of handles) {
      const dist = Math.hypot(local.x - h.x, local.y - h.y);
      if (dist <= handleHitRadius) {
        return h.type;
      }
    }

    // 3. Probar cuerpo de la caja (arrastre)
    if (local.x >= 0 && local.x <= box.width && local.y >= 0 && local.y <= box.height) {
      return 'BODY';
    }

    return 'NONE';
  }

  static getCursor(handle: HandleType): string {
    switch (handle) {
      case 'TL':
      case 'BR':
        return 'nwse-resize';
      case 'TR':
      case 'BL':
        return 'nesw-resize';
      case 'T':
      case 'B':
        return 'ns-resize';
      case 'L':
      case 'R':
        return 'ew-resize';
      case 'ROT':
        return 'grab';
      case 'BODY':
        return 'move';
      default:
        return 'default';
    }
  }
}
