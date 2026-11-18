import React, { useState, useEffect } from 'react';
import { LMMConfig, LMMProviderType } from '@/types';
import { DEFAULT_LMM_SYSTEM_PROMPT } from '@/core/lmm/types';
import { X, Key, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

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
            <span className="font-bold text-sm text-slate-900">AI Studio & Intelligence Settings</span>
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
              Connection & API
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
              <span>Creative AI Guidelines</span>
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
                Multimodal AI Provider
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
                <option value="gemini">Google Gemini (Gemini 2.0 Flash • Ultra-fast & recommended)</option>
                <option value="openrouter">OpenRouter (Claude 3.5 Sonnet, GPT-4o, Qwen 2.5-VL)</option>
                <option value="openai">Direct OpenAI (GPT-4o, GPT-4o-mini)</option>
                <option value="ollama">Local / Ollama (Self-Hosted on your machine)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                API Key (Stored locally in your browser)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your key (e.g. AIzaSy... or sk-or-...)"
                  className="w-full text-xs p-2 pl-8 rounded-md border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Your key never leaves your browser; it communicates directly and securely with the official provider endpoint.</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Vision Model ID
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
                  Thumbnail Proposals Generated
                </label>
                <span className="text-[10px] text-slate-400 font-medium">{proposalCount} proposals</span>
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
                    <span>{count} Options</span>
                    {count === 3 && <span className="text-[9px] font-normal text-slate-400">(Default)</span>}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Configure between 3 (faster response) and 5 (maximum creative diversity) thumbnail proposals per run.
              </p>
            </div>

            {provider === 'ollama' && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Custom Endpoint
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
                <h4 className="font-bold text-slate-800 text-xs">Art Direction & Packaging Guidelines</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Composition rules, click psychology, and safe zones applied by AI to your thumbnails.
                </p>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                Calibrated for YouTube
              </span>
            </div>

            {/* Strategic Criteria Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-base block">🛡️</span>
                <strong className="block text-[11px] text-slate-800 font-bold">Safe Zones Protected</strong>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Protects the subject's face and avoids the bottom-right corner (YouTube duration badge).
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-base block">🎨</span>
                <strong className="block text-[11px] text-slate-800 font-bold">Chromatic Diversity</strong>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Each proposal explores a distinct palette: warm pop, cinematic neon, or high-contrast badge.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-base block">⚡</span>
                <strong className="block text-[11px] text-slate-800 font-bold">Sub-Second Hook</strong>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Punchy 1 to 3 word copy designed to capture attention in mobile feeds in under 0.3 seconds.
                </p>
              </div>
            </div>

            {/* System Prompt View */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                AI Packaging System Prompt
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
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
