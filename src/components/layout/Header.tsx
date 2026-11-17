import React from 'react';
import { Settings, Eye, Smartphone, Download, CheckCircle2, AlertCircle, Grid3x3 } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleSafeZones: () => void;
  onToggleRuleOfThirds: () => void;
  onOpenSimulator: () => void;
  onExport: () => void;
  safeZonesEnabled: boolean;
  ruleOfThirdsEnabled: boolean;
  lmmProviderName: string;
  lmmModelName?: string;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onToggleSafeZones,
  onToggleRuleOfThirds,
  onOpenSimulator,
  onExport,
  safeZonesEnabled,
  ruleOfThirdsEnabled,
  lmmProviderName,
  lmmModelName,
  hasApiKey,
}) => {
  const formattedProvider =
    lmmProviderName === 'gemini'
      ? 'Gemini'
      : lmmProviderName === 'openrouter'
      ? 'OpenRouter'
      : lmmProviderName === 'openai'
      ? 'OpenAI'
      : lmmProviderName;

  const shortModel = lmmModelName ? lmmModelName.replace(/^google\/|^anthropic\/|^openai\//, '') : '';

  return (
    <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none">
      {/* Brand & LMM Status */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
          YT
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-slate-900">
            YText <span className="text-blue-600 font-mono text-xs font-normal px-1.5 py-0.5 bg-blue-50 rounded">Studio</span>
          </span>
        </div>

        {/* Status Badge Transparente */}
        <div className="border-l border-slate-200 pl-3">
          {hasApiKey ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 cursor-pointer hover:bg-emerald-100 transition-colors"
              title={`API Key activa para ${formattedProvider}. Haz clic para cambiar modelo o prompt.`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{formattedProvider}{shortModel ? ` (${shortModel})` : ''}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-[11px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 cursor-pointer hover:bg-amber-100 transition-colors"
              title="Sin API Key configurada. Se usará el motor heurístico local offline. Haz clic para conectar una API."
            >
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Modo Local (Offline)</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Configuración de APIs, Prompt del Sistema y Contratos"
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
          title="Zonas críticas de YouTube: muestra el badge de duración (14:25) que tapa la esquina inferior derecha"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>YT Safe Zones</span>
        </button>

        <button
          onClick={onToggleRuleOfThirds}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
            ruleOfThirdsEnabled
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          title="Regla de los Tercios (Guías 3x3 para composición cinematográfica)"
        >
          <Grid3x3 className="w-3.5 h-3.5" />
          <span>Guías 3x3</span>
        </button>

        <button
          onClick={onOpenSimulator}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Vista previa real de la miniatura en YouTube (Móvil, Desktop y Sidebar)"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          <span>Feed Preview</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        <button
          onClick={onExport}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Exportar en 1280x720 (HD) o 1920x1080 (Full HD) en PNG/JPEG Lossless"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Portada</span>
        </button>
      </div>
    </header>
  );
};
