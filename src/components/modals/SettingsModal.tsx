import React, { useState } from 'react';
import { LMMConfig, LMMProviderType } from '@/types';
import { X, Key, Cpu, ShieldCheck } from 'lucide-react';

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
  const [provider, setProvider] = useState<LMMProviderType>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [customEndpoint, setCustomEndpoint] = useState(config.customEndpoint || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      provider,
      apiKey,
      model,
      customEndpoint: provider === 'ollama' ? customEndpoint : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-sm text-slate-900">Configuración de Proveedor LMM</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Proveedor de IA
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
              <option value="gemini">Google Gemini (Gemini 2.0 Flash - Recomendado)</option>
              <option value="openrouter">OpenRouter (Claude 3.5 Sonnet, GPT-4o, etc.)</option>
              <option value="openai">OpenAI Directo (GPT-4o, GPT-4o-mini)</option>
              <option value="ollama">Local / Ollama (Self-Hosted)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              API Key (Guardada localmente en tu navegador)
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Pega aquí tu API Key..."
                className="w-full text-xs p-2 pl-8 rounded-md border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Tu clave jamás pasa por servidores intermedios.</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              ID del Modelo
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {provider === 'ollama' && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Endpoint Custom
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

        {/* Footer */}
        <div className="h-12 border-t border-slate-200 px-4 flex items-center justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
