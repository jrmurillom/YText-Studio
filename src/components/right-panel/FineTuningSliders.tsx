import React from 'react';

interface FineTuningSlidersProps {
  strokeWidth: number;
  onStrokeChange: (val: number) => void;
  shadowDepth: number;
  onShadowChange: (val: number) => void;
  slant: number;
  onSlantChange: (val: number) => void;
}

export const FineTuningSliders: React.FC<FineTuningSlidersProps> = ({
  strokeWidth,
  onStrokeChange,
  shadowDepth,
  onShadowChange,
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
        <div className="flex justify-between text-slate-600 mb-0.5">
          <span className="font-medium text-[11px]">Outline Stroke</span>
          <span className="font-mono text-slate-800 font-bold">{strokeWidth}px</span>
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
        <div className="flex justify-between text-slate-600 mb-0.5">
          <span className="font-medium text-[11px]">3D Hard Shadow (45°)</span>
          <span className="font-mono text-slate-800 font-bold">{shadowDepth}px</span>
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
          <span className="font-medium text-[11px]">Slant Angle</span>
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
