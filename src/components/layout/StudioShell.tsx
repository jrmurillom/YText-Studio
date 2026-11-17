import React, { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

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
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 relative">
      {/* Left Column: Ingestion & Proposals */}
      <aside
        className={`bg-white border-r border-slate-200 flex flex-col shrink-0 relative transition-all duration-200 ease-in-out z-10 shadow-xs ${
          leftCollapsed ? 'w-0 overflow-hidden border-none' : 'w-68'
        }`}
      >
        <div className="w-68 flex flex-col h-full overflow-hidden">
          <div className="h-8 px-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0 select-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Creation Tools</span>
            <button
              type="button"
              onClick={() => setLeftCollapsed(true)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Collapse left panel"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {leftPanel}
          </div>
        </div>
      </aside>

      {/* Center Column: Canvas Viewport Stage */}
      <main className="flex-1 bg-slate-100/90 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
        {/* Floating reopen button for left panel */}
        {leftCollapsed && (
          <button
            type="button"
            onClick={() => setLeftCollapsed(false)}
            className="absolute left-3 top-3 z-20 px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold animate-in fade-in duration-150"
            title="Open Tools & Proposals panel"
          >
            <PanelLeftOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Tools</span>
          </button>
        )}

        {/* Floating reopen button for right panel */}
        {rightCollapsed && (
          <button
            type="button"
            onClick={() => setRightCollapsed(false)}
            className="absolute right-3 top-3 z-20 px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold animate-in fade-in duration-150"
            title="Open Typography Inspector panel"
          >
            <span>Inspector</span>
            <PanelRightOpen className="w-3.5 h-3.5 text-blue-600" />
          </button>
        )}

        {centerStage}
      </main>

      {/* Right Column: Typography Inspector */}
      <aside
        className={`bg-white border-l border-slate-200 flex flex-col shrink-0 relative transition-all duration-200 ease-in-out z-10 shadow-xs ${
          rightCollapsed ? 'w-0 overflow-hidden border-none' : 'w-72'
        }`}
      >
        <div className="w-72 flex flex-col h-full overflow-hidden">
          <div className="h-8 px-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0 select-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inspector</span>
            <button
              type="button"
              onClick={() => setRightCollapsed(true)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Collapse right panel"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rightPanel}
          </div>
        </div>
      </aside>
    </div>
  );
};
