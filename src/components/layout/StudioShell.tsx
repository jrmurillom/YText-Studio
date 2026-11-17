import React from 'react';

interface StudioShellProps {
  leftPanel: React.ReactNode;
  centerStage: React.ReactNode;
  rightPanel: React.ReactNode;
}

export const StudioShell: React.FC<StudioShellProps> = ({
  leftPanel,
  centerStage,
  rightPanel,
}) => {
  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* Columna Izquierda: Ingesta & IA Director */}
      <aside className="w-68 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto z-10 shadow-xs">
        {leftPanel}
      </aside>

      {/* Columna Central: Canvas Viewport Stage */}
      <main className="flex-1 bg-slate-100/90 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
        {centerStage}
      </main>

      {/* Columna Derecha: Inspector Tipográfico Manual */}
      <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto z-10 shadow-xs">
        {rightPanel}
      </aside>
    </div>
  );
};
