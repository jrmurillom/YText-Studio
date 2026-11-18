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
      rawPayloadSent = `[Local Session Cache]\nKey: ${cacheKey}\nBase hook: "${rawText}"\nIntent: "${intent}"`;
      rawResponseText = JSON.stringify(response, null, 2);
    } else if (config.apiKey && config.apiKey.trim().length > 0) {
      const request: LMMVisionRequest = {
        imageBase64WebP,
        rawText,
        intent,
        customIntentText,
        proposalCount: config.proposalCount || 3,
      };

      try {
        const execResult = await LMMService.analyze(request, config);
        response = execResult.response;
        rawPayloadSent = execResult.rawPayloadSent;
        rawResponseText = execResult.rawResponseText;
        this.cache.set(cacheKey, response);
      } catch (err) {
        console.warn('[VisionPipeline] Remote API error, falling back to explicit local mode:', err);
        isOfflineFallback = true;
        errorMessage = err instanceof Error ? err.message : String(err);
        response = this.runLocalHeuristic(rawText, intent, customIntentText, config.proposalCount || 3);
        rawPayloadSent = `[Remote API Failure]\nError: ${errorMessage}\nActivated contingency generator with hook: "${rawText}"`;
        rawResponseText = JSON.stringify(response, null, 2);
      }
    } else {
      isOfflineFallback = true;
      response = this.runLocalHeuristic(rawText, intent, customIntentText, config.proposalCount || 3);
      rawPayloadSent = `[Offline Mode without API Key]\nLocal heuristic executed with hook: "${rawText}"`;
      rawResponseText = JSON.stringify(response, null, 2);
    }

    const latencyMs = Math.round(performance.now() - startTime);

    const telemetry: LMMTelemetry = {
      provider: isOfflineFallback ? 'Local Heuristic Engine' : config.provider,
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
   * Generador heurístico local explícito (construye 3 a 5 propuestas dinámicas)
   */
  private static runLocalHeuristic(
    rawText: string,
    intent: IntentType,
    _customIntentText?: string,
    proposalCount = 3
  ): LMMVisionResponse {
    const cleanRaw = rawText.trim() || 'TITLE';
    const words = cleanRaw.split(/\s+/);
    const targetCount = Math.max(3, Math.min(5, proposalCount || 3));

    // Baseline segmentation
    let l1 = 'IMPACT';
    let l2 = cleanRaw.toUpperCase();
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      l1 = words.slice(0, mid).join(' ').toUpperCase();
      l2 = words.slice(mid).join(' ').toUpperCase();
    }

    // Adapt copy & style by intent
    let copyA: [string, string] = [l1, l2];
    let copyB: [string, string] = ['THE END?', 'IMPOSSIBLE!'];
    let copyC: [string, string] = ['VERDICT:', cleanRaw.toUpperCase()];
    let copyD: [string, string] = ['WARNING:', 'DO NOT MISS'];
    let copyE: [string, string] = ['THE TRUTH', cleanRaw.toUpperCase()];

    if (intent === 'horror') {
      copyA = ["DON'T LOOK", "IT'S HERE..."];
      copyB = ['WILL YOU SURVIVE?', 'THE TERROR'];
      copyC = ['REAL STORY', 'CASE FILE'];
      copyD = ['ALONE IN DARK', 'THE ENTITY'];
      copyE = ['NIGHTMARE', 'NEVER FORGET'];
    } else if (intent === 'mystery') {
      copyA = ['WHAT THEY HIDE?', 'THE TRUTH'];
      copyB = ['THE SECRET OF:', cleanRaw.toUpperCase()];
      copyC = ['CLASSIFIED', 'DOCUMENT'];
      copyD = ['UNSOLVED', 'EVIDENCE'];
      copyE = ['CONFIDENTIAL', 'CASE CLOSED'];
    } else if (intent === 'tech') {
      copyA = ['CHANGED EVERYTHING:', 'THE FUTURE'];
      copyB = ['WORTH IT?', 'NEW KING'];
      copyC = ['DEFINITIVE:', 'REVIEW'];
      copyD = ['BREAKTHROUGH', 'NEXT GEN'];
      copyE = ['THE UPGRADE', 'UNBOXED'];
    } else if (intent === 'alert') {
      copyA = ['BREAKING:', 'CRITICAL'];
      copyB = ['TOO LATE?', 'WATCH NOW'];
      copyC = ['OFFICIAL ALERT', cleanRaw.toUpperCase()];
      copyD = ['EMERGENCY', 'EXPOSED'];
      copyE = ['DANGER:', 'STAY SAFE'];
    } else if (intent === 'authority') {
      copyA = ['VERDICT:', 'THE FINAL WORD'];
      copyB = ['PROVEN:', cleanRaw.toUpperCase()];
      copyC = ['EXPERT OPINION', 'VALIDATED'];
      copyD = ['RANKED:', 'TOP TIER'];
      copyE = ['THE WINNER', 'UNDISPUTED'];
    } else if (intent === 'other') {
      copyA = [l1, l2];
      copyB = ['HOW IT HAPPENED?', l2];
      copyC = ['THE TRUTH:', l2];
      copyD = ['REVEALED:', l1];
      copyE = ['UNFILTERED:', l2];
    }

    const prop1: LMMProposalSpecification = {
      id: 'prop_1',
      title: 'Option A: Direct Impact',
      concept: 'Maximum visual punch in negative space with high-contrast accent.',
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
      title: 'Option B: Intrigue Hook',
      concept: 'Dynamic angular slant with high-saturation accent gradient.',
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
      title: 'Option C: Authority Badge',
      concept: 'Protective dark container for absolute legibility over busy backgrounds.',
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

    const prop4: LMMProposalSpecification = {
      id: 'prop_4',
      title: 'Option D: Bold Statement',
      concept: 'Ultra-tall typography with strong vertical punch and high-energy alert tone.',
      placement: 'TOP_LEFT',
      fontFamily: 'Teko',
      rotation: 2,
      hasBadge: false,
      lines: [
        {
          text: copyD[0],
          role: 'anchor_secondary',
          fontSizeRatio: 0.65,
          colorHex: '#F59E0B',
          strokeColorHex: '#000000',
          strokeWidth: 8,
          shadowColorHex: '#000000',
          shadowDepth: 3,
        },
        {
          text: copyD[1],
          role: 'power_primary',
          fontSizeRatio: 1.1,
          colorHex: '#FFFFFF',
          strokeColorHex: '#000000',
          strokeWidth: 14,
          shadowColorHex: '#000000',
          shadowDepth: 5,
        },
      ],
    };

    const prop5: LMMProposalSpecification = {
      id: 'prop_5',
      title: 'Option E: Clean Pop',
      concept: 'Modern sans with high-punch contrast and clean editorial authority.',
      placement: 'CENTER_LEFT',
      fontFamily: 'Montserrat',
      rotation: 0,
      hasBadge: false,
      lines: [
        {
          text: copyE[0],
          role: 'anchor_secondary',
          fontSizeRatio: 0.7,
          colorHex: '#E2E8F0',
          strokeColorHex: '#000000',
          strokeWidth: 8,
          shadowColorHex: '#000000',
          shadowDepth: 3,
        },
        {
          text: copyE[1],
          role: 'power_primary',
          fontSizeRatio: 1.0,
          colorHex: '#22C55E',
          gradientColorHex: '#15803D',
          strokeColorHex: '#000000',
          strokeWidth: 12,
          shadowColorHex: '#000000',
          shadowDepth: 4,
        },
      ],
    };

    const allProps = [prop1, prop2, prop3, prop4, prop5];
    const selectedProps = allProps.slice(0, targetCount);

    return {
      analysis: {
        subjectZone: 'RIGHT_HALF',
        detectedNegativeSpace: ['TOP_LEFT', 'CENTER_LEFT'],
        dominantColors: ['#0f172a', '#1e293b'],
        contrastAccentColor: '#FFE600',
      },
      proposals: selectedProps,
      reasoning: `Local heuristic composition generated for '${intent}' intent with ${targetCount} proposals. Subject detected on the right half; projected ${targetCount} differentiated proposals into the left negative space.`,
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
        title: spec.title || `Proposal ${index + 1}`,
        concept: spec.concept || 'Balanced design',
        copySummary,
        placement,
        fontFamily: spec.fontFamily || 'Montserrat',
        previewGroup,
        isOfflineFallback,
      };
    });
  }
}
