import enCommon from './locales/en/common.json';
import enInspector from './locales/en/inspector.json';
import enSettings from './locales/en/settings.json';
import enModals from './locales/en/modals.json';
import { SupportedLocale } from '@/types';

export type { SupportedLocale };

export interface TranslationDictionaries {
  common: typeof enCommon;
  inspector: typeof enInspector;
  settings: typeof enSettings;
  modals: typeof enModals;
}

export type Namespace = keyof TranslationDictionaries;

export type TranslationKey = {
  [N in Namespace]: `${N}.${Extract<keyof TranslationDictionaries[N], string>}`;
}[Namespace];

export type TranslationParams = Record<string, string | number>;
