import React from 'react';

interface TelemetryBarProps {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  hasCollision: boolean;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  x,
  y,
  scale,
  rotation,
  hasCollision,
}) => {
  return (
    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs select-none">
      <span>
        Posición: <strong className="text-slate-800 font-mono">X: {Math.round(x)}, Y: {Math.round(y)}</strong>
      </span>
      <span className="text-slate-300">•</span>
      <span>
        Escala: <strong className="text-slate-800 font-mono">{Math.round(scale * 100)}%</strong>
      </span>
      <span className="text-slate-300">•</span>
      <span>
        Rotación: <strong className="text-slate-800 font-mono">{Math.round(rotation)}°</strong>
      </span>

      {hasCollision && (
        <>
          <span className="text-slate-300">•</span>
          <span className="text-red-600 font-bold flex items-center gap-1">
            ⚠️ Conflicto con Timestamp
          </span>
        </>
      )}
    </div>
  );
};
