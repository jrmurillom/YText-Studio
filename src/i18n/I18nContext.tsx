import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import enCommon from './locales/en/common.json';
import enInspector from './locales/en/inspector.json';
import enSettings from './locales/en/settings.json';
import enModals from './locales/en/modals.json';
import esCommon from './locales/es/common.json';
import esInspector from './locales/es/inspector.json';
import esSettings from './locales/es/settings.json';
import esModals from './locales/es/modals.json';
import {
  SupportedLocale,
  TranslationDictionaries,
  Namespace,
  TranslationKey,
  TranslationParams,
} from './types';

export const DICTIONARIES: Record<SupportedLocale, TranslationDictionaries> = {
  en: {
    common: enCommon,
    inspector: enInspector,
    settings: enSettings,
    modals: enModals,
  },
  es: {
    common: esCommon,
    inspector: esInspector,
    settings: esSettings,
    modals: esModals,
  },
};

export const SUPPORTED_LANGUAGES: ReadonlyArray<{
  code: SupportedLocale;
  label: string;
  badge: string;
}> = [
  { code: 'en', label: 'English', badge: 'EN' },
  { code: 'es', label: 'Español', badge: 'ES' },
];

/**
 * Detecta el idioma inicial priorizando la clave dedicada `ytext_locale` en almacenamiento;
 * si no existe, inspecciona el idioma del navegador y usa 'en' como fallback.
 */
export function detectInitialLocale(savedLocale?: SupportedLocale): SupportedLocale {
  if (savedLocale === 'en' || savedLocale === 'es') {
    return savedLocale;
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('ytext_locale');
      if (stored === 'en' || stored === 'es') {
        return stored;
      }
    } catch {
      // ignore
    }
  }
  if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') {
    if (navigator.language.toLowerCase().startsWith('es')) {
      return 'es';
    }
  }
  return 'en';
}

/**
 * Resuelve una clave tipada `namespace.key` en el diccionario activo con fallback al inglés
 * e interpolación ligera `{variable}`.
 */
export function translate(
  locale: SupportedLocale,
  key: TranslationKey,
  params?: TranslationParams
): string {
  const dotIdx = key.indexOf('.');
  if (dotIdx === -1) return key;

  const ns = key.slice(0, dotIdx) as Namespace;
  const prop = key.slice(dotIdx + 1);

  const localeNs = DICTIONARIES[locale]?.[ns] as Record<string, string> | undefined;
  const fallbackNs = DICTIONARIES.en[ns] as Record<string, string> | undefined;
  const template = localeNs?.[prop] ?? fallbackNs?.[prop] ?? key;

  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (full, varName: string) =>
    params[varName] !== undefined ? String(params[varName]) : full
  );
}

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key, params) => translate('en', key, params),
});

export interface I18nProviderProps {
  initialLocale?: SupportedLocale;
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  initialLocale,
  children,
}) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    return detectInitialLocale(initialLocale);
  });

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('ytext_locale', newLocale);
      } catch {
        // ignore
      }
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(locale, key, params),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useTranslation(): I18nContextValue {
  return useContext(I18nContext);
}
