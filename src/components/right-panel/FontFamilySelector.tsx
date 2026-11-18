import React from 'react';

interface FontFamilySelectorProps {
  currentFont: string;
  onSelectFont: (fontFamily: string) => void;
}

export const AVAILABLE_FONTS = [
  { id: 'Montserrat', name: 'Montserrat', desc: 'Bold Sans • High Punch' },
  { id: 'Anton', name: 'Anton', desc: 'Condensed • High Impact' },
  { id: 'Bebas Neue', name: 'Bebas Neue', desc: 'YouTube Classic' },
  { id: 'Teko', name: 'Teko', desc: 'Ultra-Tall • Gaming' },
  { id: 'Permanent Marker', name: 'Permanent Marker', desc: 'Marker • Urgent Hook' },
  { id: 'Poppins', name: 'Poppins', desc: 'Geometric • Clean' },
  { id: 'Cinzel', name: 'Cinzel', desc: 'Cinematic Serif • Drama' },
  { id: 'Playfair Display', name: 'Playfair Display', desc: 'Editorial • True Crime' },
  { id: 'Inter', name: 'Inter', desc: 'Clean • Tech Authority' },
  { id: 'Rubik', name: 'Rubik', desc: 'Modern • Rounded Pop' },
  { id: 'Luckiest Guy', name: 'Luckiest Guy', desc: 'Cartoon • Fun Humor' },
  { id: 'Bangers', name: 'Bangers', desc: 'Viral • High Adrenaline' },
];

export const FontFamilySelector: React.FC<FontFamilySelectorProps> = ({
  currentFont,
  onSelectFont,
}) => {
  return (
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
  );
};
