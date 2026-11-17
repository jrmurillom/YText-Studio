export interface PreprocessedImageResult {
  base64Data: string; // Base64 puro sin prefijo data:image/...
  dataUrl: string;    // DataURL completo
  width: number;
  height: number;
  sizeBytes: number;
  sizeKb: number;
}

export class ImagePreprocessor {
  static readonly MAX_TARGET_WIDTH = 640;

  /**
   * Procesa y comprime una imagen en cliente a WebP ligero (<50KB) para enviar a la IA
   */
  static async compressForLMM(
    imageSource: HTMLImageElement | string,
    maxWidth = ImagePreprocessor.MAX_TARGET_WIDTH
  ): Promise<PreprocessedImageResult> {
    const img = await this.resolveImage(imageSource);

    // Calcular escala proporcional manteniendo el aspect ratio
    let targetWidth = img.naturalWidth || img.width;
    let targetHeight = img.naturalHeight || img.height;

    if (targetWidth > maxWidth) {
      const ratio = maxWidth / targetWidth;
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    // Usar canvas fuera de pantalla para rasterizar
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No se pudo obtener el contexto 2D para compresión');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Intentar exportar a WebP, fallback a JPEG
    let dataUrl = canvas.toDataURL('image/webp', 0.82);
    if (!dataUrl.startsWith('data:image/webp')) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    }

    const base64Data = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    const sizeBytes = Math.round((base64Data.length * 3) / 4);
    const sizeKb = Number((sizeBytes / 1024).toFixed(1));

    return {
      base64Data,
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      sizeBytes,
      sizeKb,
    };
  }

  private static resolveImage(source: HTMLImageElement | string): Promise<HTMLImageElement> {
    if (typeof source !== 'string') {
      if (source.complete && source.naturalWidth > 0) {
        return Promise.resolve(source);
      }
      return new Promise((resolve, reject) => {
        source.onload = () => resolve(source);
        source.onerror = (err) => reject(err);
      });
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = source;
    });
  }
}
