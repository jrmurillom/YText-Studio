import React from 'react';
import { GraphicAssetElement } from '@/types';
import { Trash2, ArrowUp, ArrowDown, Sparkles, Layers, Sliders } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface AssetInspectorProps {
  asset: GraphicAssetElement;
  onUpdateAsset: (updated: GraphicAssetElement) => void;
  onDeleteAsset: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
}

export const AssetInspector: React.FC<AssetInspectorProps> = ({
  asset,
  onUpdateAsset,
  onDeleteAsset,
  onBringToFront,
  onSendToBack,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Header del Asset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 p-1">
            <img src={asset.dataUrl} alt={asset.name} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('inspector.graphicElement')}
            </span>
            <span className="text-xs font-bold text-slate-800 truncate block">
              {asset.name}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDeleteAsset(asset.id)}
          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          title={t('inspector.deleteElementTitle')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Escala & Tamaño */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sliders className="w-3 h-3 text-blue-600" />
            <span>{t('inspector.assetScale')}</span>
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={10}
              max={300}
              step={1}
              value={Math.round(asset.scale * 100)}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val)) {
                  onUpdateAsset({ ...asset, scale: Math.max(0.1, Math.min(3.0, val / 100)) });
                }
              }}
              className="w-12 text-right font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400 font-mono">%</span>
          </div>
        </div>
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.05"
          value={asset.scale}
          onChange={(e) => onUpdateAsset({ ...asset, scale: parseFloat(e.target.value) })}
          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
        />
      </div>

      {/* Rotación */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {t('inspector.assetRotation')}
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={-180}
              max={180}
              step={1}
              value={asset.rotation}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val)) {
                  onUpdateAsset({ ...asset, rotation: Math.max(-180, Math.min(180, val)) });
                }
              }}
              className="w-12 text-right font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400 font-mono">°</span>
          </div>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          step="1"
          value={asset.rotation}
          onChange={(e) => onUpdateAsset({ ...asset, rotation: parseInt(e.target.value, 10) })}
          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
        />
      </div>

      {/* Opacidad */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {t('inspector.assetOpacity')}
          </label>
          <span className="font-mono text-[11px] font-bold text-slate-700">
            {Math.round(asset.opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={asset.opacity}
          onChange={(e) => onUpdateAsset({ ...asset, opacity: parseFloat(e.target.value) })}
          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
        />
      </div>

      {/* Efectos de YouTube (Sticker Outline & 3D Shadow) */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('inspector.youtubeEffects')}</span>
        </span>

        {/* Toggle Sticker White Outline */}
        <div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-slate-800">{t('inspector.stickerOutline')}</span>
            <input
              type="checkbox"
              checked={asset.hasStickerBorder}
              onChange={(e) => onUpdateAsset({ ...asset, hasStickerBorder: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </label>
          {asset.hasStickerBorder && (
            <div className="mt-2 pl-2 border-l-2 border-blue-400 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{t('inspector.borderWidth')}</span>
                <span className="text-[10px] font-mono font-bold text-slate-700">{asset.borderWidth}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                step="1"
                value={asset.borderWidth}
                onChange={(e) => onUpdateAsset({ ...asset, borderWidth: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 rounded"
              />
            </div>
          )}
        </div>

        {/* Toggle 3D Hard Shadow */}
        <div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-slate-800">{t('inspector.dropShadow3d')}</span>
            <input
              type="checkbox"
              checked={asset.hasShadow}
              onChange={(e) => onUpdateAsset({ ...asset, hasShadow: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </label>
          {asset.hasShadow && (
            <div className="mt-2 pl-2 border-l-2 border-blue-400 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{t('inspector.shadowDepth')}</span>
                <span className="text-[10px] font-mono font-bold text-slate-700">{asset.shadowDepth}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                step="1"
                value={asset.shadowDepth}
                onChange={(e) => onUpdateAsset({ ...asset, shadowDepth: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 rounded"
              />
            </div>
          )}
        </div>
      </div>

      {/* Orden de Capas (Z-Index) */}
      <div className="pt-2 border-t border-slate-200">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
          <Layers className="w-3 h-3 text-blue-600" />
          <span>{t('inspector.layerPosition')}</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onBringToFront(asset.id)}
            className="py-1.5 px-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('inspector.bringToFront')}</span>
          </button>
          <button
            type="button"
            onClick={() => onSendToBack(asset.id)}
            className="py-1.5 px-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('inspector.sendToBack')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
