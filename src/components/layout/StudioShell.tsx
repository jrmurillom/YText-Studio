import React, { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Undo2, Redo2 } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface StudioShellProps {
  leftPanel: React.ReactNode;
  centerStage: React.ReactNode;
  rightPanel: React.ReactNode;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const StudioShell: React.FC<StudioShellProps> = ({
  leftPanel,
  centerStage,
  rightPanel,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const { t } = useTranslation();
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('common.creationTools')}</span>
            <button
              type="button"
              onClick={() => setLeftCollapsed(true)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title={t('common.collapseLeft')}
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
            title={t('common.openTools')}
          >
            <PanelLeftOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('common.tools')}</span>
          </button>
        )}

        {/* Floating Controls Cluster (Top-Right): Historial + Botón Reabrir Inspector en Stack Vertical */}
        <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-2">
          {(onUndo || onRedo) && (
            <div className="flex items-center bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-sm rounded-lg p-0.5">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title={t('common.undoTitle')}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title={t('common.redoTitle')}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {rightCollapsed && (
            <button
              type="button"
              onClick={() => setRightCollapsed(false)}
              className="px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold animate-in fade-in duration-150"
              title={t('common.openInspector')}
            >
              <span>{t('common.inspector')}</span>
              <PanelRightOpen className="w-3.5 h-3.5 text-blue-600" />
            </button>
          )}
        </div>

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
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('common.inspector')}</span>
            <button
              type="button"
              onClick={() => setRightCollapsed(true)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title={t('common.collapseRight')}
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
