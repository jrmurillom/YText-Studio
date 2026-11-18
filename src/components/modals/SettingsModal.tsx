import React, { useState, useEffect } from 'react';
import { LMMConfig, LMMProviderType } from '@/types';
import { DEFAULT_LMM_SYSTEM_PROMPT } from '@/core/lmm/types';
import { X, Key, Cpu, ShieldCheck, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LMMConfig;
  onSaveConfig: (newConfig: LMMConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'connection' | 'creative_guidelines'>('connection');

  // Form states
  const [provider, setProvider] = useState<LMMProviderType>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [proposalCount, setProposalCount] = useState<number>(config.proposalCount || 3);
  const [customEndpoint, setCustomEndpoint] = useState(config.customEndpoint || '');

  useEffect(() => {
    if (isOpen) {
      setProvider(config.provider);
      setApiKey(config.apiKey);
      setModel(config.model);
      setProposalCount(config.proposalCount || 3);
      setCustomEndpoint(config.customEndpoint || '');
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      provider,
      apiKey,
      model,
      proposalCount,
      customEndpoint: provider === 'ollama' ? customEndpoint : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-sm text-slate-900">{t('settings.modalTitle')}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('connection')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'connection'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('settings.tabConnection')}
            </button>
            <button
              onClick={() => setActiveTab('creative_guidelines')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'creative_guidelines'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('settings.tabGuidelines')}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab 1: Connection & Credentials */}
        {activeTab === 'connection' && (
          <div className="p-5 space-y-4 text-xs overflow-y-auto">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t('settings.providerLabel')}
              </label>
              <select
                value={provider}
                onChange={(e) => {
                  const p = e.target.value as LMMProviderType;
                  setProvider(p);
                  if (p === 'gemini') setModel('gemini-2.0-flash');
                  else if (p === 'openrouter') setModel('anthropic/claude-3.5-sonnet');
                  else if (p === 'openai') setModel('gpt-4o');
                  else if (p === 'ollama') setModel('llama3.2-vision');
                }}
                className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="gemini">{t('settings.providerGemini')}</option>
                <option value="openrouter">{t('settings.providerOpenRouter')}</option>
                <option value="openai">{t('settings.providerOpenAI')}</option>
                <option value="ollama">{t('settings.providerOllama')}</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t('settings.apiKeyLabel')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('settings.apiKeyPlaceholder')}
                  className="w-full text-xs p-2 pl-8 rounded-md border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('settings.apiKeySecurity')}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t('settings.modelIdLabel')}
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {t('settings.proposalsLabel')}
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {t('settings.proposalsCount', { count: proposalCount })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[3, 4, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setProposalCount(count)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      proposalCount === count
                        ? 'border-blue-500 bg-blue-50/70 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{t('settings.optionsCount', { count })}</span>
                    {count === 3 && (
                      <span className="text-[9px] font-normal text-slate-400">
                        {t('settings.defaultBadge')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {t('settings.proposalsHelp')}
              </p>
            </div>

            {provider === 'ollama' && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {t('settings.customEndpointLabel')}
                </label>
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="http://localhost:11434/v1/chat/completions"
                  className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white font-mono text-slate-800"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Creative Guidelines & Packaging Prompt */}
        {activeTab === 'creative_guidelines' && (
          <div className="p-5 space-y-4 text-xs overflow-y-auto">
            {/* Header for Creators */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">{t('settings.guidelinesTitle')}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t('settings.guidelinesSubtitle')}
                </p>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                {t('settings.calibratedBadge')}
              </span>
            </div>

            {/* Strategic Criteria Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-base block">🛡️</span>
                <strong className="block text-[11px] text-slate-800 font-bold">
                  {t('settings.cardSafeZonesTitle')}
                </strong>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {t('settings.cardSafeZonesDesc')}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-base block">🎨</span>
                <strong className="block text-[11px] text-slate-800 font-bold">
                  {t('settings.cardChromaticTitle')}
                </strong>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {t('settings.cardChromaticDesc')}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-base block">⚡</span>
                <strong className="block text-[11px] text-slate-800 font-bold">
                  {t('settings.cardSubSecondTitle')}
                </strong>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {t('settings.cardSubSecondDesc')}
                </p>
              </div>
            </div>

            {/* System Prompt View */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t('settings.systemPromptLabel')}
              </label>
              <textarea
                readOnly
                value={DEFAULT_LMM_SYSTEM_PROMPT}
                rows={9}
                className="w-full text-[11px] p-2.5 font-mono rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none leading-relaxed select-all"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="h-12 border-t border-slate-200 px-5 flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            {t('settings.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
          >
            {t('settings.saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};
