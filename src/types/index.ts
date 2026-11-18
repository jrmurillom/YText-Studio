/**
 * Dominio de Tipos y Modelos de Datos para YText Studio
 */

export type IntentType = 'hype' | 'horror' | 'mystery' | 'tech' | 'alert' | 'authority' | 'other';

export type LMMProviderType = 'gemini' | 'openrouter' | 'openai' | 'ollama';

export interface LMMConfig {
  provider: LMMProviderType;
  apiKey: string;
  model: string;
  customEndpoint?: string;
  proposalCount?: number; // Cantidad de propuestas deseadas (3, 4 o 5)
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
  fontFamily: string;
  fontSize: number; // En px relativos al master canvas de 1280x720
  colorHex: string;
  gradientColorHex?: string; // Opcional: degradado vertical (luz cenital)
  strokeColorHex: string;
  strokeWidth: number; // En px
  shadowColorHex: string;
  shadowDepth: number; // En px
  slant: number; // Grados de inclinación (-10 a 10)
  hasBadge?: boolean;
  badgeBgColor?: string;
  offsetX?: number; // Desplazamiento horizontal relativo en px (-150 a 150)
  offsetY?: number; // Desplazamiento vertical relativo en px (-80 a 80)
  rotation?: number; // Rotación angular individual en grados (-25 a 25)
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
  placement?: 'TOP_LEFT' | 'CENTER_LEFT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'CENTER_RIGHT' | 'TOP_CENTER';
}

export interface ProposalCard {
  id: string;
  title: string;
  concept?: string;
  copySummary: string; // Resumen del copy generado por la IA
  placement: 'TOP_LEFT' | 'CENTER_LEFT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'CENTER_RIGHT' | 'TOP_CENTER';
  fontFamily: string;
  previewGroup: CompositeTextGroup;
  isOfflineFallback?: boolean; // Indica si se generó por heurística local sin LMM real
}

export interface LMMTelemetry {
  provider: string;
  model: string;
  latencyMs: number;
  timestamp: string;
  isOfflineFallback: boolean;
  subjectZone?: string;
  recommendedPlacement?: string;
  contrastAccentColor?: string;
  reasoning?: string;
  rawPayloadSent?: string;
  rawResponseText?: string;
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

export interface GraphicAssetElement {
  id: string;
  type: 'graphic_asset';
  name: string;
  dataUrl: string;
  x: number; // Coordenada X superior izquierda en master 1280x720
  y: number; // Coordenada Y
  width: number; // Ancho base en px
  height: number; // Alto base en px
  rotation: number; // Ángulo de rotación (-180° a 180°)
  scale: number; // Factor de escala (0.1 a 3.0)
  opacity: number; // Opacidad (0.0 a 1.0)
  hasStickerBorder: boolean; // Efecto de borde blanco/color recortado
  borderWidth: number; // Grosor del borde en px (ej. 6)
  borderColorHex: string; // Color del borde (default: #FFFFFF)
  hasShadow: boolean; // Sombra dura 3D a 45°
  shadowDepth: number; // Profundidad de sombra en px (ej. 6)
  shadowColorHex: string; // Color de sombra (default: #000000)
  zIndex: number; // Orden de profundidad en la pila
}

export type ActiveCanvasElement =
  | { type: 'text' }
  | { type: 'asset'; id: string }
  | null;

