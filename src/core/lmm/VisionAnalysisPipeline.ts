import { LMMService } from './LMMService';
import {
  LMMVisionRequest,
  LMMVisionResponse,
  LMMTelemetry,
  LMMProposalLine,
} from './types';
import { LMMConfig, IntentType, ProposalCard, CompositeTextGroup, TextSegment } from '@/types';
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
    const cacheKey = `${config.provider}_${config.model}_${config.proposalCount || 3}_${intent}_${customIntentText || ''}_${rawText.trim()}_${imageBase64WebP.length}_${sample}`;

    let response: LMMVisionResponse;
    let errorMessage: string | undefined;
    let rawPayloadSent: string | undefined;
    let rawResponseText: string | undefined;

    const hasCredentials =
      config.provider === 'ollama' || Boolean(config.apiKey && config.apiKey.trim().length > 0);

    if (!hasCredentials) {
      throw new Error('API Key required: Please configure your API Key in settings to generate proposals.');
    }

    if (!bypassCache && this.cache.has(cacheKey)) {
      console.log(
        '%c[VisionPipeline] ⚡ Respuesta servida desde Session Cache local (0 tokens consumidos)',
        'color: #8b5cf6; font-weight: bold;'
      );
      response = this.cache.get(cacheKey)!;
      rawPayloadSent = `[Local Session Cache]\nKey: ${cacheKey}\nBase hook: "${rawText}"\nIntent: "${intent}"`;
      rawResponseText = JSON.stringify(response, null, 2);
    } else {
      const request: LMMVisionRequest = {
        imageBase64WebP,
        rawText,
        intent,
        customIntentText,
        proposalCount: config.proposalCount || 3,
      };

      try {
        const execResult = await LMMService.analyze(request, config);
        const candidate = execResult.response;
        const isValidStructure =
          Array.isArray(candidate?.proposals) &&
          candidate.proposals.length > 0 &&
          candidate.proposals.every((p) => Array.isArray(p?.lines) && p.lines.length > 0);

        if (!isValidStructure) {
          throw new Error('Model returned an incomplete or invalid data structure.');
        }

        response = candidate;
        rawPayloadSent = execResult.rawPayloadSent;
        rawResponseText = execResult.rawResponseText;
        this.cache.set(cacheKey, response);
      } catch (err) {
        console.error('[VisionPipeline] Remote API error:', err);
        throw err;
      }
    }

    const latencyMs = Math.round(performance.now() - startTime);

    const telemetry: LMMTelemetry = {
      provider: config.provider,
      model: config.model,
      latencyMs,
      timestamp: new Date().toLocaleTimeString(),
      isOfflineFallback: false,
      subjectZone: response.analysis?.subjectZone,
      recommendedPlacement: response.proposals?.[0]?.placement || 'TOP_LEFT',
      contrastAccentColor: response.analysis?.contrastAccentColor,
      reasoning: response.reasoning,
      rawPayloadSent,
      rawResponseText,
    };

    const proposals = this.buildProposals(response, false);
    return { proposals, isOfflineFallback: false, errorMessage, telemetry };
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
      const rawLines: LMMProposalLine[] =
        Array.isArray(spec.lines) && spec.lines.length > 0
          ? spec.lines
          : [
              {
                text: 'IMPACT',
                role: 'power_primary',
                fontSizeRatio: 1.0,
                colorHex: '#FFFFFF',
                strokeColorHex: '#000000',
                strokeWidth: 12,
                shadowColorHex: '#000000',
                shadowDepth: 4,
              },
            ];

      const segments: TextSegment[] = rawLines.map((line, lineIdx) => ({
        id: `seg_${spec.id || index}_${lineIdx}`,
        text: String(line?.text ?? 'HOOK'),
        role: line?.role || (lineIdx === 0 ? 'anchor_secondary' : 'power_primary'),
        fontFamily: line?.fontFamily || spec.fontFamily || 'Montserrat',
        fontSize: Math.round(76 * (line?.fontSizeRatio || (lineIdx === 0 ? 0.7 : 1.0))),
        colorHex: line?.colorHex || '#FFFFFF',
        gradientColorHex: line?.gradientColorHex,
        strokeColorHex: line?.strokeColorHex || '#000000',
        strokeWidth: typeof line?.strokeWidth === 'number' ? line.strokeWidth : 12,
        shadowColorHex: line?.shadowColorHex || '#000000',
        shadowDepth: typeof line?.shadowDepth === 'number' ? line.shadowDepth : 4,
        slant: typeof line?.slant === 'number' ? line.slant : 0,
        hasBadge: typeof line?.hasBadge === 'boolean' ? line.hasBadge : spec.hasBadge,
        badgeBgColor: line?.badgeBgColor || spec.badgeBgColor || '#0F172A',
      }));

      const { width, height } = DeterministicLayoutEngine.measureGroupDimensions(segments);
      const coords = DeterministicLayoutEngine.calculateCoordinates(placement, width, height);

      const previewGroup: CompositeTextGroup = {
        id: `group_${spec.id || index}`,
        x: coords.x,
        y: coords.y,
        width,
        height,
        rotation: typeof spec.rotation === 'number' ? spec.rotation : 0,
        scale: 1,
        placement,
        segments,
      };

      const copySummary = segments.map((l) => l.text).join(' • ');

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
