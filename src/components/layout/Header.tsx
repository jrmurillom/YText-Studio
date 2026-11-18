import React from 'react';
import { Settings, Scan, Smartphone, Download, CheckCircle2, AlertCircle, Grid3x3 } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { LanguageMenu } from './LanguageMenu';
import { useTranslation } from '@/i18n';

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
  const { t, locale, setLocale } = useTranslation();

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
        <BrandLogo variant="full" size="sm" />

        {/* Status Badge Transparente */}
        <div className="border-l border-slate-200 pl-3">
          {hasApiKey ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 cursor-pointer hover:bg-emerald-100 transition-colors"
              title={t('common.apiActiveTitle', { provider: formattedProvider })}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{formattedProvider}{shortModel ? ` (${shortModel})` : ''}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-[11px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 cursor-pointer hover:bg-amber-100 transition-colors"
              title={t('common.offlineTitle')}
            >
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>{t('common.offlineMode')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Center: Canvas Viewport Tools */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={onToggleSafeZones}
          className={`px-2.5 py-1 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
            safeZonesEnabled
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          title={t('common.safeZonesTitle')}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>{t('common.safeZones')}</span>
        </button>

        <button
          type="button"
          onClick={onToggleRuleOfThirds}
          className={`px-2.5 py-1 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
            ruleOfThirdsEnabled
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          title={t('common.gridTitle')}
        >
          <Grid3x3 className="w-3.5 h-3.5" />
          <span>{t('common.grid')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenSimulator}
          className="px-2.5 py-1 text-xs font-medium rounded-md border border-transparent text-slate-600 hover:text-slate-900 hover:bg-white flex items-center gap-1.5 transition-colors cursor-pointer"
          title={t('common.feedPreviewTitle')}
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('common.feedPreview')}</span>
        </button>
      </div>

      {/* Right: [Exportar] -> [Engrane (Ajustes IA)] -> [i18n] */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          title={t('common.exportTitle')}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('common.export')}</span>
        </button>

        <div className="h-4 w-px bg-slate-200"></div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-slate-200/80 cursor-pointer"
          title={t('common.aiSettingsTitle')}
        >
          <Settings className="w-4 h-4 text-slate-600" />
        </button>

        <LanguageMenu locale={locale} onSelectLocale={setLocale} />
      </div>
    </header>
  );
};
