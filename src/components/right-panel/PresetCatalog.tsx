import React from 'react';
import { TypoPresetId } from '@/types';
import { TYPO_PRESETS } from '@/core/presets/typoPresets';

interface PresetCatalogProps {
  selectedPresetId: TypoPresetId;
  onSelectPreset: (presetId: TypoPresetId) => void;
}

export const PresetCatalog: React.FC<PresetCatalogProps> = ({
  selectedPresetId,
  onSelectPreset,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Presets Estudiados (Composite)
        </label>
        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
          Alto CTR
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {Object.values(TYPO_PRESETS).map((p) => {
          const isSelected = selectedPresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-bold text-slate-800 block truncate">{p.name}</span>
              <span className="text-[9px] text-slate-500 block truncate">{p.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
