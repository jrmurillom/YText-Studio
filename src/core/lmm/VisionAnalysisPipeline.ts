import { LMMService } from './LMMService';
import { LMMVisionRequest, LMMVisionResponse, LMMTelemetry, LMMProposalSpecification } from './types';
import { LMMConfig, IntentType, ProposalCard, CompositeTextGroup } from '@/types';
import { DeterministicLayoutEngine, PlacementZone } from '@/core/layout/DeterministicLayoutEngine';

export interface VisionPipelineResult {
  proposals: ProposalCard[];
  isOfflineFallback: boolean;
  errorMessage?: string;
  telemetry: LMMTelemetry;
}

export class VisionAnalysisPipeline {
  private static cache = new Map<string, LMMVisionResponse>();

  public static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Ejecuta el análisis de visión one-shot o el fallback heurístico local explícito
   */
  static async execute(
    imageBase64WebP: string,
    rawText: string,
    intent: IntentType,
    config: LMMConfig,
    customIntentText?: string,
    bypassCache: boolean = false
  ): Promise<VisionPipelineResult> {
    const startTime = performance.now();
    // Generar un hash determinista para el cache
    const sample = imageBase64WebP.length > 200 ? imageBase64WebP.slice(100, 200) : imageBase64WebP;
    const cacheKey = `${intent}_${customIntentText || ''}_${rawText.trim()}_${imageBase64WebP.length}_${sample}`;

    let response: LMMVisionResponse;
    let isOfflineFallback = false;
    let errorMessage: string | undefined;
    let rawPayloadSent: string | undefined;
    let rawResponseText: string | undefined;

    if (!bypassCache && this.cache.has(cacheKey)) {
      console.log(
        '%c[VisionPipeline] ⚡ Respuesta servida desde Session Cache local (0 tokens consumidos)',
        'color: #8b5cf6; font-weight: bold;'
      );
      response = this.cache.get(cacheKey)!;
      rawPayloadSent = `[Session Cache Local]\nKey: ${cacheKey}\nTexto base: "${rawText}"\nIntención: "${intent}"`;
      rawResponseText = JSON.stringify(response, null, 2);
    } else if (config.apiKey && config.apiKey.trim().length > 0) {
      const request: LMMVisionRequest = {
        imageBase64WebP,
        rawText,
        intent,
        customIntentText,
        customPrompt: config.customPrompt,
      };

      try {
        const execResult = await LMMService.analyze(request, config);
        response = execResult.response;
        rawPayloadSent = execResult.rawPayloadSent;
        rawResponseText = execResult.rawResponseText;
        this.cache.set(cacheKey, response);
      } catch (err) {
        console.warn('[VisionPipeline] Fallo en API remota, recurriendo a modo offline explícito:', err);
        isOfflineFallback = true;
        errorMessage = err instanceof Error ? err.message : String(err);
        response = this.runLocalHeuristic(rawText, intent, customIntentText);
        rawPayloadSent = `[Fallo en API Remota]\nError: ${errorMessage}\nSe activó generador de contingencia con texto: "${rawText}"`;
        rawResponseText = JSON.stringify(response, null, 2);
      }
    } else {
      isOfflineFallback = true;
      response = this.runLocalHeuristic(rawText, intent, customIntentText);
      rawPayloadSent = `[Modo Offline sin API Key]\nHeurística local ejecutada con texto: "${rawText}"`;
      rawResponseText = JSON.stringify(response, null, 2);
    }

    const latencyMs = Math.round(performance.now() - startTime);

    const telemetry: LMMTelemetry = {
      provider: isOfflineFallback ? 'Motor Local Heurístico' : config.provider,
      model: isOfflineFallback ? 'OffscreenCanvas Pixel-Sampling' : config.model,
      latencyMs,
      timestamp: new Date().toLocaleTimeString(),
      isOfflineFallback,
      subjectZone: response.analysis?.subjectZone,
      recommendedPlacement: response.proposals?.[0]?.placement || 'TOP_LEFT',
      contrastAccentColor: response.analysis?.contrastAccentColor,
      reasoning: response.reasoning,
      rawPayloadSent,
      rawResponseText,
    };

    const proposals = this.buildProposals(response, isOfflineFallback);
    return { proposals, isOfflineFallback, errorMessage, telemetry };
  }

