/**
 * Preloader Asíncrono de Tipografías Display para Thumbnails
 * Evita mediciones erróneas o renderizado con fuentes fallback rotas (FOUC)
 */

export class FontLoader {
  private static loadedFonts = new Set<string>();

  static readonly DISPLAY_FONTS = [
    { family: 'Montserrat', weight: '900' },
    { family: 'Anton', weight: '400' },
    { family: 'Bebas Neue', weight: '400' },
    { family: 'Cinzel', weight: '700' },
    { family: 'Inter', weight: '800' },
    { family: 'Rubik', weight: '900' },
    { family: 'Luckiest Guy', weight: '400' },
    { family: 'Bangers', weight: '400' },
    { family: 'Teko', weight: '700' },
    { family: 'Permanent Marker', weight: '400' },
    { family: 'Poppins', weight: '900' },
    { family: 'Playfair Display', weight: '900' },
  ];

  static async loadAll(): Promise<void> {
    if (typeof document === 'undefined' || !document.fonts) return;

    const promises = this.DISPLAY_FONTS.map(async ({ family, weight }) => {
      const fontKey = `${weight}_${family}`;
      if (this.loadedFonts.has(fontKey)) return;

      try {
        await document.fonts.load(`${weight} 64px "${family}"`);
        this.loadedFonts.add(fontKey);
      } catch (err) {
        console.warn(`[FontLoader] No se pudo precargar la fuente: ${family}`, err);
      }
    });

    await Promise.all(promises);
  }

  static isLoaded(family: string, weight = '400'): boolean {
    return this.loadedFonts.has(`${weight}_${family}`);
  }
}
