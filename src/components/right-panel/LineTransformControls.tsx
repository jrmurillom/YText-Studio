import React from 'react';
import { MoveHorizontal, MoveVertical, RotateCw, RotateCcw } from 'lucide-react';

interface LineTransformControlsProps {
  offsetX: number;
  offsetY: number;
  rotation: number;
  onChangeOffsetX: (val: number) => void;
  onChangeOffsetY: (val: number) => void;
  onChangeRotation: (val: number) => void;
  onReset: () => void;
}

export const LineTransformControls: React.FC<LineTransformControlsProps> = ({
  offsetX,
  offsetY,
  rotation,
  onChangeOffsetX,
  onChangeOffsetY,
  onChangeRotation,
  onReset,
}) => {
  const isModified = offsetX !== 0 || offsetY !== 0 || rotation !== 0;

  return (
    <div className="space-y-2 pt-2 border-t border-slate-200/80 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Micro-Layout & Posicionamiento
        </span>
        {isModified && (
          <button
            type="button"
            onClick={onReset}
            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset position and rotation to zero"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
        {/* Offset X (Horizontal Stagger) */}
        <div>
          <div className="flex items-center justify-between text-slate-600 mb-0.5">
            <span className="font-medium text-[11px] flex items-center gap-1">
              <MoveHorizontal className="w-3 h-3 text-slate-400" />
              <span>Offset X (Horizontal)</span>
            </span>
            <span className="font-mono text-slate-800 font-bold text-[11px]">
              {offsetX > 0 ? `+${offsetX}` : offsetX}px
            </span>
          </div>
          <input
            type="range"
            min="-150"
            max="150"
            value={offsetX}
            onChange={(e) => onChangeOffsetX(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 cursor-pointer"
          />
        </div>

        {/* Offset Y (Vertical Spacing / Gap) */}
        <div>
          <div className="flex items-center justify-between text-slate-600 mb-0.5">
            <span className="font-medium text-[11px] flex items-center gap-1">
              <MoveVertical className="w-3 h-3 text-slate-400" />
              <span>Offset Y (Interlineado)</span>
            </span>
            <span className="font-mono text-slate-800 font-bold text-[11px]">
              {offsetY > 0 ? `+${offsetY}` : offsetY}px
            </span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={offsetY}
            onChange={(e) => onChangeOffsetY(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 cursor-pointer"
          />
        </div>

        {/* Individual Line Rotation */}
        <div>
          <div className="flex items-center justify-between text-slate-600 mb-0.5">
            <span className="font-medium text-[11px] flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-slate-400" />
              <span>Rotación de Línea</span>
            </span>
            <span className="font-mono text-slate-800 font-bold text-[11px]">
              {rotation > 0 ? `+${rotation}` : rotation}°
            </span>
          </div>
          <input
            type="range"
            min="-25"
            max="25"
            value={rotation}
            onChange={(e) => onChangeRotation(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
