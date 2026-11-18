import React, { useRef } from 'react';
import { GraphicAssetElement, ActiveCanvasElement } from '@/types';
import { CURATED_ASSETS, CuratedAssetDefinition } from '@/core/assets/curatedAssets';
import { Upload, Trash2, Layers, Check } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface GraphicAssetsPickerProps {
  assets: GraphicAssetElement[];
  onAddAsset: (asset: GraphicAssetElement) => void;
  onRemoveAsset: (id: string) => void;
  activeElement: ActiveCanvasElement;
  onSelectActiveElement: (elem: ActiveCanvasElement) => void;
}

export const GraphicAssetsPicker: React.FC<GraphicAssetsPickerProps> = ({
  assets,
  onAddAsset,
  onRemoveAsset,
  activeElement,
  onSelectActiveElement,
}) => {
  const { t } = useTranslation();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = (img.naturalHeight || 1) / (img.naturalWidth || 1);
        const baseWidth = Math.min(260, img.naturalWidth || 200);
        const baseHeight = Math.round(baseWidth * aspect);
        const maxZ = assets.reduce((max, a) => Math.max(max, a.zIndex), 0);

        const newAsset: GraphicAssetElement = {
          id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'graphic_asset',
          name: file.name.replace(/\.[^/.]+$/, ''),
          dataUrl,
          x: 510,
          y: 260,
          width: baseWidth,
          height: baseHeight,
          rotation: 0,
          scale: 1.0,
          opacity: 1.0,
          hasStickerBorder: true,
          borderWidth: 6,
          borderColorHex: '#FFFFFF',
          hasShadow: true,
          shadowDepth: 6,
          shadowColorHex: '#000000',
          zIndex: maxZ + 1,
        };

        onAddAsset(newAsset);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleAddCurated = (curated: CuratedAssetDefinition) => {
    const maxZ = assets.reduce((max, a) => Math.max(max, a.zIndex), 0);
    const newAsset: GraphicAssetElement = {
      id: `curated_${curated.id}_${Date.now()}`,
      type: 'graphic_asset',
      name: curated.name,
      dataUrl: curated.dataUrl,
      x: 520,
      y: 260,
      width: curated.width,
      height: curated.height,
      rotation: 0,
      scale: 1.0,
      opacity: 1.0,
      hasStickerBorder: true,
      borderWidth: 6,
      borderColorHex: '#FFFFFF',
      hasShadow: true,
      shadowDepth: 6,
      shadowColorHex: '#000000',
      zIndex: maxZ + 1,
    };
    onAddAsset(newAsset);
  };

  return (
    <div className="space-y-4">
      {/* 1. Upload Custom Image */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          {t('modals.importStickerLabel')}
        </label>
        <input
          ref={uploadInputRef}
          type="file"
          accept=".png,.webp,.svg,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileUpload(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />
        <button
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          className="w-full py-2.5 px-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/60 hover:bg-blue-50 hover:border-blue-500 text-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
        >
          <Upload className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold">{t('modals.uploadCutoutBtn')}</span>
        </button>
        <span className="text-[9px] text-slate-400 block mt-1 text-center">
          {t('modals.transparentRecommended')}
        </span>
      </div>

      {/* 2. Placed Elements on Canvas */}
      {assets.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-600" />
              <span>{t('modals.canvasLayers', { count: assets.length })}</span>
            </label>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {assets.map((asset) => {
              const isSelected = activeElement?.type === 'asset' && activeElement.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => onSelectActiveElement({ type: 'asset', id: asset.id })}
                  className={`flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/80 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 p-0.5">
                      <img src={asset.dataUrl} alt={asset.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[130px]">
                      {asset.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAsset(asset.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title={t('modals.deleteTitle')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Curated YouTube Essentials */}
      <div className="pt-2 border-t border-slate-200 space-y-3">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          {t('modals.essentialsPack')}
        </label>

        {/* Arrows */}
        <div>
          <span className="text-[10px] font-semibold text-slate-500 block mb-1">{t('modals.attentionArrows')}</span>
          <div className="grid grid-cols-3 gap-1.5">
            {CURATED_ASSETS.filter((a) => a.category === 'arrows').map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAddCurated(item)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
                title={t('modals.addNamedTitle', { name: item.name })}
              >
                <div className="w-12 h-8 flex items-center justify-center">
                  <img src={item.dataUrl} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] font-medium text-slate-600 truncate max-w-full">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <span className="text-[10px] font-semibold text-slate-500 block mb-1">{t('modals.viralBadges')}</span>
          <div className="grid grid-cols-2 gap-1.5">
            {CURATED_ASSETS.filter((a) => a.category === 'badges').map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAddCurated(item)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all flex items-center gap-2 cursor-pointer group"
                title={t('modals.addNamedTitle', { name: item.name })}
              >
                <div className="w-10 h-7 flex items-center justify-center shrink-0">
                  <img src={item.dataUrl} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] font-medium text-slate-700 truncate">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Reactions */}
        <div>
          <span className="text-[10px] font-semibold text-slate-500 block mb-1">{t('modals.reactionIcons')}</span>
          <div className="grid grid-cols-3 gap-1.5">
            {CURATED_ASSETS.filter((a) => a.category === 'reactions').map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAddCurated(item)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
                title={t('modals.addNamedTitle', { name: item.name })}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src={item.dataUrl} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] font-medium text-slate-600 truncate max-w-full">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
