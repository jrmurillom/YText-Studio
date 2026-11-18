import React from 'react';
import { useTranslation } from '@/i18n';

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
  title?: string;
  applyToAll?: boolean;
  onToggleApplyToAll?: (val: boolean) => void;
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
  title,
  applyToAll = false,
  onToggleApplyToAll,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          {title || t('inspector.fineTuningDefaultTitle')}
        </label>
        {onToggleApplyToAll && (
          <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-500 hover:text-slate-800">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(e) => onToggleApplyToAll(e.target.checked)}
              className="accent-blue-600 rounded cursor-pointer"
            />
            <span>{t('inspector.applyToAllLines')}</span>
          </label>
        )}
      </div>

      {/* Stroke */}
      <div>
        <div className="flex items-center justify-between text-slate-600 mb-0.5">
          <span className="font-medium text-[11px]">{t('inspector.stroke')}</span>
          <div className="flex items-center gap-1.5">
            {onStrokeColorChange && (
              <input
                type="color"
                value={strokeColorHex}
                onChange={(e) => onStrokeColorChange(e.target.value)}
                className="w-4 h-4 rounded border border-slate-300 p-0 cursor-pointer shrink-0"
                title={t('inspector.strokeColorTitle')}
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
          <span className="font-medium text-[11px]">{t('inspector.shadow3d')}</span>
          <div className="flex items-center gap-1.5">
            {onShadowColorChange && (
              <input
                type="color"
                value={shadowColorHex}
                onChange={(e) => onShadowColorChange(e.target.value)}
                className="w-4 h-4 rounded border border-slate-300 p-0 cursor-pointer shrink-0"
                title={t('inspector.shadowColorTitle')}
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
          <span className="font-medium text-[11px]">{t('inspector.slant')}</span>
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
