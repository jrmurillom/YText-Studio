import { describe, it, expect } from 'vitest';
import { ImagePreprocessor } from './ImagePreprocessor';

describe('ImagePreprocessor', () => {
  it('define el límite dimensional máximo en 640px para optimización de tokens', () => {
    expect(ImagePreprocessor.MAX_TARGET_WIDTH).toBe(640);
  });
});
