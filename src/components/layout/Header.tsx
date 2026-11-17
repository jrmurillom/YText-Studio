import React from 'react';
import { Settings, Eye, Smartphone, Download } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleSafeZones: () => void;
  onOpenSimulator: () => void;
  onExport: () => void;
  safeZonesEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onToggleSafeZones,
  onOpenSimulator,
  onExport,
  safeZonesEnabled,
}) => {
  return (
    <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
          YT
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-slate-900">
            YText <span className="text-blue-600 font-mono text-xs font-normal px-1.5 py-0.5 bg-blue-50 rounded">Studio</span>
          </span>
        </div>
        <span className="text-xs text-slate-400 border-l border-slate-200 pl-3">
          YouTube Cover Typography Layer Studio
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Configuración de APIs (Gemini, OpenRouter, OpenAI)"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>Configurar LMM</span>
        </button>

        <button
          onClick={onToggleSafeZones}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
            safeZonesEnabled
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          title="Ver zonas de exclusión y timestamp de YouTube"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Safe Zones</span>
        </button>

        <button
          onClick={onOpenSimulator}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Simular visualización en YouTube Mobile y Desktop"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          <span>Simular Feed</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        <button
          onClick={onExport}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar 1280x720</span>
        </button>
      </div>
    </header>
  );
};
