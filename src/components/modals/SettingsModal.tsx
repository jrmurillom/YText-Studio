import React, { useState, useEffect } from 'react';
import { LMMConfig, LMMProviderType } from '@/types';
import { DEFAULT_LMM_SYSTEM_PROMPT } from '@/core/lmm/types';
import { X, Key, ShieldCheck, Sparkles, Info, ExternalLink, Mail, Copy, Check } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { BrandLogo } from '../common/BrandLogo';
import { APP_VERSION } from '@/config/version';

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
  const [activeTab, setActiveTab] = useState<'connection' | 'creative_guidelines' | 'about'>('connection');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('jrmurillom@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

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
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('settings.tabAbout')}</span>
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

        {/* Tab 3: About YText Studio */}
        {activeTab === 'about' && (
          <div className="p-5 space-y-4 text-xs overflow-y-auto">
            {/* Hero Brand Block */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <BrandLogo variant="full" size="md" />
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full shadow-xs">
                  v{APP_VERSION}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t('settings.aboutDesc')}
              </p>

              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                  ⚖️ {t('settings.aboutLicense')}
                </span>
              </div>
            </div>

            {/* Author Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Roberto Murillo</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t('settings.authorRole')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* GitHub Link */}
                <a
                  href="https://github.com/jrmurillom"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-800 block">GitHub</span>
                      <span className="text-[10px] text-slate-500 font-mono">github.com/jrmurillom</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                {/* Email with copy */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-[11px] font-semibold text-slate-800 block">{t('settings.emailLabel')}</span>
                      <span className="text-[10px] text-slate-500 font-mono">jrmurillom@gmail.com</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                      copiedEmail
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? t('settings.copiedBtn') : t('settings.copyBtn')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Issues Link */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-[11px]">
              <span className="text-slate-600">{t('settings.issuesPrompt')}</span>
              <a
                href="https://github.com/jrmurillom/YText-Studio/issues"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>{t('settings.issuesLink')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="h-12 border-t border-slate-200 px-5 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">YText Studio v{APP_VERSION}</span>
            <span className="text-slate-300">•</span>
            <span className="font-sans text-slate-500">Roberto Murillo</span>
          </div>

          <div className="flex items-center gap-2">
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
    </div>
  );
};
