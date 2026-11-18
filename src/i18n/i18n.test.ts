import { describe, it, expect, afterEach } from 'vitest';
import { translate, detectInitialLocale, DICTIONARIES } from './I18nContext';
import { Namespace } from './types';

describe('i18n Engine (Modular Dictionaries & Typed Interpolation)', () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('resuelve claves estáticas correctamente para inglés y español', () => {
    expect(translate('en', 'common.safeZones')).toBe('Safe Zones');
    expect(translate('es', 'common.safeZones')).toBe('Zonas Seguras');
    expect(translate('en', 'settings.saveSettings')).toBe('Save Settings');
    expect(translate('es', 'settings.saveSettings')).toBe('Guardar Ajustes');
  });

  it('interpola múltiples parámetros dinámicos `{variable}` en ambos idiomas', () => {
    expect(translate('en', 'inspector.titleLines', { current: 2, max: 3 })).toBe('Title Lines (2/3)');
    expect(translate('es', 'inspector.titleLines', { current: 2, max: 3 })).toBe('Líneas de Título (2/3)');
    expect(translate('en', 'modals.analyzingBtn', { seconds: '1.4' })).toBe('Analyzing with AI (1.4s)...');
    expect(translate('es', 'modals.analyzingBtn', { seconds: '1.4' })).toBe('Analizando con IA (1.4s)...');
  });

  it('detectInitialLocale prioriza el idioma guardado en la configuración sobre el navegador', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'es-MX' },
      configurable: true,
      writable: true,
    });

    expect(detectInitialLocale('en')).toBe('en');
    expect(detectInitialLocale('es')).toBe('es');
  });

  it('detectInitialLocale detecta español por navegador y usa inglés como fallback', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'es-ES' },
      configurable: true,
      writable: true,
    });
    expect(detectInitialLocale(undefined)).toBe('es');

    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'fr-FR' },
      configurable: true,
      writable: true,
    });
    expect(detectInitialLocale(undefined)).toBe('en');
  });

  it('detectInitialLocale prioriza localStorage ytext_locale sobre el navegador', () => {
    const mockStorage: Record<string, string> = { ytext_locale: 'es' };
    const originalLocalStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k: string) => mockStorage[k] || null,
        setItem: (k: string, v: string) => { mockStorage[k] = v; },
      },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'en-US' },
      configurable: true,
      writable: true,
    });

    expect(detectInitialLocale(undefined)).toBe('es');

    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  });

  it('mantiene paridad exacta de claves y placeholders entre los diccionarios EN y ES', () => {
    const namespaces: Namespace[] = ['common', 'inspector', 'settings', 'modals'];

    for (const ns of namespaces) {
      const enKeys = Object.keys(DICTIONARIES.en[ns]).sort();
      const esKeys = Object.keys(DICTIONARIES.es[ns]).sort();

      expect(esKeys).toEqual(enKeys);

      for (const key of enKeys) {
        const enVal = (DICTIONARIES.en[ns] as Record<string, string>)[key];
        const esVal = (DICTIONARIES.es[ns] as Record<string, string>)[key];

        expect(typeof enVal).toBe('string');
        expect(typeof esVal).toBe('string');
        expect(enVal.length).toBeGreaterThan(0);
        expect(esVal.length).toBeGreaterThan(0);

        const enVars = (enVal.match(/\{(\w+)\}/g) || []).sort();
        const esVars = (esVal.match(/\{(\w+)\}/g) || []).sort();
        expect(esVars).toEqual(enVars);
      }
    }
  });
});
