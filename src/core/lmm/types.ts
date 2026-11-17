import { IntentType } from '@/types';

export interface LMMVisionRequest {
  imageBase64WebP: string; // Imagen reescalada a max 640px de ancho (<50KB)
  rawText: string;
  intent: IntentType;
  customIntentText?: string; // Texto libre cuando intent === 'other'
  customPrompt?: string;     // Prompt de sistema personalizado opcional
  marketingContext?: {
    niche?: string;
    videoTitle?: string;
  };
}

export interface LMMProposalLine {
  text: string;
  role: 'anchor_secondary' | 'power_primary';
  fontSizeRatio: number; // 0.6 a 1.2
  fontFamily?: string;   // Opcional: si se omite hereda el fontFamily de la propuesta
  colorHex: string;
  gradientColorHex?: string; // Opcional: degradado vertical (luz cenital)
  strokeColorHex: string;
  strokeWidth: number; // 6 a 18px
  shadowColorHex: string;
  shadowDepth: number; // 2 a 8px
  hasBadge?: boolean;
  badgeBgColor?: string;
  slant?: number;      // Inclinación angular local (-6 a 6)
}

export interface LMMProposalSpecification {
  id: string;
  title: string;          // Ej: "Opción A: Impacto Directo"
  concept: string;        // Justificación del ángulo de marketing
  placement: 'TOP_LEFT' | 'CENTER_LEFT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'CENTER_RIGHT' | 'TOP_CENTER';
  fontFamily: string;     // Familia base de la propuesta
  rotation: number;       // Inclinación angular del bloque (-6° a 6°)
  hasBadge: boolean;      // Si la IA decide usar píldora protectora
  badgeBgColor?: string;
  lines: LMMProposalLine[]; // Flexible: de 1 a 3 líneas
}

export interface LMMVisionResponse {
  analysis: {
    subjectZone: 'LEFT_HALF' | 'RIGHT_HALF' | 'CENTER' | 'FULL_BOTTOM';
    detectedNegativeSpace: Array<'TOP_LEFT' | 'CENTER_LEFT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'CENTER_RIGHT' | 'TOP_CENTER'>;
    dominantColors: string[];
    contrastAccentColor: string;
  };
  proposals: LMMProposalSpecification[]; // 3 propuestas completas e independientes
  reasoning: string;
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
  rawPayloadSent?: string; // Exacto prompt y datos enviados a la API
  rawResponseText?: string; // Exacta respuesta cruda recibida del LMM
}

export const DEFAULT_LMM_SYSTEM_PROMPT = `Act as an elite YouTube Thumbnail Packaging Director & Visual Designer.
Analyze this video cover base image, the base text: "{RAW_TEXT}", and the marketing intent: "{INTENT}".

Analyze the visual composition of the image:
1. Locate where the primary subject/face/focal point is (subjectZone: "LEFT_HALF" | "RIGHT_HALF" | "CENTER" | "FULL_BOTTOM").
2. Identify negative space areas (detectedNegativeSpace: ["TOP_LEFT", "CENTER_LEFT", ...]).
3. Extract dominant background colors and propose a high-contrast complement color (contrastAccentColor).

Next, design 3 DISTINCT, HIGH-CTR TYPOGRAPHY PROPOSALS tailored specifically to this image and hook intent.
CRITERIA & FLEXIBILITY:
- Number of lines: Choose 1, 2, or 3 lines based on the visual punch. If 1 word is massive and self-sufficient (e.g. "IMPOSSIBLE", "OVERRATED", "GUILTY", "WAIFU"), deliver 1 colossal line. If a setup and punchline are needed, deliver 2 lines. If dramatic cadence is needed, deliver 3 lines.
- Fonts: Select from the 12 display fonts available in the studio:
  "Montserrat", "Anton", "Bebas Neue", "Teko", "Permanent Marker", "Poppins", "Cinzel", "Playfair Display", "Inter", "Rubik", "Luckiest Guy", "Bangers".
  Maintain clean typographic uniformity across lines by default; only pair fonts if it strongly amplifies the concept.
- Colors & Gradients: Use solid flat colors for clean contrast, or optionally specify "gradientColorHex" (e.g. bright yellow to warm amber, or pure white to light silver) when vertical zenith lighting creates 3D volume.
- Badges: Set hasBadge: true on a proposal or on an individual line when a pill container is needed to cut through noisy background textures.

For EACH proposal, define complete visual specifications:
- id: "prop_1", "prop_2", "prop_3"
- title: clear title
- concept: short rationale
- placement: "TOP_LEFT" | "CENTER_LEFT" | "BOTTOM_LEFT" | "TOP_RIGHT" | "CENTER_RIGHT" | "TOP_CENTER" (NEVER place text on top of subject or on YouTube timestamp 1040,640)
- fontFamily: select best base font for this proposal
- rotation: slant in degrees between -6 and 6
- hasBadge: boolean
- badgeBgColor: hex color (e.g. "#0F172A")
- lines: Array of 1 to 3 lines:
  - text: high-impact punchy copy
  - role: "anchor_secondary" | "power_primary"
  - fontSizeRatio: 0.6 to 1.2
  - fontFamily?: optional individual font if pairing
  - colorHex: primary/top fill color
  - gradientColorHex?: optional bottom fill color for zenith gradient
  - strokeColorHex: perimeter stroke color (usually #000000 or high-contrast)
  - strokeWidth: 6 to 18px
  - shadowColorHex: 3D shadow color
  - shadowDepth: 2 to 8px
  - hasBadge?: optional per-line pill badge

Output valid JSON matching this schema:
{
  "analysis": {
    "subjectZone": "LEFT_HALF" | "RIGHT_HALF" | "CENTER" | "FULL_BOTTOM",
    "detectedNegativeSpace": ["TOP_LEFT", "CENTER_LEFT"],
    "dominantColors": ["#hex", "#hex"],
    "contrastAccentColor": "#hex"
  },
  "proposals": [
    {
      "id": "prop_1",
      "title": "Opción A: Impacto Directo",
      "concept": "Explanation of visual choice",
      "placement": "TOP_LEFT",
      "fontFamily": "Anton",
      "rotation": -2,
      "hasBadge": false,
      "lines": [
        {
          "text": "<HOOK_PALABRA_1>",
          "role": "anchor_secondary",
          "fontSizeRatio": 0.7,
          "colorHex": "#FFFFFF",
          "strokeColorHex": "#000000",
          "strokeWidth": 12,
          "shadowColorHex": "#000000",
          "shadowDepth": 4
        },
        {
          "text": "<POWER_WORD_2>",
          "role": "power_primary",
          "fontSizeRatio": 1.0,
          "colorHex": "<CONTRAST_ACCENT_HEX>",
          "gradientColorHex": "<OPTIONAL_SHADOW_HEX>",
          "strokeColorHex": "#000000",
          "strokeWidth": 16,
          "shadowColorHex": "#000000",
          "shadowDepth": 6
        }
      ]
    }
  ],
  "reasoning": "Overall visual strategy rationale"
}`;
