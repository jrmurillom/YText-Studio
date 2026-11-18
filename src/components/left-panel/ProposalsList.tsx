import React, { useState } from 'react';
import { ProposalCard, LMMTelemetry } from '@/types';
import {
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Terminal,
  Cpu,
  Loader2,
  Compass,
  Copy,
  Send,
  Inbox,
} from 'lucide-react';

interface ProposalsListProps {
  proposals: ProposalCard[];
  selectedId: string | null;
  onSelectProposal: (proposal: ProposalCard) => void;
  isLoading: boolean;
  errorMessage?: string;
  telemetry?: LMMTelemetry | null;
  proposalCount?: number;
}

export const ProposalsList: React.FC<ProposalsListProps> = ({
  proposals,
  selectedId,
  onSelectProposal,
  isLoading,
  errorMessage,
  telemetry,
  proposalCount = 3,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [activeLogTab, setActiveLogTab] = useState<'sent' | 'received'>('received');
  const [copiedTab, setCopiedTab] = useState<'sent' | 'received' | null>(null);

  const handleCopy = (text: string, tab: 'sent' | 'received') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const isAnyOffline = proposals.some((p) => p.isOfflineFallback);

  return (
    <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
      {/* Header con Badge de Estado y Latencia */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Composition Proposals
        </label>
        {telemetry ? (
          telemetry.isOfflineFallback ? (
            <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Local Mode • {telemetry.latencyMs}ms</span>
            </span>
          ) : (
            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{telemetry.model} • {telemetry.latencyMs}ms</span>
            </span>
          )
        ) : isAnyOffline ? (
          <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>Local Offline Mode</span>
          </span>
        ) : null}
      </div>

      {/* Alerta de Error de API Explícita */}
      {errorMessage && (
        <div className="p-2 rounded-md bg-red-50 border border-red-200 text-[10px] text-red-700 leading-tight flex flex-col gap-1">
          <div className="font-bold flex items-center gap-1 text-red-800">
            <AlertCircle className="w-3 h-3" />
            <span>LMM Connection Error:</span>
          </div>
          <p className="font-mono text-[9px] break-all bg-red-100/60 p-1 rounded">{errorMessage}</p>
          <span className="text-[9px] text-red-600 italic">
            Fallback local heuristic simulator activated as contingency.
          </span>
        </div>
      )}

      {/* Lista de Tarjetas de Propuesta (Directas y limpias) */}
      {isLoading ? (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 animate-spin">
            <Loader2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Designing {proposalCount} AI Proposals...</span>
            <span className="text-[10px] text-slate-500">
              Analyzing faces, negative space, and chromatic contrast in 1280x720
            </span>
          </div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-slate-400 text-xs">
          Click "Generate Proposals" to let the AI design {proposalCount} custom compositions.
        </div>
      ) : (
        <div className="space-y-2">
          {proposals.map((prop) => {
            const isSelected = selectedId === prop.id;
            return (
              <div
                key={prop.id}
                onClick={() => onSelectProposal(prop)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{prop.title}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                      {prop.fontFamily}
                    </span>
                    {prop.isOfflineFallback && (
                      <span className="text-[8px] bg-amber-100 text-amber-700 px-1 py-0.2 rounded font-mono font-bold">
                        Local
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Copy sugerido */}
                <div className="bg-slate-900/5 px-2 py-1 rounded border border-slate-900/5">
                  <span className="text-[11px] font-black tracking-tight text-slate-900 block truncate">
                    {prop.copySummary}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span className="font-mono flex items-center gap-1 text-blue-600 font-semibold">
                    <Compass className="w-2.5 h-2.5" />
                    <span>{prop.placement}</span>
                  </span>
                  {prop.concept && (
                    <span className="italic text-slate-400 truncate max-w-[180px]">
                      {prop.concept}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Discrete Collapsible: Technical Telemetry & Payloads */}
      {telemetry && (
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 overflow-hidden text-xs mt-1">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-2.5 py-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-slate-400" />
              <span>AI Reasoning & Debug</span>
              <span className="text-[9px] font-mono text-slate-400 font-normal">
                ({telemetry.latencyMs}ms)
              </span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-400">
              <span>{showTechnicalDetails ? 'Hide' : 'View'}</span>
              {showTechnicalDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
          </button>

          {showTechnicalDetails && (
            <div className="p-2.5 border-t border-slate-200 bg-slate-900 text-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <Terminal className="w-3 h-3" />
                  <span>AI Decision Log</span>
                </div>
                <span>{telemetry.timestamp}</span>
              </div>

              {telemetry.reasoning && (
                <p className="text-[11px] text-slate-200 leading-relaxed italic bg-slate-800/60 p-2 rounded border border-slate-700/50">
                  "{telemetry.reasoning}"
                </p>
              )}

              {/* Detected semantic metadata */}
              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <div className="bg-slate-800 p-1.5 rounded flex items-center justify-between">
                  <span className="text-slate-400">Subject:</span>
                  <span className="font-bold text-white font-mono">{telemetry.subjectZone || 'N/A'}</span>
                </div>
                <div className="bg-slate-800 p-1.5 rounded flex items-center justify-between">
                  <span className="text-slate-400">Free Area:</span>
                  <span className="font-bold text-emerald-400 font-mono">{telemetry.recommendedPlacement || 'TOP_LEFT'}</span>
                </div>
              </div>

              {/* LMM Network Console (Sent & Received) */}
              {(telemetry.rawPayloadSent || telemetry.rawResponseText) && (
                <div className="border-t border-slate-800 pt-1.5 mt-0.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveLogTab('sent')}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          activeLogTab === 'sent'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>📤 Request</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLogTab('received')}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          activeLogTab === 'received'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Inbox className="w-2.5 h-2.5" />
                        <span>📥 Response</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          (activeLogTab === 'sent' ? telemetry.rawPayloadSent : telemetry.rawResponseText) || '',
                          activeLogTab
                        )
                      }
                      className="text-[9px] text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copy content to clipboard"
                    >
                      {copiedTab === activeLogTab ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {activeLogTab === 'sent' ? (
                    <div className="flex flex-col gap-1 mt-1.5">
                      <pre className="p-2 bg-black/75 rounded border border-slate-700/80 text-[9px] text-blue-300 font-mono overflow-x-auto max-h-48 leading-tight select-all whitespace-pre-wrap break-all">
                        {telemetry.rawPayloadSent || 'No record of sent payload.'}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 mt-1.5">
                      <pre className="p-2 bg-black/75 rounded border border-slate-700/80 text-[9px] text-emerald-400 font-mono overflow-x-auto max-h-48 leading-tight select-all whitespace-pre-wrap break-all">
                        {telemetry.rawResponseText || 'No record of response received.'}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