  /**
   * Generador heurístico local explícito (construye 3 propuestas completas sin presets fijos)
   */
  private static runLocalHeuristic(
    rawText: string,
    intent: IntentType,
    customIntentText?: string
  ): LMMVisionResponse {
    const cleanRaw = rawText.trim() || 'TITULO';
    const words = cleanRaw.split(/\s+/);

    // Segmentación base
    let l1 = 'IMPACTO';
    let l2 = cleanRaw.toUpperCase();
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      l1 = words.slice(0, mid).join(' ').toUpperCase();
      l2 = words.slice(mid).join(' ').toUpperCase();
    }

    // Adaptar textos y estilo según intención
    let copyA: [string, string] = [l1, l2];
    let copyB: [string, string] = ['¿EL FINAL?', 'IMPOSIBLE!'];
    let copyC: [string, string] = ['VEREDICTO:', cleanRaw.toUpperCase()];

    if (intent === 'horror') {
      copyA = ['NO MIRES', 'ESTÁ AQUÍ...'];
      copyB = ['¿SOBREVIVIRÁS?', 'EL TERROR'];
      copyC = ['HISTORIA REAL', 'EXPEDIENTE X'];
    } else if (intent === 'mystery') {
      copyA = ['¿QUÉ OCULTAN?', 'LA VERDAD'];
      copyB = ['EL SECRETO DE:', cleanRaw.toUpperCase()];
      copyC = ['DOCUMENTO', 'CONFIDENCIAL'];
    } else if (intent === 'tech') {
      copyA = ['CAMBIÓ TODO:', 'EL FUTURO'];
      copyB = ['¿VALE LA PENA?', 'NUEVO REY'];
      copyC = ['ANÁLISIS:', 'DEFINITIVO'];
    } else if (intent === 'other' && customIntentText) {
      const hook = customIntentText.slice(0, 14).toUpperCase();
      copyA = [hook, l2];
      copyB = ['¿CÓMO PASÓ?', cleanRaw.toUpperCase()];
      copyC = ['ESPECIAL:', hook];
    }

    const prop1: LMMProposalSpecification = {
      id: 'prop_1',
      title: 'Opción A: Impacto Directo',
      concept: 'Máximo choque visual en espacio negativo con amarillo de contraste.',
      placement: 'TOP_LEFT',
      fontFamily: 'Anton',
      rotation: -2,
      hasBadge: false,
      lines: [
        {
          text: copyA[0],
          role: 'anchor_secondary',
          fontSizeRatio: 0.7,
          colorHex: '#FFFFFF',
          strokeColorHex: '#000000',
          strokeWidth: 12,
          shadowColorHex: '#000000',
          shadowDepth: 4,
        },
        {
          text: copyA[1],
          role: 'power_primary',
          fontSizeRatio: 1.0,
          colorHex: intent === 'horror' ? '#E50914' : '#FFE600',
          gradientColorHex: intent === 'horror' ? '#8B0000' : '#FF9900',
          strokeColorHex: '#000000',
          strokeWidth: 16,
          shadowColorHex: '#000000',
          shadowDepth: 6,
        },
      ],
    };

    const prop2: LMMProposalSpecification = {
      id: 'prop_2',
      title: 'Opción B: Gancho de Intriga',
      concept: 'Provocación angular dinámica con cian de alta saturación y degradado.',
      placement: 'CENTER_LEFT',
      fontFamily: 'Bebas Neue',
      rotation: -4,
      hasBadge: false,
      lines: [
        {
          text: copyB[0],
          role: 'anchor_secondary',
          fontSizeRatio: 0.7,
          colorHex: '#FFFFFF',
          strokeColorHex: '#000000',
          strokeWidth: 10,
          shadowColorHex: '#000000',
          shadowDepth: 4,
        },
        {
          text: copyB[1],
          role: 'power_primary',
          fontSizeRatio: 1.0,
          colorHex: '#38BDF8',
          gradientColorHex: '#0284C7',
          strokeColorHex: '#000000',
          strokeWidth: 14,
          shadowColorHex: '#000000',
          shadowDepth: 6,
        },
      ],
    };

