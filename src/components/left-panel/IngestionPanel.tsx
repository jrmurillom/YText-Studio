import React, { useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, KeyRound, Loader2 } from 'lucide-react';
import { IntentSelector } from './IntentSelector';
import { ProposalsList } from './ProposalsList';
import { IntentType, ProposalCard, BaseImageState, LMMTelemetry } from '@/types';

interface IngestionPanelProps {
  baseImage: BaseImageState;
  onImageSelected: (file: File) => void;
  rawText: string;
  onRawTextChange: (text: string) => void;
  selectedIntent: IntentType;
  onSelectIntent: (intent: IntentType) => void;
  customIntentText: string;
  onCustomIntentTextChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  proposals: ProposalCard[];
  selectedProposalId: string | null;
  onSelectProposal: (proposal: ProposalCard) => void;
  hasApiKey: boolean;
  onOpenSettings: () => void;
  errorMessage?: string;
  telemetry?: LMMTelemetry | null;
}

export const IngestionPanel: React.FC<IngestionPanelProps> = ({
  baseImage,
  onImageSelected,
  rawText,
  onRawTextChange,
  selectedIntent,
  onSelectIntent,
  customIntentText,
  onCustomIntentTextChange,
  onAnalyze,
  isAnalyzing,
  proposals,
  selectedProposalId,
  onSelectProposal,
  hasApiKey,
  onOpenSettings,
  errorMessage,
  telemetry,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnalyzing) {
      setElapsedSeconds(0);
      const start = Date.now();
      timer = setInterval(() => {
        setElapsedSeconds(Math.round(((Date.now() - start) / 1000) * 10) / 10);
      }, 100);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-3.5 flex flex-col gap-3.5">
      {/* 1. Imagen Base */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Base Image (16:9 • Immutable)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) onImageSelected(e.target.files[0]);
          }}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="h-24 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 cursor-pointer transition-all flex flex-col items-center justify-center p-2 text-center group"
        >
          {baseImage.dataUrl ? (
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <div className="text-left leading-tight">
                <span className="text-xs font-semibold text-slate-800 block truncate max-w-[170px]">
                  {baseImage.file?.name || 'Uploaded image'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {baseImage.width}x{baseImage.height} • Locked
                </span>
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-500 mb-1 transition-colors" />
              <span className="text-xs font-medium text-slate-700">Drop an image or click to browse</span>
              <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Ideal: 1280x720)</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Texto Base */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Video Title / Topic Hook
        </label>
        <input
          type="text"
          value={rawText}
          onChange={(e) => onRawTextChange(e.target.value)}
          placeholder="Enter your video hook or topic..."
          className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white font-semibold text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* 3. Selector de Intención (con soporte 'other') */}
      <IntentSelector
        selectedIntent={selectedIntent}
        onSelectIntent={onSelectIntent}
        customIntentText={customIntentText}
        onCustomIntentTextChange={onCustomIntentTextChange}
      />

      {/* 4. Botón de Disparo de IA con Gatekeeping de API Key */}
      {!hasApiKey ? (
        <button
          onClick={onOpenSettings}
          className="w-full py-2 px-3 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Configure API Key to Analyze</span>
        </button>
      ) : (
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !baseImage.dataUrl}
          className="w-full py-2 px-3 rounded-md bg-slate-900 hover:bg-slate-800 disabled:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>Analyzing with AI ({elapsedSeconds.toFixed(1)}s)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Analyze & Generate Proposals (AI)</span>
            </>
          )}
        </button>
      )}

      {/* 5. Tira de Propuestas */}
      <ProposalsList
        proposals={proposals}
        selectedId={selectedProposalId}
        onSelectProposal={onSelectProposal}
        isLoading={isAnalyzing}
        errorMessage={errorMessage}
        telemetry={telemetry}
      />
    </div>
  );
};
