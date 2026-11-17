/**
 * Dominio de Tipos y Modelos de Datos para YText Studio
 */

export type IntentType = 'hype' | 'horror' | 'mystery' | 'tech' | 'alert' | 'authority';

export type TypoPresetId = 'mrbeast_pop' | 'docu_drama' | 'gaming_neon' | 'authority_badge';

export type LMMProviderType = 'gemini' | 'openrouter' | 'openai' | 'ollama';

export interface LMMConfig {
  provider: LMMProviderType;
  apiKey: string;
  model: string;
  customEndpoint?: string;
}

export interface BaseImageState {
  file: File | null;
  dataUrl: string | null;
  width: number;
  height: number;
  isLoaded: boolean;
}

export interface TextSegment {
  id: string;
  text: string;
  role: 'anchor_secondary' | 'power_primary';
  presetId: TypoPresetId;
  fontFamily: string;
  fontSize: number; // En px relativos al master canvas de 1280x720
  colorHex: string;
  strokeColorHex: string;
  strokeWidth: number; // En px
  shadowColorHex: string;
  shadowDepth: number; // En px
  slant: number; // Grados de inclinación (-10 a 10)
  hasBadge?: boolean;
  badgeBgColor?: string;
}

export interface CompositeTextGroup {
  id: string;
  segments: TextSegment[];
  x: number; // Coordenada X normalizada o en px de 1280x720
  y: number; // Coordenada Y
  width: number;
  height: number;
  rotation: number; // Grados
  scale: number; // Factor de escala (1.0 = 100%)
}

export interface ProposalCard {
  id: string;
  title: string;
  subtitle: string;
  intent: IntentType;
  presetId: TypoPresetId;
  placement: 'TOP_LEFT' | 'CENTER_LEFT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'CENTER_RIGHT' | 'TOP_CENTER';
  previewGroup: CompositeTextGroup;
}

export interface YouTubeSafeZoneConfig {
  timestampBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  paddingX: number;
  paddingY: number;
}
