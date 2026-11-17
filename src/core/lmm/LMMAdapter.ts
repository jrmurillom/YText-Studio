import { LMMVisionRequest, LMMVisionResponse } from './types';

export interface LMMAdapter {
  id: string;
  name: string;
  analyzeImageAndText(request: LMMVisionRequest, apiKey: string, model: string, customEndpoint?: string): Promise<LMMVisionResponse>;
}
