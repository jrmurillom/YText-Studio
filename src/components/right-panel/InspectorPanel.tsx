import React from 'react';
import { FontFamilySelector } from './FontFamilySelector';
import { FineTuningSliders } from './FineTuningSliders';
import { LineTransformControls } from './LineTransformControls';
import { AssetInspector } from './AssetInspector';
import { CompositeTextGroup, TextSegment, GraphicAssetElement, ActiveCanvasElement } from '@/types';
import { Smartphone, Sliders, Plus, Trash2, ChevronUp, ChevronDown, Info, X } from 'lucide-react';
import { ReadabilityCalculator } from '@/core/metrics/ReadabilityCalculator';
import { useTranslation } from '@/i18n';

interface InspectorPanelProps {
  textGroup: CompositeTextGroup | null;
  onUpdateTextGroup: (group: CompositeTextGroup) => void;
  graphicAssets?: GraphicAssetElement[];
  onUpdateGraphicAssets?: (assets: GraphicAssetElement[]) => void;
  activeElement?: ActiveCanvasElement;
  onSelectActiveElement?: (elem: ActiveCanvasElement) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  textGroup,
  onUpdateTextGroup,
  graphicAssets = [],
  onUpdateGraphicAssets,
  activeElement = { type: 'text' },
  onSelectActiveElement,
}) => {
  const { t } = useTranslation();

  // 1. Si el elemento activo es un Asset Gráfico
  if (activeElement?.type === 'asset') {
    const selectedAsset = graphicAssets.find((a) => a.id === activeElement.id);
    if (selectedAsset) {
      const handleUpdateAsset = (updated: GraphicAssetElement) => {
        const next = graphicAssets.map((a) => (a.id === updated.id ? updated : a));
        onUpdateGraphicAssets?.(next);
      };

      const handleDeleteAsset = (id: string) => {
        const next = graphicAssets.filter((a) => a.id !== id);
        onUpdateGraphicAssets?.(next);
        onSelectActiveElement?.(textGroup ? { type: 'text' } : null);
      };

      const handleBringToFront = (id: string) => {
        const maxZ = graphicAssets.reduce((max, a) => Math.max(max, a.zIndex), 0);
        const next = graphicAssets.map((a) => (a.id === id ? { ...a, zIndex: maxZ + 1 } : a));
        onUpdateGraphicAssets?.(next);
      };

      const handleSendToBack = (id: string) => {
        const minZ = graphicAssets.reduce((min, a) => Math.min(min, a.zIndex), 0);
        const next = graphicAssets.map((a) => (a.id === id ? { ...a, zIndex: minZ - 1 } : a));
        onUpdateGraphicAssets?.(next);
      };

      return (
        <div className="p-4 space-y-5 text-xs text-slate-800">
          <AssetInspector
            asset={selectedAsset}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
          />
        </div>
      );
    }
  }

  // 2. Si no hay grupo de texto y no hay asset seleccionado
  if (!textGroup) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center h-full text-slate-400 gap-2">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
          <Sliders className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-600">{t('inspector.idleTitle')}</span>
        <span className="text-[11px] leading-relaxed max-w-[200px]">
          {t('inspector.idleDesc')}
        </span>
        <button
          type="button"
          onClick={() => {
            onUpdateTextGroup({
              id: `group_manual_${Date.now()}`,
              x: 64,
              y: 48,
              width: 420,
              height: 160,
              rotation: 0,
              scale: 1,
              placement: 'TOP_LEFT',
              segments: [
                {
                  id: `seg_${Date.now()}_0`,
                  text: 'NEW HOOK',
                  role: 'anchor_secondary',
                  fontFamily: 'Montserrat',
                  fontSize: 54,
                  colorHex: '#FFFFFF',
                  strokeColorHex: '#000000',
                  strokeWidth: 12,
                  shadowColorHex: '#000000',
                  shadowDepth: 4,
                  slant: 0,
                  hasBadge: false,
                },
                {
                  id: `seg_${Date.now()}_1`,
                  text: 'MAIN IMPACT',
                  role: 'power_primary',
                  fontFamily: 'Montserrat',
                  fontSize: 76,
                  colorHex: '#FFE600',
                  gradientColorHex: '#FF9900',
                  strokeColorHex: '#000000',
                  strokeWidth: 16,
                  shadowColorHex: '#000000',
                  shadowDepth: 6,
                  slant: 0,
                  hasBadge: false,
                },
              ],
            });
            onSelectActiveElement?.({ type: 'text' });
          }}
          className="mt-2 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('inspector.addCustomText')}</span>
        </button>
      </div>
    );
  }

  const [activeLineIndex, setActiveLineIndex] = React.useState<number>(0);
  const [applyFontToAll, setApplyFontToAll] = React.useState<boolean>(false);
  const [applyFineTuningToAll, setApplyFineTuningToAll] = React.useState<boolean>(false);
  const [isReadabilityModalOpen, setIsReadabilityModalOpen] = React.useState<boolean>(false);

  // Ensure active index is strictly within bounds
  const safeActiveIndex = Math.min(
    Math.max(0, activeLineIndex),
    Math.max(0, textGroup.segments.length - 1)
  );
  const activeSegment = textGroup.segments[safeActiveIndex] || textGroup.segments[0];
  const primarySegment = textGroup.segments[0];

  const handleMoveLine = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= textGroup.segments.length) return;
    const newSegments = [...textGroup.segments];
    const temp = newSegments[idx];
    newSegments[idx] = newSegments[targetIdx];
    newSegments[targetIdx] = temp;
    setActiveLineIndex(targetIdx);
    onUpdateTextGroup({
      ...textGroup,
      segments: newSegments,
    });
  };

  const handleFontChange = (fontFamily: string) => {
    if (applyFontToAll) {
      onUpdateTextGroup({
        ...textGroup,
        segments: textGroup.segments.map((s) => ({ ...s, fontFamily })),
      });
    } else {
      onUpdateTextGroup({
        ...textGroup,
        segments: textGroup.segments.map((s, i) =>
          i === safeActiveIndex ? { ...s, fontFamily } : s
        ),
      });
    }
  };

  const handleAddLine = () => {
    if (textGroup.segments.length >= 3) return;
    const newLine: TextSegment = {
      id: `seg_${Date.now()}`,
      text: 'NEW LINE',
      role: 'power_primary',
      fontFamily: activeSegment?.fontFamily || 'Montserrat',
      fontSize: 52,
      colorHex: '#FFFFFF',
      strokeColorHex: primarySegment?.strokeColorHex || '#000000',
      strokeWidth: primarySegment?.strokeWidth || 14,
      shadowColorHex: primarySegment?.shadowColorHex || '#000000',
      shadowDepth: primarySegment?.shadowDepth || 6,
      slant: primarySegment?.slant || 0,
      hasBadge: false,
      badgeBgColor: '#0F172A',
    };
    const nextSegments = [...textGroup.segments, newLine];
    setActiveLineIndex(nextSegments.length - 1);
    onUpdateTextGroup({
      ...textGroup,
      segments: nextSegments,
    });
  };

  const handleRemoveLine = (idx: number) => {
    if (textGroup.segments.length <= 1) return;
    const nextSegments = textGroup.segments.filter((_, i) => i !== idx);
    setActiveLineIndex(Math.max(0, Math.min(safeActiveIndex, nextSegments.length - 1)));
    onUpdateTextGroup({
      ...textGroup,
      segments: nextSegments,
    });
  };

  const handleToggleLineBadge = (idx: number) => {
    onUpdateTextGroup({
      ...textGroup,
      segments: textGroup.segments.map((s, i) =>
        i === idx
          ? {
              ...s,
              hasBadge: !s.hasBadge,
              badgeBgColor: !s.hasBadge ? (s.badgeBgColor || '#0F172A') : undefined,
            }
          : s
      ),
    });
  };

  const handleToggleLineGradient = (idx: number) => {
    onUpdateTextGroup({
      ...textGroup,
      segments: textGroup.segments.map((s, i) =>
        i === idx
          ? {
              ...s,
              gradientColorHex: s.gradientColorHex ? undefined : '#FF9900',
            }
          : s
      ),
    });
  };

  return (
    <div className="p-3.5 flex flex-col gap-3.5 h-full overflow-y-auto">
      {/* 1. MASTER: Line Navigator Strip */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {t('inspector.titleLines', { current: textGroup.segments.length, max: 3 })}
          </label>
          {textGroup.segments.length < 3 && (
            <button
              type="button"
              onClick={handleAddLine}
              className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors"
              title={t('inspector.addLineTitle')}
            >
              <Plus className="w-3 h-3" />
              <span>{t('inspector.addLine')}</span>
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {textGroup.segments.map((seg, idx) => {
            const isActive = idx === safeActiveIndex;
            return (
              <div
                key={seg.id}
                onClick={() => setActiveLineIndex(idx)}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-400/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className="font-bold text-slate-800 truncate"
                    style={{ fontFamily: seg.fontFamily }}
                  >
                    {seg.text || t('inspector.emptyLine')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                  <span className="text-slate-400 font-mono text-[9px]">{seg.fontFamily}</span>
                  <div
                    className="w-3.5 h-3.5 rounded border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: seg.colorHex }}
                    title={t('inspector.textColorTitle', { color: seg.colorHex })}
                  />
                  {seg.hasBadge && (
                    <span
                      className="text-[9px] px-1 py-0.2 rounded font-mono font-bold border border-slate-700 text-white shadow-2xs"
                      style={{ backgroundColor: seg.badgeBgColor || '#0F172A' }}
                      title={t('inspector.badgeActiveTitle', { color: seg.badgeBgColor || '#0F172A' })}
                    >
                      🛡️
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DETAIL: Active Line Editor Card */}
      {activeSegment && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-2.5 shadow-2xs">
          {/* Header of Active Line with Reorder & Delete */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono font-bold text-[10px]">
                {t('inspector.lineNum', { num: safeActiveIndex + 1 })}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {textGroup.segments.length > 1 && (
                <div className="flex items-center bg-slate-200/80 rounded p-0.5 border border-slate-300/60">
                  <button
                    type="button"
                    onClick={() => handleMoveLine(safeActiveIndex, 'up')}
                    disabled={safeActiveIndex === 0}
                    className="p-0.5 rounded hover:bg-white text-slate-600 hover:text-slate-900 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title={t('inspector.moveUpTitle')}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveLine(safeActiveIndex, 'down')}
                    disabled={safeActiveIndex === textGroup.segments.length - 1}
                    className="p-0.5 rounded hover:bg-white text-slate-600 hover:text-slate-900 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title={t('inspector.moveDownTitle')}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              )}

              {textGroup.segments.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLine(safeActiveIndex)}
                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors ml-1"
                  title={t('inspector.removeLineTitle')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Full-width Line Text Input */}
          <div>
            <input
              type="text"
              value={activeSegment.text}
              onChange={(e) => {
                const newText = e.target.value;
                onUpdateTextGroup({
                  ...textGroup,
                  segments: textGroup.segments.map((s, i) =>
                    i === safeActiveIndex ? { ...s, text: newText } : s
                  ),
                });
              }}
              className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs"
              placeholder={t('inspector.lineTextPlaceholder')}
            />
          </div>

          {/* Symmetrical Styling Grid (Color, Gradient, Badge, Size) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Color & Gradient Card */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleToggleLineGradient(safeActiveIndex)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border cursor-pointer transition-colors ${
                    activeSegment.gradientColorHex
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                  title={t('inspector.toggleGradientTitle')}
                >
                  {t('inspector.gradient')}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={activeSegment.colorHex}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    onUpdateTextGroup({
                      ...textGroup,
                      segments: textGroup.segments.map((s, i) =>
                        i === safeActiveIndex ? { ...s, colorHex: newColor } : s
                      ),
                    });
                  }}
                  className="w-5 h-5 rounded border border-slate-300 p-0 cursor-pointer shrink-0"
                  title={t('inspector.primaryColorTitle')}
                />
                <span className="font-mono text-[9px] text-slate-400 uppercase">
                  {activeSegment.colorHex}
                </span>

                {activeSegment.gradientColorHex && (
                  <>
                    <span className="text-[9px] text-slate-400">→</span>
                    <input
                      type="color"
                      value={activeSegment.gradientColorHex}
                      onChange={(e) => {
                        const newGrad = e.target.value;
                        onUpdateTextGroup({
                          ...textGroup,
                          segments: textGroup.segments.map((s, i) =>
                            i === safeActiveIndex ? { ...s, gradientColorHex: newGrad } : s
                          ),
                        });
                      }}
                      className="w-5 h-5 rounded border border-slate-300 p-0 cursor-pointer shrink-0"
                      title={t('inspector.bottomGradientTitle')}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Badge (Background Container) Card */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleToggleLineBadge(safeActiveIndex)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border cursor-pointer transition-colors ${
                    activeSegment.hasBadge
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                  title={t('inspector.toggleBadgeTitle')}
                >
                  {t('inspector.badge')}
                </button>
              </div>

              <div
                className={`flex items-center gap-1.5 transition-opacity ${
                  activeSegment.hasBadge ? 'opacity-100' : 'opacity-35 pointer-events-none'
                }`}
              >
                <input
                  type="color"
                  value={activeSegment.badgeBgColor || '#0F172A'}
                  onChange={(e) => {
                    const newBg = e.target.value;
                    onUpdateTextGroup({
                      ...textGroup,
                      segments: textGroup.segments.map((s, i) =>
                        i === safeActiveIndex ? { ...s, badgeBgColor: newBg } : s
                      ),
                    });
                  }}
                  disabled={!activeSegment.hasBadge}
                  className="w-5 h-5 rounded border border-slate-300 p-0 cursor-pointer shrink-0"
                  title={t('inspector.badgeBgColorTitle')}
                />
                <span className="text-[9px] text-slate-500 font-medium">{t('inspector.background')}</span>
              </div>
            </div>

            {/* Font Size Full Width */}
            <div className="col-span-2 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2.5">
              <span className="text-[10px] font-bold text-slate-600 shrink-0">{t('inspector.size')}</span>
              <input
                type="range"
                min={20}
                max={140}
                value={activeSegment.fontSize}
                onChange={(e) => {
                  const size = Number(e.target.value);
                  onUpdateTextGroup({
                    ...textGroup,
                    segments: textGroup.segments.map((s, i) =>
                      i === safeActiveIndex ? { ...s, fontSize: size } : s
                    ),
                  });
                }}
                className="w-full accent-blue-600 h-1.5 cursor-pointer"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={16}
                  max={180}
                  value={activeSegment.fontSize}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    const size = isNaN(parsed) ? 20 : Math.max(16, Math.min(180, parsed));
                    onUpdateTextGroup({
                      ...textGroup,
                      segments: textGroup.segments.map((s, i) =>
                        i === safeActiveIndex ? { ...s, fontSize: size } : s
                      ),
                    });
                  }}
                  className="w-11 px-1 py-0.5 text-[10px] font-mono font-bold text-center bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  title={t('inspector.exactSizeTitle')}
                />
                <span className="text-[8px] text-slate-400 font-mono">px</span>
              </div>
            </div>
          </div>

          {/* Contextual Typography Selector for Active Line */}
          <div className="pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t('inspector.lineTypography')}
                </span>
                <span className="text-[9px] text-blue-600 font-mono font-bold">
                  {activeSegment.fontFamily}
                </span>
              </div>
              <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-500 hover:text-slate-800">
                <input
                  type="checkbox"
                  checked={applyFontToAll}
                  onChange={(e) => setApplyFontToAll(e.target.checked)}
                  className="accent-blue-600 rounded cursor-pointer"
                />
                <span>{t('inspector.applyToAll')}</span>
              </label>
            </div>

            <div className="max-h-[175px] overflow-y-auto pr-1">
              <FontFamilySelector
                currentFont={activeSegment.fontFamily}
                onSelectFont={handleFontChange}
              />
            </div>
          </div>

          {/* Micro-Layout & Individual Line Positioning */}
          <LineTransformControls
            offsetX={activeSegment.offsetX || 0}
            offsetY={activeSegment.offsetY || 0}
            rotation={activeSegment.rotation || 0}
            onChangeOffsetX={(val) => {
              onUpdateTextGroup({
                ...textGroup,
                segments: textGroup.segments.map((s, i) =>
                  i === safeActiveIndex ? { ...s, offsetX: val } : s
                ),
              });
            }}
            onChangeOffsetY={(val) => {
              onUpdateTextGroup({
                ...textGroup,
                segments: textGroup.segments.map((s, i) =>
                  i === safeActiveIndex ? { ...s, offsetY: val } : s
                ),
              });
            }}
            onChangeRotation={(val) => {
              onUpdateTextGroup({
                ...textGroup,
                segments: textGroup.segments.map((s, i) =>
                  i === safeActiveIndex ? { ...s, rotation: val } : s
                ),
              });
            }}
            onReset={() => {
              onUpdateTextGroup({
                ...textGroup,
                segments: textGroup.segments.map((s, i) =>
                  i === safeActiveIndex ? { ...s, offsetX: 0, offsetY: 0, rotation: 0 } : s
                ),
              });
            }}
          />
        </div>
      )}

      {/* 3. Granular Fine-Tuning Controls */}
      <FineTuningSliders
        title={t('inspector.fineTuningTitle', { num: safeActiveIndex + 1 })}
        applyToAll={applyFineTuningToAll}
        onToggleApplyToAll={setApplyFineTuningToAll}
        strokeWidth={activeSegment?.strokeWidth ?? 14}
        strokeColorHex={activeSegment?.strokeColorHex || '#000000'}
        onStrokeChange={(val) => {
          onUpdateTextGroup({
            ...textGroup,
            segments: textGroup.segments.map((s, i) =>
              applyFineTuningToAll || i === safeActiveIndex
                ? { ...s, strokeWidth: val }
                : s
            ),
          });
        }}
        onStrokeColorChange={(color) => {
          onUpdateTextGroup({
            ...textGroup,
            segments: textGroup.segments.map((s, i) =>
              applyFineTuningToAll || i === safeActiveIndex
                ? { ...s, strokeColorHex: color }
                : s
            ),
          });
        }}
        shadowDepth={activeSegment?.shadowDepth ?? 6}
        shadowColorHex={activeSegment?.shadowColorHex || '#000000'}
        onShadowChange={(val) => {
          onUpdateTextGroup({
            ...textGroup,
            segments: textGroup.segments.map((s, i) =>
              applyFineTuningToAll || i === safeActiveIndex
                ? { ...s, shadowDepth: val }
                : s
            ),
          });
        }}
        onShadowColorChange={(color) => {
          onUpdateTextGroup({
            ...textGroup,
            segments: textGroup.segments.map((s, i) =>
              applyFineTuningToAll || i === safeActiveIndex
                ? { ...s, shadowColorHex: color }
                : s
            ),
          });
        }}
        slant={activeSegment?.slant ?? 0}
        onSlantChange={(val) => {
          onUpdateTextGroup({
            ...textGroup,
            segments: textGroup.segments.map((s, i) =>
              applyFineTuningToAll || i === safeActiveIndex
                ? { ...s, slant: val }
                : s
            ),
          });
        }}
      />

      {/* 4. Dynamic TRI Score */}
      {(() => {
        const tri = ReadabilityCalculator.calculate(textGroup);
        const isOptimal = tri.level === 'optimal';
        const isAcceptable = tri.level === 'acceptable';
        const translatedTriLabel =
          textGroup.segments.length === 0
            ? t('inspector.triNoText')
            : isOptimal
            ? t('inspector.triOptimal')
            : isAcceptable
            ? t('inspector.triAcceptable')
            : t('inspector.triCritical');

        return (
          <div className="mt-auto pt-3 border-t border-slate-100">
            <div
              className={`p-2.5 rounded-lg border flex items-center justify-between ${
                isOptimal
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isAcceptable
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wide block ${
                      isOptimal
                        ? 'text-emerald-700'
                        : isAcceptable
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {t('inspector.mobileReadability')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsReadabilityModalOpen(true)}
                    className="p-0.5 rounded hover:bg-black/5 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                    title={t('inspector.readabilityAuditTitle')}
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-xs font-bold">
                  {t('inspector.scoreLabel', { score: tri.score, label: translatedTriLabel })}
                </span>
              </div>
              <Smartphone
                className={`w-4 h-4 ${
                  isOptimal
                    ? 'text-emerald-600'
                    : isAcceptable
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              />
            </div>

            {/* Modal Bajo Demanda: Desglose Limpio de Legibilidad */}
            {isReadabilityModalOpen && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-4 space-y-3.5 text-xs text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-sm text-slate-900">{t('inspector.auditModalTitle')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReadabilityModalOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                      title={t('inspector.closeModal')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t('inspector.auditModalIntro')}
                  </p>

                  <div className="space-y-2.5">
                    {/* Criterio 1: Densidad de palabras */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">{t('inspector.wordDensity')}</span>
                        <span className={`font-mono font-bold text-[11px] ${tri.wordCount <= 3 ? 'text-emerald-600' : tri.wordCount <= 6 ? 'text-amber-600' : 'text-red-600'}`}>
                          {tri.wordCount} {tri.wordCount === 1 ? t('inspector.wordSingular') : t('inspector.wordPlural')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {tri.wordCount <= 3
                          ? t('inspector.wordOptimal')
                          : tri.wordCount <= 6
                          ? t('inspector.wordWarning')
                          : t('inspector.wordCritical')}
                      </span>
                    </div>

                    {/* Criterio 2: Tamaño de fuente proyectado */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">{t('inspector.projectedSize')}</span>
                        <span className={`font-mono font-bold text-[11px] ${tri.projectedMobileFontSize >= 18 ? 'text-emerald-600' : tri.projectedMobileFontSize >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
                          {t('inspector.projectedPx', { size: tri.projectedMobileFontSize })}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {tri.projectedMobileFontSize >= 18
                          ? t('inspector.sizeOptimal')
                          : tri.projectedMobileFontSize >= 10
                          ? t('inspector.sizeWarning')
                          : t('inspector.sizeCritical')}
                      </span>
                    </div>

                    {/* Criterio 3: Protección de contraste */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">{t('inspector.contrastProtection')}</span>
                        <span className="font-mono font-bold text-[11px] text-slate-700">
                          {tri.isContrastProtected ? (
                            <span className="text-emerald-600">{t('inspector.protected')}</span>
                          ) : (
                            <span className="text-red-600">
                              {tri.unprotectedLinesCount === 1 ? '-8 pts' : '-25 pts'}
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {tri.isContrastProtected
                          ? t('inspector.contrastOptimal')
                          : t('inspector.contrastCritical')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-700">
                      {t('inspector.finalScore')} <strong className="text-blue-600">{tri.score} / 100</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsReadabilityModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      {t('inspector.gotIt')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
