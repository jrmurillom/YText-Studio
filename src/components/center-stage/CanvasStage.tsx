import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TelemetryBar } from './TelemetryBar';
import { CompositeTextGroup, GraphicAssetElement, ActiveCanvasElement } from '@/types';
import { CanvasEngine } from '@/core/canvas/CanvasEngine';
import { Transform2D, HandleType, Point2D, BoundingBox2D } from '@/core/canvas/Transform2D';
import { YouTubeSafeZoneGuard } from '@/core/safezones/YouTubeSafeZone';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface CanvasStageProps {
  baseImageUrl: string | null;
  textGroup: CompositeTextGroup | null;
  onUpdateTextGroup: (group: CompositeTextGroup) => void;
  graphicAssets?: GraphicAssetElement[];
  onUpdateGraphicAssets?: (assets: GraphicAssetElement[]) => void;
  activeElement?: ActiveCanvasElement;
  onSelectActiveElement?: (elem: ActiveCanvasElement) => void;
  safeZonesVisible: boolean;
  ruleOfThirdsVisible?: boolean;
  isModalOpen?: boolean;
  onRegisterCanvasExporter?: (exporter: () => string) => void;
}

type InteractionMode = 'IDLE' | 'DRAGGING' | 'SCALING' | 'ROTATING';

