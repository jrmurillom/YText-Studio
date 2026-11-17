import React, { useState } from 'react';
import { ProposalCard, LMMTelemetry } from '@/types';
import {
  Sparkles,
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
}

export const ProposalsList: React.FC<ProposalsListProps> = ({
  proposals,
  selectedId,
  onSelectProposal,
  isLoading,
  errorMessage,
  telemetry,
}) => {
  const [showNetworkLogs, setShowNetworkLogs] = useState(false);
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
          Propuestas de Composición
        </label>
        {telemetry ? (
          telemetry.isOfflineFallback ? (
            <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Modo Local • {telemetry.latencyMs}ms</span>
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
            <span>Modo Local Offline</span>
          </span>
        ) : (
          <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>IA Vision Master</span>
          </span>
        )}
      </div>

      {/* Alerta de Error de API Explícita */}
      {errorMessage && (
        <div className="p-2 rounded-md bg-red-50 border border-red-200 text-[10px] text-red-700 leading-tight flex flex-col gap-1">
          <div className="font-bold flex items-center gap-1 text-red-800">
            <AlertCircle className="w-3 h-3" />
            <span>Fallo de Conexión LMM:</span>
          </div>
          <p className="font-mono text-[9px] break-all bg-red-100/60 p-1 rounded">{errorMessage}</p>
          <span className="text-[9px] text-red-600 italic">
            Se activó el simulador heurístico local como contingencia.
          </span>
        </div>
      )}

      {/* Tarjeta de Diagnóstico y Razonamiento de la IA */}
      {telemetry && (
        <div className="p-2.5 rounded-lg bg-slate-900 text-slate-100 text-xs border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Cpu className="w-3 h-3" />
              <span>Diagnóstico del Director IA</span>
            </div>
            <span>{telemetry.timestamp}</span>
          </div>

          {telemetry.reasoning && (
            <p className="text-[11px] text-slate-200 leading-relaxed italic bg-slate-800/60 p-2 rounded border border-slate-700/50">
              "{telemetry.reasoning}"
            </p>
          )}

          {/* Metadata semántica detectada */}
          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="bg-slate-800 p-1.5 rounded flex items-center justify-between">
              <span className="text-slate-400">Sujeto:</span>
              <span className="font-bold text-white font-mono">{telemetry.subjectZone || 'N/D'}</span>
            </div>
            <div className="bg-slate-800 p-1.5 rounded flex items-center justify-between">
              <span className="text-slate-400">Espacio Libre:</span>
              <span className="font-bold text-emerald-400 font-mono">{telemetry.recommendedPlacement || 'TOP_LEFT'}</span>
            </div>
          </div>

          {/* Consola de Red LMM (Envío & Respuesta) */}
          {(telemetry.rawPayloadSent || telemetry.rawResponseText) && (
            <div className="border-t border-slate-800 pt-1.5 mt-0.5">
              <button
                type="button"
                onClick={() => setShowNetworkLogs(!showNetworkLogs)}
                className="w-full text-[10px] text-slate-300 hover:text-white py-1 px-2 rounded bg-slate-800/80 hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-blue-400" />
                  <span className="font-semibold">Consola de Red LMM (Envío & Respuesta)</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-slate-400">
                  <span>{showNetworkLogs ? 'Ocultar' : 'Ver Logs'}</span>
                  {showNetworkLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </button>

              {showNetworkLogs && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {/* Selector de pestañas: Enviar vs Recibir */}
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
                        <span>📤 Envío (Request)</span>
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
                        <span>📥 Respuesta (LMM JSON)</span>
                      </button>
                    </div>

                    {/* Botón copiar contenido activo */}
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          (activeLogTab === 'sent' ? telemetry.rawPayloadSent : telemetry.rawResponseText) || '',
                          activeLogTab
                        )
                      }
                      className="text-[9px] text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copiar contenido al portapapeles"
                    >
                      {copiedTab === activeLogTab ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Vista de contenido */}
                  {activeLogTab === 'sent' ? (
                    <div className="flex flex-col gap-1">
                      <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between">
                        <span>Payload estructurado enviado al proveedor:</span>
                      </div>
                      <pre className="p-2 bg-black/75 rounded border border-slate-700/80 text-[9px] text-blue-300 font-mono overflow-x-auto max-h-56 leading-tight select-all whitespace-pre-wrap break-all">
                        {telemetry.rawPayloadSent || 'No hay registro del payload enviado.'}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between">
                        <span>JSON Raw entregado por el modelo LMM:</span>
                      </div>
                      <pre className="p-2 bg-black/75 rounded border border-slate-700/80 text-[9px] text-emerald-400 font-mono overflow-x-auto max-h-56 leading-tight select-all whitespace-pre-wrap break-all">
                        {telemetry.rawResponseText || 'No hay registro de la respuesta recibida.'}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lista de Tarjetas de Propuesta */}
      {isLoading ? (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 animate-spin">
            <Loader2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Diseñando 3 Propuestas con IA...</span>
            <span className="text-[10px] text-slate-500">
              Analizando rostros, espacio negativo y paleta cromática en 1280x720
            </span>
          </div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-slate-400 text-xs">
          Haz clic en "Analizar & Diseñar Portada" para que la IA proponga 3 composiciones a medida.
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
    </div>
  );
};
