import React from 'react';
import { IntentType } from '@/types';

interface IntentSelectorProps {
  selectedIntent: IntentType;
  onSelectIntent: (intent: IntentType) => void;
  customIntentText?: string;
  onCustomIntentTextChange?: (text: string) => void;
}

const INTENTS: Array<{ id: IntentType; label: string; icon: string }> = [
  { id: 'hype', label: 'Hype / Viral', icon: '⚡' },
  { id: 'horror', label: 'Horror / Tensión', icon: '👻' },
  { id: 'mystery', label: 'Misterio / Docu', icon: '🕵️' },
  { id: 'tech', label: 'Tech / Futuro', icon: '🔬' },
  { id: 'alert', label: 'Alerta / Peligro', icon: '🚨' },
  { id: 'authority', label: 'Autoridad / Veredicto', icon: '💼' },
  { id: 'other', label: 'Tono Personalizado...', icon: '✨' },
];

export const IntentSelector: React.FC<IntentSelectorProps> = ({
  selectedIntent,
  onSelectIntent,
  customIntentText = '',
  onCustomIntentTextChange,
}) => {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
        Intención / Atmósfera Emocional
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {INTENTS.map((item) => {
          const isSelected = selectedIntent === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectIntent(item.id)}
              className={`p-2 rounded-md border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/60 text-blue-900 shadow-xs ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              } ${item.id === 'other' ? 'col-span-2' : ''}`}
            >
              <span className="text-xs shrink-0">{item.icon}</span>
              <span className="text-[11px] font-semibold truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input de texto libre cuando se selecciona 'other' */}
      {selectedIntent === 'other' && (
        <div className="mt-2 animate-in fade-in duration-200">
          <label className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
            Describe la intención libre para la IA:
          </label>
          <input
            type="text"
            value={customIntentText}
            onChange={(e) => onCustomIntentTextChange?.(e.target.value)}
            placeholder="Ej: Sarcasmo fino, comedia absurda, nostalgia noventera..."
            className="w-full text-xs px-2.5 py-1.5 rounded-md border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/20 font-medium text-slate-800"
          />
        </div>
      )}
    </div>
  );
};
