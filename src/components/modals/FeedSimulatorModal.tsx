import React, { useState } from 'react';
import { X, Smartphone, Monitor, LayoutGrid, Moon, Sun, CheckCircle } from 'lucide-react';

interface FeedSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasDataUrl: string | null;
  videoTitle: string;
}

type SimulatorTab = 'all' | 'mobile' | 'desktop' | 'sidebar';

export const FeedSimulatorModal: React.FC<FeedSimulatorModalProps> = ({
  isOpen,
  onClose,
  canvasDataUrl,
  videoTitle,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<SimulatorTab>('all');

  if (!isOpen) return null;

  const displayTitle = videoTitle.trim() || 'EL SECRETO MEJOR GUARDADO DE LA HISTORIA (REVELADO)';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-13 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
              <span className="font-bold text-xs tracking-tighter">▶</span>
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight">
                Simulador Multi-Contexto (The Reality Check)
              </span>
              <span className="text-[11px] text-slate-500 block">
                Comprueba contraste, legibilidad del TRI y competencia de feed en tiempo real
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Filter Tabs */}
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-300/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mobile')}
                className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                  activeTab === 'mobile'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Móvil (70%)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                  activeTab === 'desktop'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Desktop Home</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sidebar')}
                className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                  activeTab === 'sidebar'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Sidebar</span>
              </button>
            </div>

            {/* Dark / Light Mode Switch */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
              title="Alternar entre modo oscuro y claro de YouTube"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Simulation Canvas */}
        <div
          className={`flex-1 p-6 overflow-y-auto space-y-8 transition-colors ${
            isDarkMode ? 'bg-[#0F0F0F] text-[#F1F1F1]' : 'bg-[#FFFFFF] text-[#0F0F0F]'
          }`}
        >
          {/* 1. Mobile Feed Context (340px) */}
          {(activeTab === 'all' || activeTab === 'mobile') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-700/30 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    1. Mobile Feed (App YouTube • ~70% del Consumo Total)
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">Ancho simulado: ~360px</span>
              </div>

              <div className="flex justify-center py-2">
                <div
                  className={`w-full max-w-[370px] rounded-2xl overflow-hidden border p-3 shadow-lg ${
                    isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Thumbnail Card */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 shadow-sm">
                    {canvasDataUrl ? (
                      <img src={canvasDataUrl} alt="Thumbnail Móvil" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                        Cargando miniatura...
                      </div>
                    )}
                    <div className="absolute right-2 bottom-2 px-1.5 py-0.5 bg-black/85 text-white rounded text-[11px] font-mono font-bold tracking-tight">
                      14:25
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex gap-3 mt-3 px-0.5">
                    <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                      YT
                    </div>
                    <div className="leading-tight text-left min-w-0">
                      <span className="text-xs font-bold block line-clamp-2 leading-snug">
                        {displayTitle}
                      </span>
                      <div className={`text-[11px] flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                        <span className="font-medium truncate">Canal Oficial</span>
                        <CheckCircle className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>• 450K vistas • hace 3 horas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 2. Desktop Home Grid Context */}
          {(activeTab === 'all' || activeTab === 'desktop') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-700/30 pb-2">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    2. Desktop Home Grid (Comprobación de Contraste vs Competencia)
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">Grid de 3 columnas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-2">
                {/* Tu Portada */}
                <div className="space-y-2.5">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 shadow-md ring-2 ring-blue-500/80">
                    {canvasDataUrl ? (
                      <img src={canvasDataUrl} alt="Tu Portada" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                        Tu Portada
                      </div>
                    )}
                    <div className="absolute right-1.5 bottom-1.5 px-1.5 py-0.5 bg-black/85 text-white rounded text-[10px] font-mono font-bold">
                      14:25
                    </div>
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-blue-600 text-white rounded text-[9px] font-bold uppercase tracking-wider">
                      Tu Video
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-white text-[11px] font-bold">
                      YT
                    </div>
                    <div className="leading-tight text-left min-w-0">
                      <span className="text-xs font-bold block line-clamp-2 leading-snug">
                        {displayTitle}
                      </span>
                      <span className={`text-[11px] block mt-1 ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                        Tu Canal • 100K vistas • hace 2 horas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Video Competidor 1 (Simulado) */}
                <div className="space-y-2.5 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-neutral-500 border border-neutral-700/40">
                    <span className="text-xs font-mono font-semibold">[Video Competidor A]</span>
                    <div className="absolute right-1.5 bottom-1.5 px-1.5 py-0.5 bg-black/85 text-white rounded text-[10px] font-mono font-bold">
                      21:04
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-700 shrink-0"></div>
                    <div className="leading-tight text-left">
                      <span className="text-xs font-semibold block line-clamp-2 leading-snug text-neutral-400">
                        Cómo Crear Miniaturas con Millones de Vistas (Guía 2026)
                      </span>
                      <span className={`text-[11px] block mt-1 ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                        Creator Lab • 1.2M vistas • hace 1 mes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Video Competidor 2 (Simulado) */}
                <div className="space-y-2.5 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-neutral-500 border border-neutral-700/40">
                    <span className="text-xs font-mono font-semibold">[Video Competidor B]</span>
                    <div className="absolute right-1.5 bottom-1.5 px-1.5 py-0.5 bg-black/85 text-white rounded text-[10px] font-mono font-bold">
                      08:42
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-700 shrink-0"></div>
                    <div className="leading-tight text-left">
                      <span className="text-xs font-semibold block line-clamp-2 leading-snug text-neutral-400">
                        Los 5 Errores Fatales que Arruinan tu CTR en YouTube
                      </span>
                      <span className={`text-[11px] block mt-1 ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                        Tech Insider • 890K vistas • hace 2 semanas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 3. Sidebar / Relacionados Context (~168px) */}
          {(activeTab === 'all' || activeTab === 'sidebar') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-700/30 pb-2">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    3. Sidebar / Recomendados ("Up Next" • Escala Crítica Reducida)
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">Miniatura: ~168 × 94 px</span>
              </div>

              <div className="flex justify-start py-2">
                <div
                  className={`flex gap-3 p-2.5 rounded-xl border max-w-md ${
                    isDarkMode ? 'bg-[#181818] border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="relative w-42 aspect-video rounded-lg overflow-hidden bg-slate-800 shrink-0 shadow-xs">
                    {canvasDataUrl ? (
                      <img src={canvasDataUrl} alt="Thumbnail sidebar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">
                        Up Next
                      </div>
                    )}
                    <div className="absolute right-1 bottom-1 px-1 py-0.5 bg-black/85 text-white rounded text-[9px] font-mono font-bold">
                      14:25
                    </div>
                  </div>
                  <div className="leading-tight text-left text-xs min-w-0 flex flex-col justify-center">
                    <span className="font-bold block line-clamp-2 leading-snug">
                      {displayTitle}
                    </span>
                    <span className={`text-[11px] block mt-1.5 ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                      Canal Oficial
                    </span>
                    <span className={`text-[10px] block ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                      450K vistas • hace 3 horas
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="h-13 border-t border-slate-200 px-5 flex items-center justify-between bg-slate-50 shrink-0">
          <span className="text-xs text-slate-500">
            Simulación fiel basada en los lineamientos visuales oficiales de YouTube (Web & App).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Cerrar Simulador
          </button>
        </div>
      </div>
    </div>
  );
};
