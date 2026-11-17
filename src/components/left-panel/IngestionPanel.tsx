import React from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles } from 'lucide-react';
import { IntentSelector } from './IntentSelector';
import { ProposalsList } from './ProposalsList';
import { IntentType, ProposalCard, BaseImageState } from '@/types';

interface IngestionPanelProps {
  baseImage: BaseImageState;
  onImageSelected: (file: File) => void;
  rawText: string;
  onRawTextChange: (text: string) => void;
  selectedIntent: IntentType;
  onSelectIntent: (intent: IntentType) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  proposals: ProposalCard[];
  selectedProposalId: string | null;
  onSelectProposal: (proposal: ProposalCard) => void;
}

export const IngestionPanel: React.FC<IngestionPanelProps> = ({
  baseImage,
  onImageSelected,
  rawText,
  onRawTextChange,
  selectedIntent,
  onSelectIntent,
  onAnalyze,
  isAnalyzing,
  proposals,
  selectedProposalId,
  onSelectProposal,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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
          Imagen Base (16:9 • Inmutable)
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
                  {baseImage.file?.name || 'Imagen cargada'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {baseImage.width}x{baseImage.height} • Bloqueada
                </span>
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-500 mb-1 transition-colors" />
              <span className="text-xs font-medium text-slate-700">Arrastra una imagen o haz clic</span>
              <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Ideal 1280x720)</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Texto Base */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Texto Base del Título
        </label>
        <input
          type="text"
          value={rawText}
          onChange={(e) => onRawTextChange(e.target.value)}
          placeholder="Ej: MEJOR DISCO DE ROCK"
          className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white font-semibold text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* 3. Selector de Intención */}
      <IntentSelector
        selectedIntent={selectedIntent}
        onSelectIntent={onSelectIntent}
      />

      {/* 4. Botón de Disparo de IA */}
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing || !baseImage.dataUrl}
        className="w-full py-2 px-3 rounded-md bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
        <span>{isAnalyzing ? 'Analizando Composición...' : 'Analizar & Proponer Portada'}</span>
      </button>

      {/* 5. Tira de Propuestas */}
      <ProposalsList
        proposals={proposals}
        selectedId={selectedProposalId}
        onSelectProposal={onSelectProposal}
        isLoading={isAnalyzing}
      />
    </div>
  );
};