export const CanvasStage: React.FC<CanvasStageProps> = ({
  baseImageUrl,
  textGroup,
  onUpdateTextGroup,
  graphicAssets = [],
  onUpdateGraphicAssets,
  activeElement = { type: 'text' },
  onSelectActiveElement,
  safeZonesVisible,
  ruleOfThirdsVisible = false,
  isModalOpen = false,
  onRegisterCanvasExporter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  const [hasCollision, setHasCollision] = useState(false);
  const [activeCursor, setActiveCursor] = useState('default');
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const activeCursorRef = useRef('default');
  const hasCollisionRef = useRef(false);
  const telemetryRafRef = useRef<number | null>(null);
  const pendingTelemetryRef = useRef<{ x: number; y: number; scale: number; rotation: number } | null>(null);

  // Telemetría local desacoplada del render loop de React
  const [telemetry, setTelemetry] = useState<{ x: number; y: number; scale: number; rotation: number }>({
    x: textGroup?.x || 0,
    y: textGroup?.y || 0,
    scale: textGroup?.scale || 1,
    rotation: textGroup?.rotation || 0,
  });

  const scheduleTelemetryUpdate = useCallback(
    (next: { x: number; y: number; scale: number; rotation: number }) => {
      pendingTelemetryRef.current = next;
      if (telemetryRafRef.current === null) {
        telemetryRafRef.current = requestAnimationFrame(() => {
          telemetryRafRef.current = null;
          if (pendingTelemetryRef.current) {
            setTelemetry(pendingTelemetryRef.current);
          }
        });
      }
    },
    []
  );

  // Estado de interacción matemática continua
  const interactionRef = useRef<{
    mode: InteractionMode;
    handle: HandleType;
    targetType: 'text' | 'asset';
    assetId?: string;
    startPoint: Point2D;
    startAngle: number;
    initialBox: BoundingBox2D | null;
    initialGroup: CompositeTextGroup | null;
    currentGroup: CompositeTextGroup | null;
    initialAsset: GraphicAssetElement | null;
    currentAsset: GraphicAssetElement | null;
    centerPoint: Point2D;
  }>({
    mode: 'IDLE',
    handle: 'NONE',
    targetType: 'text',
    startPoint: { x: 0, y: 0 },
    startAngle: 0,
    initialBox: null,
    initialGroup: null,
    currentGroup: null,
    initialAsset: null,
    currentAsset: null,
    centerPoint: { x: 0, y: 0 },
  });

  const onRegisterCanvasExporterRef = useRef(onRegisterCanvasExporter);
  useEffect(() => {
    onRegisterCanvasExporterRef.current = onRegisterCanvasExporter;
  }, [onRegisterCanvasExporter]);

  // Inicializar CanvasEngine nativo una sola vez en el ciclo de vida del canvas
  useEffect(() => {
    if (canvasRef.current) {
      const engine = new CanvasEngine(canvasRef.current);
      engineRef.current = engine;

      if (onRegisterCanvasExporterRef.current) {
        onRegisterCanvasExporterRef.current(() => engine.exportCleanDataUrl());
      }

      if (textGroup) {
        engine.setTextGroup(textGroup);
      }

      engine.setGraphicAssets(graphicAssets);
      engine.setActiveElement(activeElement);
    }
    return () => {
      if (telemetryRafRef.current !== null) {
        cancelAnimationFrame(telemetryRafRef.current);
        telemetryRafRef.current = null;
      }
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  // Cargar imagen de fondo (único punto de carga en montaje y cambio de URL)
  useEffect(() => {
    if (!engineRef.current) return;
    if (!baseImageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = baseImageUrl;
    img.onload = () => {
      engineRef.current?.setBaseImage(img);
    };
  }, [baseImageUrl]);

  // Sincronizar textGroup con CanvasEngine
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setTextGroup(textGroup);

    if (activeElement?.type === 'text' && textGroup) {
      setTelemetry({
        x: textGroup.x,
        y: textGroup.y,
        scale: textGroup.scale,
        rotation: textGroup.rotation,
      });

      const collision = YouTubeSafeZoneGuard.checkCollision({
        x: textGroup.x,
        y: textGroup.y,
        width: textGroup.width * textGroup.scale,
        height: textGroup.height * textGroup.scale,
      });
      hasCollisionRef.current = collision;
      setHasCollision(collision);
    }
  }, [textGroup, activeElement]);

  // Sincronizar graphicAssets con CanvasEngine
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setGraphicAssets(graphicAssets);

    if (activeElement?.type === 'asset') {
      const currentAsset = graphicAssets.find((a) => a.id === activeElement.id);
      if (currentAsset) {
        setTelemetry({
          x: currentAsset.x,
          y: currentAsset.y,
          scale: currentAsset.scale,
          rotation: currentAsset.rotation,
        });
      }
    }
  }, [graphicAssets, activeElement]);

  // Sincronizar activeElement con CanvasEngine
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setActiveElement(activeElement);
  }, [activeElement]);

  // Listener para eliminar asset seleccionado con tecla Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) return;
      if (
        e.target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)
      ) {
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeElement?.type === 'asset') {
        e.preventDefault();
        const updated = graphicAssets.filter((a) => a.id !== activeElement.id);
        onUpdateGraphicAssets?.(updated);
        onSelectActiveElement?.(textGroup ? { type: 'text' } : null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, activeElement, graphicAssets, onUpdateGraphicAssets, onSelectActiveElement, textGroup]);

  // Conversión de coordenadas de pantalla a espacio Canvas Master (1280x720)
  const getCanvasCoordinates = useCallback((e: React.MouseEvent): Point2D => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CanvasEngine.MASTER_WIDTH / rect.width;
    const scaleY = CanvasEngine.MASTER_HEIGHT / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // MOUSE DOWN: Iniciar arrastre, escalado o rotación
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current || !engineRef.current) return;
    const point = getCanvasCoordinates(e);

    // 1. Probar tiradores del elemento actualmente activo
    const activeBox = engineRef.current.getActiveBoundingBox();
    let handle: HandleType = 'NONE';
    if (activeBox) {
      handle = Transform2D.hitTest(point, activeBox, 20);
    }

    let targetType: 'text' | 'asset' = activeElement?.type === 'asset' ? 'asset' : 'text';
    let targetAssetId: string | undefined = activeElement?.type === 'asset' ? activeElement.id : undefined;

    // 2. Si no se clickeó un tirador del elemento activo, hacer hit test sobre otros elementos
    if (handle === 'NONE') {
      let hitFound = false;

      // Hit-test sobre assets gráficos (de mayor zIndex a menor)
      const sortedAssets = [...graphicAssets].sort((a, b) => b.zIndex - a.zIndex);
      for (const asset of sortedAssets) {
        const aBox = engineRef.current.getAssetBoundingBox(asset.id);
        if (aBox && Transform2D.hitTest(point, aBox, 0) === 'BODY') {
          targetType = 'asset';
          targetAssetId = asset.id;
          handle = 'BODY';
          hitFound = true;
          onSelectActiveElement?.({ type: 'asset', id: asset.id });
          break;
        }
      }

      // Si no fue un asset, probar sobre texto
      if (!hitFound && textGroup) {
        const tBox = engineRef.current.getTextBoundingBox();
        if (tBox && Transform2D.hitTest(point, tBox, 0) === 'BODY') {
          targetType = 'text';
          targetAssetId = undefined;
          handle = 'BODY';
          hitFound = true;
          onSelectActiveElement?.({ type: 'text' });
        }
      }

      // Si se hizo clic en el fondo vacío
      if (!hitFound) {
        engineRef.current.setSelected(false);
        onSelectActiveElement?.(null);
        return;
      }
    }

    engineRef.current.setSelected(true);

    let mode: InteractionMode = 'IDLE';
    if (handle === 'ROT') {
      mode = 'ROTATING';
    } else if (handle === 'BODY') {
      mode = 'DRAGGING';
    } else {
      mode = 'SCALING';
    }

    if (targetType === 'text' && textGroup) {
      const box = engineRef.current.getTextBoundingBox();
      if (!box) return;
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      const startAngle = Math.atan2(point.y - centerY, point.x - centerX);
      const baseW = box.width / textGroup.scale;
      const baseH = box.height / textGroup.scale;

      interactionRef.current = {
        mode,
        handle,
        targetType: 'text',
        startPoint: point,
        startAngle,
        initialBox: box,
        initialGroup: { ...textGroup, width: baseW, height: baseH },
        currentGroup: { ...textGroup, width: baseW, height: baseH },
        initialAsset: null,
        currentAsset: null,
        centerPoint: { x: centerX, y: centerY },
      };
    } else if (targetType === 'asset' && targetAssetId) {
      const asset = graphicAssets.find((a) => a.id === targetAssetId);
      const box = engineRef.current.getAssetBoundingBox(targetAssetId);
      if (!asset || !box) return;
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      const startAngle = Math.atan2(point.y - centerY, point.x - centerX);

      interactionRef.current = {
        mode,
        handle,
        targetType: 'asset',
        assetId: targetAssetId,
        startPoint: point,
        startAngle,
        initialBox: box,
        initialGroup: null,
        currentGroup: null,
        initialAsset: { ...asset },
        currentAsset: { ...asset },
        centerPoint: { x: centerX, y: centerY },
      };
    }
  };

  // MOUSE MOVE: Actualizar posición a 60-120 FPS sin disparar re-renders de React
  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getCanvasCoordinates(e);
    const { mode, startPoint, startAngle, targetType, initialGroup, initialAsset, centerPoint, initialBox } =
      interactionRef.current;

    // Si está inactivo, actualizar cursor según tirador real solo cuando cambie
    if (mode === 'IDLE' && engineRef.current) {
      const box = engineRef.current.getActiveBoundingBox();
      const nextCursor = box
        ? Transform2D.getCursor(Transform2D.hitTest(point, box, 18))
        : 'default';
      if (nextCursor !== activeCursorRef.current) {
        activeCursorRef.current = nextCursor;
        setActiveCursor(nextCursor);
      }
      return;
    }

    // INTERACCIÓN SOBRE TEXTO
    if (targetType === 'text' && initialGroup) {
      let updated: CompositeTextGroup = { ...initialGroup };

      if (mode === 'DRAGGING') {
        const dx = point.x - startPoint.x;
        const dy = point.y - startPoint.y;
        updated = {
          ...initialGroup,
          x: Math.round(initialGroup.x + dx),
          y: Math.round(initialGroup.y + dy),
        };
      } else if (mode === 'ROTATING') {
        const currentAngle = Math.atan2(point.y - centerPoint.y, point.x - centerPoint.x);
        const deltaRad = currentAngle - startAngle;
        let newDeg = Math.round(initialGroup.rotation + (deltaRad * 180) / Math.PI);
        while (newDeg > 180) newDeg -= 360;
        while (newDeg < -180) newDeg += 360;
        if (Math.abs(newDeg) <= 1.8) newDeg = 0;
        updated = { ...initialGroup, rotation: newDeg };
      } else if (mode === 'SCALING') {
        const initialDist = Math.hypot(startPoint.x - centerPoint.x, startPoint.y - centerPoint.y);
        const currentDist = Math.hypot(point.x - centerPoint.x, point.y - centerPoint.y);
        if (initialDist > 10) {
          const ratio = currentDist / initialDist;
          const newScale = Math.max(0.2, Math.min(3.0, Number((initialGroup.scale * ratio).toFixed(3))));
          const newW = initialGroup.width * newScale;
          const newH = initialGroup.height * newScale;
          updated = {
            ...initialGroup,
            scale: newScale,
            x: Math.round(centerPoint.x - newW / 2),
            y: Math.round(centerPoint.y - newH / 2),
          };
        }
      }

      interactionRef.current.currentGroup = updated;
      engineRef.current?.updateTextGroupSilent(updated);

      scheduleTelemetryUpdate({
        x: updated.x,
        y: updated.y,
        scale: updated.scale,
        rotation: updated.rotation,
      });

      const collision = YouTubeSafeZoneGuard.checkCollision({
        x: updated.x,
        y: updated.y,
        width: updated.width * updated.scale,
        height: updated.height * updated.scale,
      });
      if (collision !== hasCollisionRef.current) {
        hasCollisionRef.current = collision;
        setHasCollision(collision);
      }
    }

    // INTERACCIÓN SOBRE ASSET GRÁFICO
    else if (targetType === 'asset' && initialAsset && initialBox) {
      let updated: GraphicAssetElement = { ...initialAsset };

      if (mode === 'DRAGGING') {
        const dx = point.x - startPoint.x;
        const dy = point.y - startPoint.y;
        updated = {
          ...initialAsset,
          x: Math.round(initialAsset.x + dx),
          y: Math.round(initialAsset.y + dy),
        };
      } else if (mode === 'ROTATING') {
        const currentAngle = Math.atan2(point.y - centerPoint.y, point.x - centerPoint.x);
        const deltaRad = currentAngle - startAngle;
        let newDeg = Math.round(initialAsset.rotation + (deltaRad * 180) / Math.PI);
        while (newDeg > 180) newDeg -= 360;
        while (newDeg < -180) newDeg += 360;
        if (Math.abs(newDeg) <= 1.8) newDeg = 0;
        updated = { ...initialAsset, rotation: newDeg };
      } else if (mode === 'SCALING') {
        const initialDist = Math.hypot(startPoint.x - centerPoint.x, startPoint.y - centerPoint.y);
        const currentDist = Math.hypot(point.x - centerPoint.x, point.y - centerPoint.y);
        if (initialDist > 10) {
          const ratio = currentDist / initialDist;
          const newScale = Math.max(0.1, Math.min(3.0, Number((initialAsset.scale * ratio).toFixed(3))));
          const newW = initialAsset.width * newScale;
          const newH = initialAsset.height * newScale;
          updated = {
            ...initialAsset,
            scale: newScale,
            x: Math.round(centerPoint.x - newW / 2),
            y: Math.round(centerPoint.y - newH / 2),
          };
        }
      }

      interactionRef.current.currentAsset = updated;
      engineRef.current?.updateGraphicAssetSilent(updated);

      scheduleTelemetryUpdate({
        x: updated.x,
        y: updated.y,
        scale: updated.scale,
        rotation: updated.rotation,
      });
    }
  };

  // MOUSE UP: Comitear estado a React una sola vez al terminar el gesto
  const handleMouseUp = () => {
    if (telemetryRafRef.current !== null) {
      cancelAnimationFrame(telemetryRafRef.current);
      telemetryRafRef.current = null;
    }

    const { mode, targetType, currentGroup, currentAsset, assetId } = interactionRef.current;

    if (mode !== 'IDLE') {
      if (targetType === 'text' && currentGroup) {
        let finalGroup = { ...currentGroup };
        if (mode === 'DRAGGING' || mode === 'SCALING') {
          const boxSize = {
            width: finalGroup.width * finalGroup.scale,
            height: finalGroup.height * finalGroup.scale,
          };
          const safePos = YouTubeSafeZoneGuard.applySnapBack(
            { x: finalGroup.x, y: finalGroup.y },
            boxSize
          );
          finalGroup.x = safePos.x;
          finalGroup.y = safePos.y;
        }
        onUpdateTextGroup(finalGroup);
      } else if (targetType === 'asset' && currentAsset && assetId) {
        const updated = graphicAssets.map((a) => (a.id === assetId ? currentAsset : a));
        onUpdateGraphicAssets?.(updated);
      }
    }

    interactionRef.current.mode = 'IDLE';
    interactionRef.current.handle = 'NONE';
    interactionRef.current.currentGroup = null;
    interactionRef.current.currentAsset = null;
  };

  const showTelemetry = Boolean((activeElement?.type === 'text' && textGroup) || activeElement?.type === 'asset');

  return (
    <div
      className="flex flex-col items-center justify-center relative w-full h-full select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Marco 16:9 con sombra y borde sutil */}
      <div
        className="relative w-full max-w-[768px] aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-300 flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          cursor: activeCursor,
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
        onMouseDown={handleMouseDown}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pointer-events-auto"
        />

        {/* Overlay de la Regla de Tercios (Guías 3x3) */}
        {ruleOfThirdsVisible && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
            <div className="border-r border-b border-blue-400/40 border-dashed"></div>
            <div className="border-r border-b border-blue-400/40 border-dashed"></div>
            <div className="border-b border-blue-400/40 border-dashed"></div>
            <div className="border-r border-b border-blue-400/40 border-dashed"></div>
            <div className="border-r border-b border-blue-400/40 border-dashed"></div>
            <div className="border-b border-blue-400/40 border-dashed"></div>
            <div className="border-r border-b border-blue-400/40 border-dashed"></div>
            <div className="border-r border-b border-blue-400/40 border-dashed"></div>
            <div></div>
          </div>
        )}

        {/* Overlay de YouTube Safe Zone (Timestamp 14:25) */}
        {safeZonesVisible && (
          <div
            className={`absolute right-4 bottom-4 w-18 h-7 bg-black/90 text-white rounded text-xs font-mono font-bold flex items-center justify-center border pointer-events-none transition-all z-10 ${
              hasCollision && activeElement?.type === 'text'
                ? 'ring-2 ring-red-500 border-red-500 scale-105 animate-pulse'
                : 'border-white/20'
            }`}
          >
            14:25
          </div>
        )}
      </div>

      {/* Controles de Zoom Flotantes */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-xs border border-slate-200 shadow-md rounded-lg p-1 z-20 text-xs">
        <button
          type="button"
          onClick={() => setZoomLevel((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(1))))}
          disabled={zoomLevel <= 0.5}
          className="p-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel(1.0)}
          className="px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-700 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer transition-colors"
          title="Reset zoom to 100%"
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((prev) => Math.min(2.0, Number((prev + 0.1).toFixed(1))))}
          disabled={zoomLevel >= 2.0}
          className="p-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3.5 bg-slate-200 mx-0.5"></div>
        <button
          type="button"
          onClick={() => setZoomLevel(1.0)}
          className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {showTelemetry && (
        <TelemetryBar
          x={telemetry.x}
          y={telemetry.y}
          scale={telemetry.scale}
          rotation={telemetry.rotation}
          hasCollision={hasCollision && activeElement?.type === 'text'}
        />
      )}
    </div>
  );
};
