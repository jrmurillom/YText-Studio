import React from 'react';
import { X, Smartphone, Monitor, Moon, Sun } from 'lucide-react';

interface FeedSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasDataUrl: string | null;
  videoTitle: string;
}

export const FeedSimulatorModal: React.FC<FeedSimulatorModalProps> = ({
  isOpen,
  onClose,
  canvasDataUrl,
  videoTitle,
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-sm text-slate-900">
              Simulador Multi-Contexto de YouTube (The Reality Check)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Simulation Body */}
        <div
          className={`flex-1 p-6 overflow-y-auto space-y-6 transition-colors ${
            isDarkMode ? 'bg-[#0f0f0f] text-white' : 'bg-[#f9f9f9] text-slate-900'
          }`}
        >
          {/* 1. Mobile Feed Context (320x180 px aprox) */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>1. Mobile Feed (App de YouTube • ~70% del Tráfico)</span>
            </div>

            <div className={`w-[340px] rounded-xl overflow-hidden border p-2 shadow-md ${isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-800">
                {canvasDataUrl && <img src={canvasDataUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />}
                <div className="absolute right-1.5 bottom-1.5 px-1.5 py-0.5 bg-black/90 text-white rounded text-[10px] font-mono font-bold">
                  14:25
                </div>
              </div>
              <div className="flex gap-2.5 mt-2.5 px-1">
                <div className="w-8 h-8 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  YT
                </div>
                <div className="leading-tight text-left">
                  <span className="text-xs font-bold block line-clamp-2">
                    {videoTitle || 'El Secreto Mejor Guardado de la Historia'}
                  </span>
                  <span className={`text-[10px] block mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Canal Oficial • 450K vistas • hace 3 horas
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Sidebar Up Next Context (~168x94 px) */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Monitor className="w-4 h-4" />
              <span>2. Sidebar / Recomendados ("Up Next" • Escala Crítica)</span>
            </div>

            <div className={`flex gap-2.5 p-2 rounded-lg border max-w-sm ${isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="relative w-40 aspect-video rounded overflow-hidden bg-slate-800 shrink-0">
                {canvasDataUrl && <img src={canvasDataUrl} alt="Thumbnail sidebar" className="w-full h-full object-cover" />}
                <div className="absolute right-1 bottom-1 px-1 bg-black/90 text-white rounded text-[9px] font-mono font-bold">
                  14:25
                </div>
              </div>
              <div className="leading-tight text-left text-xs">
                <span className="font-bold block line-clamp-2">
                  {videoTitle || 'El Secreto Mejor Guardado'}
                </span>
                <span className={`text-[10px] block mt-1 ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Canal Oficial
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-slate-200 px-4 flex items-center justify-end bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
          >
            Cerrar Simulador
          </button>
        </div>
      </div>
    </div>
  );
};
