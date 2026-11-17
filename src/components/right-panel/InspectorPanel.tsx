import React from 'react';
import { FontFamilySelector } from './FontFamilySelector';
import { FineTuningSliders } from './FineTuningSliders';
import { CompositeTextGroup, TextSegment } from '@/types';
import { Smartphone, ArrowUpDown, Shield, Sliders, Plus, Trash2, Sparkles } from 'lucide-react';
import { ReadabilityCalculator } from '@/core/metrics/ReadabilityCalculator';

interface InspectorPanelProps {
  textGroup: CompositeTextGroup | null;
  onUpdateTextGroup: (group: CompositeTextGroup) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  textGroup,
  onUpdateTextGroup,
}) => {
  if (!textGroup) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center h-full text-slate-400 gap-2">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
          <Sliders className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-600">Ajustes Tipográficos Inactivos</span>
        <span className="text-[11px] leading-relaxed max-w-[200px]">
          Sube tu imagen y analiza con IA para generar propuestas y desbloquear los controles vectoriales.
        </span>
      </div>
    );
  }

  const primarySegment = textGroup.segments[0];
  const currentFont = primarySegment?.fontFamily || 'Montserrat';

  const handleInvertHierarchy = () => {
    if (textGroup.segments.length < 2) return;
    const [first, second, ...rest] = textGroup.segments;
    onUpdateTextGroup({
      ...textGroup,
      segments: [second, first, ...rest],
    });
  };

  const handleFontChange = (fontFamily: string) => {
    onUpdateTextGroup({
      ...textGroup,
      segments: textGroup.segments.map((s) => ({ ...s, fontFamily })),
    });
  };

  const handleAddLine = () => {
    if (textGroup.segments.length >= 3) return;
    const newLine: TextSegment = {
      id: `seg_${Date.now()}`,
      text: 'NUEVA PALABRA',
      role: 'power_primary',
      fontFamily: currentFont,
      fontSize: 52,
      colorHex: '#FFFFFF',
      strokeColorHex: '#000000',
      strokeWidth: primarySegment?.strokeWidth || 14,
      shadowColorHex: '#000000',
      shadowDepth: primarySegment?.shadowDepth || 6,
      slant: 0,
      hasBadge: false,
    };
    onUpdateTextGroup({
      ...textGroup,
      segments: [...textGroup.segments, newLine],
    });
  };

  const handleRemoveLine = (idx: number) => {
    if (textGroup.segments.length <= 1) return;
    onUpdateTextGroup({
      ...textGroup,
      segments: textGroup.segments.filter((_, i) => i !== idx),
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
              badgeBgColor: !s.hasBadge ? '#0F172A' : undefined,
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
      {/* 1. Selector Libre de Tipografía */}
      <FontFamilySelector
        currentFont={currentFont}
        onSelectFont={handleFontChange}
      />

      {/* 2. Editor de Líneas Dinámicas (1 a 3) */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Líneas del Título ({textGroup.segments.length}/3)
          </label>
          <div className="flex items-center gap-1.5">
            {textGroup.segments.length > 1 && (
              <button
                type="button"
                onClick={handleInvertHierarchy}
                className="text-[10px] text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                title="Intercambiar orden de las dos primeras líneas"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>Invertir</span>
              </button>
            )}
            {textGroup.segments.length < 3 && (
              <button
                type="button"
                onClick={handleAddLine}
                className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1 cursor-pointer hover:bg-blue-100"
                title="Añadir una nueva línea al título (máximo 3)"
              >
                <Plus className="w-3 h-3" />
                <span>Línea</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {textGroup.segments.map((seg, idx) => (
            <div
              key={seg.id}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col gap-2"
            >
              {/* Header de la línea */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-700 font-mono">
                  Línea {idx + 1}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Toggle Gradiente Cenital */}
                  <button
                    type="button"
                    onClick={() => handleToggleLineGradient(idx)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                      seg.gradientColorHex
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                    title="Degradado vertical 3D"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Gradiente</span>
                  </button>

                  {/* Toggle Badge */}
                  <button
                    type="button"
                    onClick={() => handleToggleLineBadge(idx)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                      seg.hasBadge
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                    title="Cápsula oscura de contraste"
                  >
                    <Shield className="w-2.5 h-2.5" />
                    <span>Badge</span>
                  </button>

                  {/* Botón eliminar línea */}
                  {textGroup.segments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                      title="Eliminar esta línea"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Input de texto */}
              <input
                type="text"
                value={seg.text}
                onChange={(e) => {
                  const newText = e.target.value;
                  onUpdateTextGroup({
                    ...textGroup,
                    segments: textGroup.segments.map((s, i) =>
                      i === idx ? { ...s, text: newText } : s
                    ),
                  });
                }}
                className="w-full px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500"
              />

              {/* Controles de color y tamaño independiente */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 items-center">
                {/* Selector de Color y Gradiente */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-500 font-medium">Color:</span>
                  <input
                    type="color"
                    value={seg.colorHex}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      onUpdateTextGroup({
                        ...textGroup,
                        segments: textGroup.segments.map((s, i) =>
                          i === idx ? { ...s, colorHex: newColor } : s
                        ),
                      });
                    }}
                    className="w-5 h-5 rounded border border-slate-300 p-0 cursor-pointer shrink-0"
                    title="Color principal o superior"
                  />
                  {seg.gradientColorHex && (
                    <>
                      <span className="text-[9px] text-slate-400">→</span>
                      <input
                        type="color"
                        value={seg.gradientColorHex}
                        onChange={(e) => {
                          const newGrad = e.target.value;
                          onUpdateTextGroup({
                            ...textGroup,
                            segments: textGroup.segments.map((s, i) =>
                              i === idx ? { ...s, gradientColorHex: newGrad } : s
                            ),
                          });
                        }}
                        className="w-5 h-5 rounded border border-slate-300 p-0 cursor-pointer shrink-0"
                        title="Color inferior del degradado"
                      />
                    </>
                  )}
                </div>

                {/* Slider de Tamaño (fontSize) independiente */}
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-[9px] text-slate-500 font-medium">Tamaño:</span>
                  <input
                    type="range"
                    min={28}
                    max={120}
                    value={seg.fontSize}
                    onChange={(e) => {
                      const size = Number(e.target.value);
                      onUpdateTextGroup({
                        ...textGroup,
                        segments: textGroup.segments.map((s, i) =>
                          i === idx ? { ...s, fontSize: size } : s
                        ),
                      });
                    }}
                    className="w-16 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-[9px] font-mono font-bold text-slate-700 w-6 text-right">
                    {seg.fontSize}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Sliders de Ajuste Fino */}
      <FineTuningSliders
        strokeWidth={primarySegment?.strokeWidth || 14}
        onStrokeChange={(val) => {
          onUpdateTextGroup({
            ...textGroup,
            segments: textGroup.segments.map((s) => ({ ...s, strokeWidth: val })),
          });
        }}
        shadowDepth={primarySegment?.shadowDepth || 6}
        onShadowChange={(val) => {
          onUpdateTextGroup({
            ...textGroup,
            segments: textGroup.segments.map((s) => ({ ...s, shadowDepth: val })),
          });
        }}
        slant={primarySegment?.slant || 0}
        onSlantChange={(val) => {
          onUpdateTextGroup({
            ...textGroup,
            rotation: val,
            segments: textGroup.segments.map((s) => ({ ...s, slant: val })),
          });
        }}
      />

      {/* 4. Score TRI Dinámico */}
      {(() => {
        const tri = ReadabilityCalculator.calculate(textGroup);
        const isOptimal = tri.level === 'optimal';
        const isAcceptable = tri.level === 'acceptable';

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
                <span
                  className={`text-[9px] font-bold uppercase tracking-wide block ${
                    isOptimal
                      ? 'text-emerald-700'
                      : isAcceptable
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  Legibilidad en Móvil (TRI)
                </span>
                <span className="text-xs font-bold">
                  Score: {tri.score} / 100 • {tri.label}
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
          </div>
        );
      })()}
    </div>
  );
};
