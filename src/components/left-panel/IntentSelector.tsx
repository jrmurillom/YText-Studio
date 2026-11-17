import React from 'react';
import { IntentType } from '@/types';

interface IntentSelectorProps {
  selectedIntent: IntentType;
  onSelectIntent: (intent: IntentType) => void;
}

const INTENTS: Array<{ id: IntentType; label: string; icon: string; desc: string }> = [
  { id: 'hype', label: 'Hype / Viral', icon: '⚡', desc: 'Amarillo 3D, superlativos y alta adrenalina' },
  { id: 'horror', label: 'Horror / Tensión', icon: '👻', desc: 'Rojo sangre, oscuridad y paranoia' },
  { id: 'mystery', label: 'Misterio / Docu', icon: '🕵️', desc: 'Blanco puro, intriga y conspiración' },
  { id: 'tech', label: 'Tech / Futuro', icon: '🔬', desc: 'Cian neón, precisión y badges limpios' },
  { id: 'alert', label: 'Alerta / Peligro', icon: '🚨', desc: 'Contraste urgente y advertencia máxima' },
  { id: 'authority', label: 'Autoridad / Finanzas', icon: '💼', desc: 'Tipografía sólida compacta y sobria' },
];

export const IntentSelector: React.FC<IntentSelectorProps> = ({
  selectedIntent,
  onSelectIntent,
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
              className={`p-2 rounded-md border text-left flex items-start gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/60 text-blue-900 shadow-xs ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
              title={item.desc}
            >
              <span className="text-xs shrink-0">{item.icon}</span>
              <div className="leading-tight">
                <span className="text-[11px] font-semibold block">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
