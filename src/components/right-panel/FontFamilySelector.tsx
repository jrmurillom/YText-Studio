import React from 'react';

interface FontFamilySelectorProps {
  currentFont: string;
  onSelectFont: (fontFamily: string) => void;
}

export const AVAILABLE_FONTS = [
  { id: 'Montserrat', name: 'Montserrat', desc: 'Sans Masiva / Punch' },
  { id: 'Anton', name: 'Anton', desc: 'Condensada / Impacto' },
  { id: 'Bebas Neue', name: 'Bebas Neue', desc: 'YouTube Clásica' },
  { id: 'Teko', name: 'Teko', desc: 'Ultra-Alta / Gaming' },
  { id: 'Permanent Marker', name: 'Permanent Marker', desc: 'Rotulador / Urgente' },
  { id: 'Poppins', name: 'Poppins', desc: 'Geométrica / Limpia' },
  { id: 'Cinzel', name: 'Cinzel', desc: 'Serif Cinemática / Drama' },
  { id: 'Playfair Display', name: 'Playfair Display', desc: 'Editorial / True Crime' },
  { id: 'Inter', name: 'Inter', desc: 'Clean / Autoridad Tech' },
  { id: 'Rubik', name: 'Rubik', desc: 'Moderna / Pop Curvo' },
  { id: 'Luckiest Guy', name: 'Luckiest Guy', desc: 'Cómic / Caricatura' },
  { id: 'Bangers', name: 'Bangers', desc: 'Viral / Alta Adrenalina' },
];

export const FontFamilySelector: React.FC<FontFamilySelectorProps> = ({
  currentFont,
  onSelectFont,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Familia Tipográfica
        </label>
        <span className="text-[9px] text-blue-600 font-mono font-bold">
          {currentFont || 'Montserrat'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {AVAILABLE_FONTS.map((f) => {
          const isSelected = currentFont?.toLowerCase() === f.id.toLowerCase();
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFont(f.id)}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span
                className="text-xs font-bold text-slate-800 block truncate"
                style={{ fontFamily: f.id }}
              >
                {f.name}
              </span>
              <span className="text-[9px] text-slate-400 block truncate">{f.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
