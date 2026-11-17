import { LMMVisionRequest, LMMVisionResponse } from './types';

export interface LMMExecutionResult {
  response: LMMVisionResponse;
  rawPayloadSent: string;
  rawResponseText: string;
}

export interface LMMAdapter {
  id: string;
  name: string;
  analyzeImageAndText(
    request: LMMVisionRequest,
    apiKey: string,
    model: string,
    customEndpoint?: string
  ): Promise<LMMExecutionResult>;
}
