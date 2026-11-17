import { TypoPresetId } from '@/types';

export interface TypoPresetDefinition {
  id: TypoPresetId;
  name: string;
  description: string;
  fontFamily: string;
  fillColorHex: string;
  strokeColorHex: string;
  strokeWidth: number;
  shadowColorHex: string;
  shadowDepth: number;
  slant: number;
  hasBadge?: boolean;
  badgeBgColor?: string;
}

export const TYPO_PRESETS: Record<TypoPresetId, TypoPresetDefinition> = {
  mrbeast_pop: {
    id: 'mrbeast_pop',
    name: 'Viral Pop',
    description: 'Amarillo neón 3D con doble borde negro masivo',
    fontFamily: 'Luckiest Guy',
    fillColorHex: '#FFE600',
    strokeColorHex: '#000000',
    strokeWidth: 16,
    shadowColorHex: '#000000',
    shadowDepth: 8,
    slant: -2,
  },
  docu_drama: {
    id: 'docu_drama',
    name: 'Docu-Drama',
    description: 'Blanco monolítico con sombra profunda y tracking cerrado',
    fontFamily: 'Anton',
    fillColorHex: '#FFFFFF',
    strokeColorHex: '#000000',
    strokeWidth: 14,
    shadowColorHex: '#000000',
    shadowDepth: 10,
    slant: 0,
  },
  gaming_neon: {
    id: 'gaming_neon',
    name: 'Gaming Neon',
    description: 'Cian neón con inclinación dinámica y resplandor perimetral',
    fontFamily: 'Bangers',
    fillColorHex: '#00F5FF',
    strokeColorHex: '#000000',
    strokeWidth: 14,
    shadowColorHex: '#FF007F',
    shadowDepth: 6,
    slant: -5,
  },
  authority_badge: {
    id: 'authority_badge',
    name: 'Authority / Badge',
    description: 'Letras mayúsculas compactas sobre contenedor protector negro',
    fontFamily: 'Montserrat',
    fillColorHex: '#FFFFFF',
    strokeColorHex: '#000000',
    strokeWidth: 0,
    shadowColorHex: '#000000',
    shadowDepth: 4,
    slant: 0,
    hasBadge: true,
    badgeBgColor: '#000000',
  },
};
