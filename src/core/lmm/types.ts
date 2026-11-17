import { IntentType, TypoPresetId } from '@/types';

export interface LMMVisionRequest {
  imageBase64WebP: string; // Imagen reescalada a max 640px de ancho (<50KB)
  rawText: string;
  intent: IntentType;
  marketingContext?: {
    niche?: string;
    videoTitle?: string;
  };
}

export interface LMMVisionResponse {
  analysis: {
    subjectZone: 'LEFT_HALF' | 'RIGHT_HALF' | 'CENTER' | 'FULL_BOTTOM';
    recommendedPlacement: 'TOP_LEFT' | 'CENTER_LEFT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'CENTER_RIGHT' | 'TOP_CENTER';
    dominantColors: string[];
    contrastAccentColor: string;
  };
  segmentation: {
    lines: Array<{
      text: string;
      role: 'anchor_secondary' | 'power_primary';
      suggestedPresetId: TypoPresetId;
      fontSizeRatio: number;
      colorHex: string;
      strokeColorHex: string;
    }>;
  };
  reasoning: string;
}
