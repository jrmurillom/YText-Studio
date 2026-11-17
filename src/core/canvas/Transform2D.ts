export interface Point2D {
  x: number;
  y: number;
}

export interface BoundingBox2D {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // en radianes
}

export class Transform2D {
  static createMatrix(x: number, y: number, scale = 1, rotationRad = 0): DOMMatrix {
    const matrix = new DOMMatrix();
    matrix.translateSelf(x, y);
    matrix.rotateSelf((rotationRad * 180) / Math.PI);
    matrix.scaleSelf(scale, scale);
    return matrix;
  }

  static isPointInBox(point: Point2D, box: BoundingBox2D): boolean {
    // Transformar el punto al espacio local de la caja
    const cos = Math.cos(-box.rotation);
    const sin = Math.sin(-box.rotation);
    const dx = point.x - box.x;
    const dy = point.y - box.y;

    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    return (
      localX >= 0 &&
      localX <= box.width &&
      localY >= 0 &&
      localY <= box.height
    );
  }
}
