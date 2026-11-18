import React from 'react';

interface FineTuningSlidersProps {
  strokeWidth: number;
  strokeColorHex?: string;
  onStrokeChange: (val: number) => void;
  onStrokeColorChange?: (color: string) => void;
  shadowDepth: number;
  shadowColorHex?: string;
  onShadowChange: (val: number) => void;
  onShadowColorChange?: (color: string) => void;
  slant: number;
  onSlantChange: (val: number) => void;
}

export const FineTuningSliders: React.FC<FineTuningSlidersProps> = ({
  strokeWidth,
  strokeColorHex = '#000000',
  onStrokeChange,
  onStrokeColorChange,
  shadowDepth,
  shadowColorHex = '#000000',
  onShadowChange,
  onShadowColorChange,
  slant,
  onSlantChange,
}) => {
  return (
    <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
        Fine-Tuning Controls
      </label>

      {/* Stroke */}
      <div>
        <div className="flex items-center justify-between text-slate-600 mb-0.5">
          <span className="font-medium text-[11px]">Stroke</span>
          <div className="flex items-center gap-1.5">
            {onStrokeColorChange && (
              <input
                type="color"
                value={strokeColorHex}
                onChange={(e) => onStrokeColorChange(e.target.value)}
                className="w-4 h-4 rounded border border-slate-300 p-0 cursor-pointer shrink-0"
                title="Stroke Color"
              />
            )}
            <span className="font-mono text-slate-800 font-bold">{strokeWidth}px</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="28"
          value={strokeWidth}
          onChange={(e) => onStrokeChange(Number(e.target.value))}
          className="w-full accent-blue-600 h-1.5 cursor-pointer"
        />
      </div>

      {/* 3D Shadow */}
      <div>
        <div className="flex items-center justify-between text-slate-600 mb-0.5">
          <span className="font-medium text-[11px]">3D Shadow</span>
          <div className="flex items-center gap-1.5">
            {onShadowColorChange && (
              <input
                type="color"
                value={shadowColorHex}
                onChange={(e) => onShadowColorChange(e.target.value)}
                className="w-4 h-4 rounded border border-slate-300 p-0 cursor-pointer shrink-0"
                title="3D Shadow Color"
              />
            )}
            <span className="font-mono text-slate-800 font-bold">{shadowDepth}px</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={shadowDepth}
          onChange={(e) => onShadowChange(Number(e.target.value))}
          className="w-full accent-blue-600 h-1.5 cursor-pointer"
        />
      </div>

      {/* Slant */}
      <div>
        <div className="flex justify-between text-slate-600 mb-0.5">
          <span className="font-medium text-[11px]">Slant</span>
          <span className="font-mono text-slate-800 font-bold">{slant}°</span>
        </div>
        <input
          type="range"
          min="-10"
          max="10"
          value={slant}
          onChange={(e) => onSlantChange(Number(e.target.value))}
          className="w-full accent-blue-600 h-1.5 cursor-pointer"
        />
      </div>
    </div>
  );
};
