import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TelemetryBar } from './TelemetryBar';
import { CompositeTextGroup } from '@/types';
import { CanvasEngine } from '@/core/canvas/CanvasEngine';
import { Transform2D, HandleType, Point2D } from '@/core/canvas/Transform2D';
import { YouTubeSafeZoneGuard } from '@/core/safezones/YouTubeSafeZone';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface CanvasStageProps {
  baseImageUrl: string | null;
  textGroup: CompositeTextGroup | null;
  onUpdateTextGroup: (group: CompositeTextGroup) => void;
  safeZonesVisible: boolean;
  ruleOfThirdsVisible?: boolean;
  onRegisterCanvasExporter?: (exporter: () => string) => void;
}

type InteractionMode = 'IDLE' | 'DRAGGING' | 'SCALING' | 'ROTATING';

export const CanvasStage: React.FC<CanvasStageProps> = ({
  baseImageUrl,
  textGroup,
  onUpdateTextGroup,
  safeZonesVisible,
  ruleOfThirdsVisible = false,
  onRegisterCanvasExporter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  const [hasCollision, setHasCollision] = useState(false);
  const [activeCursor, setActiveCursor] = useState('default');
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Telemetría local desacoplada del render loop de React
  const [telemetry, setTelemetry] = useState<{ x: number; y: number; scale: number; rotation: number }>({
    x: textGroup?.x || 0,
    y: textGroup?.y || 0,
    scale: textGroup?.scale || 1,
    rotation: textGroup?.rotation || 0,
  });

  // Estado de interacción matemática continua
  const interactionRef = useRef<{
    mode: InteractionMode;
    handle: HandleType;
    startPoint: Point2D;
    startAngle: number;
    initialGroup: CompositeTextGroup | null;
    currentGroup: CompositeTextGroup | null;
    centerPoint: Point2D;
  }>({
    mode: 'IDLE',
    handle: 'NONE',
    startPoint: { x: 0, y: 0 },
    startAngle: 0,
    initialGroup: null,
    currentGroup: null,
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

      // Si ya hay una imagen base montada, restaurarla inmediatamente
      if (baseImageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = baseImageUrl;
        img.onload = () => {
          engine.setBaseImage(img);
        };
      }

      if (textGroup) {
        engine.setTextGroup(textGroup);
      }
    }
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []); // Montaje único, desacoplado de props dinámicas

  // Cargar imagen de fondo
  useEffect(() => {
    if (!engineRef.current || !baseImageUrl) return;
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

    if (textGroup) {
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
      setHasCollision(collision);
    }
  }, [textGroup]);

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
    if (!textGroup || !canvasRef.current || !engineRef.current) return;
    const point = getCanvasCoordinates(e);

    // Obtener el BoundingBox real medido por CanvasEngine
    const box = engineRef.current.getBoundingBox();
    if (!box) return;

    const handle = Transform2D.hitTest(point, box, 20);

    if (handle === 'NONE') {
      engineRef.current.setSelected(false);
      return;
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

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const startAngle = Math.atan2(point.y - centerY, point.x - centerX);

    // Ancho y alto base desenrollados de la escala activa
    const baseW = box.width / textGroup.scale;
    const baseH = box.height / textGroup.scale;

    interactionRef.current = {
      mode,
      handle,
      startPoint: point,
      startAngle,
      initialGroup: {
        ...textGroup,
        width: baseW,
        height: baseH,
      },
      currentGroup: {
        ...textGroup,
        width: baseW,
        height: baseH,
      },
      centerPoint: { x: centerX, y: centerY },
    };
  };

  // MOUSE MOVE: Actualizar posición a 60-120 FPS sin disparar re-renders de React
  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getCanvasCoordinates(e);
    const { mode, startPoint, startAngle, initialGroup, centerPoint } = interactionRef.current;

    // Si está inactivo, actualizar cursor según tirador real
    if (mode === 'IDLE' && textGroup && engineRef.current) {
      const box = engineRef.current.getBoundingBox();
      if (box) {
        const hoveredHandle = Transform2D.hitTest(point, box, 18);
        setActiveCursor(Transform2D.getCursor(hoveredHandle));
      }
      return;
    }

    if (!initialGroup) return;

    let updated: CompositeTextGroup = { ...initialGroup };

    // 1. MODO ARRASTRE
    if (mode === 'DRAGGING') {
      const dx = point.x - startPoint.x;
      const dy = point.y - startPoint.y;

      updated = {
        ...initialGroup,
        x: Math.round(initialGroup.x + dx),
        y: Math.round(initialGroup.y + dy),
      };
    }

    // 2. MODO ROTACIÓN
    else if (mode === 'ROTATING') {
      const currentAngle = Math.atan2(point.y - centerPoint.y, point.x - centerPoint.x);
      const deltaRad = currentAngle - startAngle;
      let newDeg = Math.round(initialGroup.rotation + (deltaRad * 180) / Math.PI);

      while (newDeg > 180) newDeg -= 360;
      while (newDeg < -180) newDeg += 360;

      if (Math.abs(newDeg) <= 1.8) newDeg = 0;
      else if (Math.abs(newDeg - -5) <= 1.5) newDeg = -5;
      else if (Math.abs(newDeg - 5) <= 1.5) newDeg = 5;

      updated = {
        ...initialGroup,
        rotation: newDeg,
      };
    }

    // 3. MODO ESCALADO (con compensación de pivote central para evitar saltos)
    else if (mode === 'SCALING') {
      const initialDist = Math.hypot(startPoint.x - centerPoint.x, startPoint.y - centerPoint.y);
      const currentDist = Math.hypot(point.x - centerPoint.x, point.y - centerPoint.y);

      if (initialDist > 0) {
        const factor = currentDist / initialDist;
        const newScale = Math.max(0.3, Math.min(3.5, initialGroup.scale * factor));

        const newW = initialGroup.width * newScale;
        const newH = initialGroup.height * newScale;

        updated = {
          ...initialGroup,
          x: Math.round(centerPoint.x - newW / 2),
          y: Math.round(centerPoint.y - newH / 2),
          scale: Number(newScale.toFixed(2)),
        };
      }
    }

    // Actualizar en el Canvas nativo directamente (CERO lag en React)
    interactionRef.current.currentGroup = updated;
    engineRef.current?.updateTextGroupSilent(updated);

    // Actualizar telemetría visual ligera
    setTelemetry({
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
    setHasCollision(collision);
  };

  // MOUSE UP: Comitear estado a React una sola vez al terminar el gesto
  const handleMouseUp = () => {
    const { mode, currentGroup } = interactionRef.current;

    if (mode !== 'IDLE' && currentGroup) {
      let finalGroup = { ...currentGroup };

      // Si fue arrastre, verificar y aplicar snap-back de YouTube Safe Zone
      if (mode === 'DRAGGING') {
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

      // Comitear a React solo al soltar el ratón
      onUpdateTextGroup(finalGroup);
    }

    interactionRef.current.mode = 'IDLE';
    interactionRef.current.handle = 'NONE';
    interactionRef.current.currentGroup = null;
  };

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
            <div className="border-r border-blue-400/40 border-dashed"></div>
            <div className="border-r border-blue-400/40 border-dashed"></div>
            <div></div>
          </div>
        )}

        {/* Overlay de YouTube Safe Zone (Timestamp 14:25) */}
        {safeZonesVisible && (
          <div
            className={`absolute right-4 bottom-4 w-18 h-7 bg-black/90 text-white rounded text-xs font-mono font-bold flex items-center justify-center border pointer-events-none transition-all ${
              hasCollision ? 'ring-2 ring-red-500 border-red-500 scale-105' : 'border-white/20'
            }`}
          >
            14:25
          </div>
        )}
      </div>

      {/* Barra Flotante de Zoom */}
      <div className="absolute right-4 bottom-4 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-lg p-1 shadow-md text-xs select-none">
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

      {textGroup && (
        <TelemetryBar
          x={telemetry.x}
          y={telemetry.y}
          scale={telemetry.scale}
          rotation={telemetry.rotation}
          hasCollision={hasCollision}
        />
      )}
    </div>
  );
};