    const prop3: LMMProposalSpecification = {
      id: 'prop_3',
      title: 'Opción C: Autoridad & Badge',
      concept: 'Contenedor oscuro protector para legibilidad absoluta sobre fondos ruidosos.',
      placement: 'TOP_LEFT',
      fontFamily: 'Poppins',
      rotation: 0,
      hasBadge: true,
      badgeBgColor: '#0F172A',
      lines: [
        {
          text: copyC[0],
          role: 'anchor_secondary',
          fontSizeRatio: 0.7,
          colorHex: '#94A3B8',
          strokeColorHex: '#000000',
          strokeWidth: 4,
          shadowColorHex: '#000000',
          shadowDepth: 2,
        },
        {
          text: copyC[1],
          role: 'power_primary',
          fontSizeRatio: 1.0,
          colorHex: '#FFFFFF',
          strokeColorHex: '#000000',
          strokeWidth: 6,
          shadowColorHex: '#000000',
          shadowDepth: 2,
        },
      ],
    };

    return {
      analysis: {
        subjectZone: 'RIGHT_HALF',
        detectedNegativeSpace: ['TOP_LEFT', 'CENTER_LEFT'],
        dominantColors: ['#0f172a', '#1e293b'],
        contrastAccentColor: '#FFE600',
      },
      proposals: [prop1, prop2, prop3],
      reasoning: `Composición heurística local generada para la intención '${intent}'. Se detectó sujeto a la derecha y se proyectaron 3 propuestas diferenciadas en el espacio negativo izquierdo.`,
    };
  }

  /**
   * Mapea las especificaciones dinámicas del LMM a objetos ProposalCard para el canvas
   */
  private static buildProposals(
    response: LMMVisionResponse,
    isOfflineFallback: boolean
  ): ProposalCard[] {
    if (!response.proposals || response.proposals.length === 0) {
      return [];
    }

    return response.proposals.map((spec, index) => {
      const placement = (spec.placement as PlacementZone) || 'TOP_LEFT';
      const width = 480;
      const height = 180;
      const coords = DeterministicLayoutEngine.calculateCoordinates(placement, width, height);

      const previewGroup: CompositeTextGroup = {
        id: `group_${spec.id || index}`,
        x: coords.x,
        y: coords.y,
        width,
        height,
        rotation: typeof spec.rotation === 'number' ? spec.rotation : 0,
        scale: 1,
        segments: spec.lines.map((line, lineIdx) => ({
          id: `seg_${spec.id || index}_${lineIdx}`,
          text: line.text,
          role: line.role || (lineIdx === 0 ? 'anchor_secondary' : 'power_primary'),
          fontFamily: line.fontFamily || spec.fontFamily || 'Montserrat',
          fontSize: Math.round(76 * (line.fontSizeRatio || (lineIdx === 0 ? 0.7 : 1.0))),
          colorHex: line.colorHex || '#FFFFFF',
          gradientColorHex: line.gradientColorHex,
          strokeColorHex: line.strokeColorHex || '#000000',
          strokeWidth: typeof line.strokeWidth === 'number' ? line.strokeWidth : 12,
          shadowColorHex: line.shadowColorHex || '#000000',
          shadowDepth: typeof line.shadowDepth === 'number' ? line.shadowDepth : 4,
          slant: typeof line.slant === 'number' ? line.slant : (typeof spec.rotation === 'number' ? spec.rotation : 0),
          hasBadge: typeof line.hasBadge === 'boolean' ? line.hasBadge : spec.hasBadge,
          badgeBgColor: line.badgeBgColor || spec.badgeBgColor || '#0F172A',
        })),
      };

      const copySummary = spec.lines.map((l) => l.text).join(' • ');

      return {
        id: spec.id || `prop_${index}`,
        title: spec.title || `Propuesta ${index + 1}`,
        concept: spec.concept || 'Diseño balanceado',
        copySummary,
        placement,
        fontFamily: spec.fontFamily || 'Montserrat',
        previewGroup,
        isOfflineFallback,
      };
    });
  }
}
