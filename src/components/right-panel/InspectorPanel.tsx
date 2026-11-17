import React from 'react';
import { PresetCatalog } from './PresetCatalog';
import { FineTuningSliders } from './FineTuningSliders';
import { TypoPresetId, CompositeTextGroup } from '@/types';
import { Smartphone, ArrowUpDown } from 'lucide-react';

interface InspectorPanelProps {
  textGroup: CompositeTextGroup | null;
  selectedPresetId: TypoPresetId;
  onSelectPreset: (presetId: TypoPresetId) => void;
  onUpdateTextGroup: (group: CompositeTextGroup) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  textGroup,
  selectedPresetId,
  onSelectPreset,
  onUpdateTextGroup,
}) => {
  if (!textGroup) {
    return (
      <div className="p-4 flex flex-col items-center justify-center text-center h-full text-slate-400">
        <span className="text-xs">Selecciona o genera una propuesta para editar su estilo y proporciones.</span>
      </div>
    );
  }

  const primarySegment = textGroup.segments[0];

  const handleInvertHierarchy = () => {
    if (textGroup.segments.length < 2) return;
    const [first, second] = textGroup.segments;
    onUpdateTextGroup({
      ...textGroup,
      segments: [second, first],
    });
  };

  return (
    <div className="p-3.5 flex flex-col gap-3.5 h-full">
      {/* 1. Presets */}
      <PresetCatalog
        selectedPresetId={selectedPresetId}
        onSelectPreset={onSelectPreset}
      />

      {/* 2. Editor de Segmentos */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Segmentos del Título
          </label>
          <button
            onClick={handleInvertHierarchy}
            className="text-[10px] text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>Invertir</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {textGroup.segments.map((seg, idx) => (
            <div key={seg.id} className="p-2 rounded-md bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-400 font-mono block">
                {idx === 0 ? 'Línea 1 (Apoyo)' : 'Línea 2 (Power Word)'}
              </span>
              <span className="font-bold text-slate-800">{seg.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Sliders */}
      <FineTuningSliders
        strokeWidth={primarySegment?.strokeWidth || 16}
        onStrokeChange={(val) => {
          onUpdateTextGroup({
            ...textGroup,
            segments: textGroup.segments.map((s) => ({ ...s, strokeWidth: val })),
          });
        }}
        shadowDepth={primarySegment?.shadowDepth || 8}
        onShadowChange={(val) => {
          onUpdateTextGroup({
            ...textGroup,
            segments: textGroup.segments.map((s) => ({ ...s, shadowDepth: val })),
          });
        }}
        slant={primarySegment?.slant || 0}
        onSlantChange={(val) => {
          onUpdateTextGroup({
            ...textGroup,
            rotation: val,
            segments: textGroup.segments.map((s) => ({ ...s, slant: val })),
          });
        }}
      />

      {/* 4. Score TRI */}
      <div className="mt-auto pt-3 border-t border-slate-100">
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide block">
              Legibilidad en Móvil (TRI)
            </span>
            <span className="text-xs font-bold text-emerald-950">
              Score: 92 / 100 • Óptimo
            </span>
          </div>
          <Smartphone className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};
