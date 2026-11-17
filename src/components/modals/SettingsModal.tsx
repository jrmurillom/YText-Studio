import React, { useState } from 'react';
import { LMMConfig, LMMProviderType } from '@/types';
import { DEFAULT_LMM_SYSTEM_PROMPT } from '@/core/lmm/types';
import { X, Key, Cpu, ShieldCheck, Code2, RotateCcw, FileJson } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'connection' | 'prompt_contracts'>('connection');

  // Form states
  const [provider, setProvider] = useState<LMMProviderType>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [customEndpoint, setCustomEndpoint] = useState(config.customEndpoint || '');
  const [customPrompt, setCustomPrompt] = useState(config.customPrompt || DEFAULT_LMM_SYSTEM_PROMPT);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      provider,
      apiKey,
      model,
      customEndpoint: provider === 'ollama' ? customEndpoint : undefined,
      customPrompt: customPrompt.trim() !== DEFAULT_LMM_SYSTEM_PROMPT.trim() ? customPrompt : undefined,
    });
    onClose();
  };

  const handleResetPrompt = () => {
    setCustomPrompt(DEFAULT_LMM_SYSTEM_PROMPT);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-sm text-slate-900">Configuración de Inteligencia & LMMs</span>
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
              Conexión & API
            </button>
            <button
              onClick={() => setActiveTab('prompt_contracts')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'prompt_contracts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Prompt & Contratos</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab 1: Conexión & Credenciales */}
        {activeTab === 'connection' && (
          <div className="p-5 space-y-4 text-xs overflow-y-auto">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Proveedor de IA Multimodal
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
                <option value="gemini">Google Gemini (Gemini 2.0 Flash • Ultra-rápido y recomendado)</option>
                <option value="openrouter">OpenRouter (Claude 3.5 Sonnet, GPT-4o, Qwen 2.5-VL)</option>
                <option value="openai">OpenAI Directo (GPT-4o, GPT-4o-mini)</option>
                <option value="ollama">Local / Ollama (Self-Hosted en tu máquina)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                API Key (Persistida exclusivamente en tu navegador)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Pega tu clave (ej. AIzaSy... o sk-or-...)"
                  className="w-full text-xs p-2 pl-8 rounded-md border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Tu clave jamás viaja a servidores de terceros; se comunica directamente con la API oficial del proveedor.</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                ID del Modelo de Visión
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
        )}

        {/* Tab 2: Prompt del Sistema & Contratos JSON */}
        {activeTab === 'prompt_contracts' && (
          <div className="p-5 space-y-4 text-xs overflow-y-auto">
            {/* Editor de Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Prompt del Sistema Inyectado al LMM (Customizable)
                </label>
                <button
                  onClick={handleResetPrompt}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar Default</span>
                </button>
              </div>

              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={9}
                className="w-full text-[11px] p-2.5 font-mono rounded-md border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Variables obligatorias interpoladas en runtime: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">&#123;RAW_TEXT&#125;</code> e <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">&#123;INTENT&#125;</code>.
              </span>
            </div>

            {/* Contratos de Entrada y Salida */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                <FileJson className="w-4 h-4 text-blue-600" />
                <span>Contratos de Datos JSON (SSOT STANDARDS.md)</span>
              </div>

              <details className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-[10px]">
                <summary className="font-semibold text-slate-700 cursor-pointer select-none">
                  Contrato de Entrada: <code className="font-mono text-blue-600">LMMVisionRequest</code>
                </summary>
                <pre className="mt-1.5 p-2 bg-white rounded border border-slate-200 font-mono text-[9px] text-slate-800 overflow-x-auto">
{`{
  "imageBase64WebP": "string (<50KB base64)",
  "rawText": "string",
  "intent": "hype | horror | mystery | tech | alert | authority | other",
  "customIntentText": "string (opcional)",
  "customPrompt": "string (opcional)"
}`}
                </pre>
              </details>

              <details className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-[10px]">
                <summary className="font-semibold text-slate-700 cursor-pointer select-none">
                  Contrato de Salida Autónomo: <code className="font-mono text-blue-600">LMMVisionResponse</code>
                </summary>
                <pre className="mt-1.5 p-2 bg-white rounded border border-slate-200 font-mono text-[9px] text-slate-800 overflow-x-auto">
{`{
  "analysis": {
    "subjectZone": "LEFT_HALF | RIGHT_HALF | CENTER | FULL_BOTTOM",
    "detectedNegativeSpace": ["TOP_LEFT", "CENTER_LEFT", ...],
    "dominantColors": ["#hex", "#hex"],
    "contrastAccentColor": "#hex"
  },
  "proposals": [
    {
      "id": "prop_1",
      "title": "Opción A: Impacto Directo",
      "concept": "Explicación visual del contraste y marketing",
      "placement": "TOP_LEFT | CENTER_LEFT | BOTTOM_LEFT | ...",
      "fontFamily": "Montserrat | Anton | Bebas Neue | Cinzel | Inter | Rubik",
      "rotation": -3,
      "hasBadge": false,
      "lines": [
        {
          "text": "HOOK CORTO",
          "role": "anchor_secondary",
          "fontSizeRatio": 0.7,
          "colorHex": "#FFFFFF",
          "strokeColorHex": "#000000",
          "strokeWidth": 12,
          "shadowColorHex": "#000000",
          "shadowDepth": 4
        },
        {
          "text": "PALABRA IMPACTO",
          "role": "power_primary",
          "fontSizeRatio": 1.0,
          "colorHex": "#HEX_CONTRASTE",
          "strokeColorHex": "#000000",
          "strokeWidth": 16,
          "shadowColorHex": "#000000",
          "shadowDepth": 6
        }
      ]
    }
  ],
  "reasoning": "Razón de composición global"
}`}
                </pre>
              </details>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="h-12 border-t border-slate-200 px-5 flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
