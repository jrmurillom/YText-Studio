import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TelemetryBar } from './TelemetryBar';
import { CompositeTextGroup } from '@/types';
import { CanvasEngine } from '@/core/canvas/CanvasEngine';
import { Transform2D, HandleType, Point2D, BoundingBox2D } from '@/core/canvas/Transform2D';
import { YouTubeSafeZoneGuard } from '@/core/safezones/YouTubeSafeZone';

interface CanvasStageProps {
  baseImageUrl: string | null;
  textGroup: CompositeTextGroup | null;
  onUpdateTextGroup: (group: CompositeTextGroup) => void;
  safeZonesVisible: boolean;
}

type InteractionMode = 'IDLE' | 'DRAGGING' | 'SCALING' | 'ROTATING';

export const CanvasStage: React.FC<CanvasStageProps> = ({
  baseImageUrl,
  textGroup,
  onUpdateTextGroup,
  safeZonesVisible,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  const [hasCollision, setHasCollision] = useState(false);
  const [activeCursor, setActiveCursor] = useState('default');

  // Estado de interacción matemática continua
  const interactionRef = useRef<{
    mode: InteractionMode;
    handle: HandleType;
    startPoint: Point2D;
    startAngle: number;
    initialGroup: CompositeTextGroup | null;
    centerPoint: Point2D;
  }>({
    mode: 'IDLE',
    handle: 'NONE',
    startPoint: { x: 0, y: 0 },
    startAngle: 0,
    initialGroup: null,
    centerPoint: { x: 0, y: 0 },
  });

  // Inicializar CanvasEngine nativo
  useEffect(() => {
    if (canvasRef.current) {
      engineRef.current = new CanvasEngine(canvasRef.current);
    }
    return () => {
      engineRef.current?.destroy();
    };
  }, []);

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

  // Sincronizar textGroup con CanvasEngine y calcular colisión con YouTube
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setTextGroup(textGroup);

    if (textGroup) {
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
    if (!textGroup || !canvasRef.current) return;
    const point = getCanvasCoordinates(e);

    const box: BoundingBox2D = {
      x: textGroup.x,
      y: textGroup.y,
      width: textGroup.width * textGroup.scale,
      height: textGroup.height * textGroup.scale,
      rotation: textGroup.rotation,
    };

    const handle = Transform2D.hitTest(point, box, 18);

    if (handle === 'NONE') {
      engineRef.current?.setSelected(false);
      return;
    }

    engineRef.current?.setSelected(true);

    let mode: InteractionMode = 'IDLE';
    if (handle === 'ROT') {
      mode = 'ROTATING';
    } else if (handle === 'BODY') {
      mode = 'DRAGGING';
    } else {
      mode = 'SCALING';
    }

    const centerX = textGroup.x + (textGroup.width * textGroup.scale) / 2;
    const centerY = textGroup.y + (textGroup.height * textGroup.scale) / 2;
    const startAngle = Math.atan2(point.y - centerY, point.x - centerX);

    interactionRef.current = {
      mode,
      handle,
      startPoint: point,
      startAngle,
      initialGroup: { ...textGroup },
      centerPoint: { x: centerX, y: centerY },
    };
  };

  // MOUSE MOVE: Actualizar posición, escala o ángulo a 60 FPS
  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getCanvasCoordinates(e);
    const { mode, startPoint, startAngle, initialGroup, centerPoint } = interactionRef.current;

    // Si está inactivo, actualizar el cursor según el tirador bajo el cursor
    if (mode === 'IDLE' && textGroup) {
      const box: BoundingBox2D = {
        x: textGroup.x,
        y: textGroup.y,
        width: textGroup.width * textGroup.scale,
        height: textGroup.height * textGroup.scale,
        rotation: textGroup.rotation,
      };
      const hoveredHandle = Transform2D.hitTest(point, box, 16);
      setActiveCursor(Transform2D.getCursor(hoveredHandle));
      return;
    }

    if (!initialGroup || !textGroup) return;

    // 1. MODO ARRASTRE SUAVE (DRAGGING)
    if (mode === 'DRAGGING') {
      const dx = point.x - startPoint.x;
      const dy = point.y - startPoint.y;

      const newX = Math.round(initialGroup.x + dx);
      const newY = Math.round(initialGroup.y + dy);

      onUpdateTextGroup({
        ...initialGroup,
        x: newX,
        y: newY,
      });
    }

    // 2. MODO ROTACIÓN CONTINUA CON SNAP SUAVE (ROTATING)
    else if (mode === 'ROTATING') {
      const currentAngle = Math.atan2(point.y - centerPoint.y, point.x - centerPoint.x);
      const deltaRad = currentAngle - startAngle;
      let newDeg = Math.round(initialGroup.rotation + (deltaRad * 180) / Math.PI);

      // Normalizar dentro de [-180, 180]
      while (newDeg > 180) newDeg -= 360;
      while (newDeg < -180) newDeg += 360;

      // Snap suave y agradable (sin saltos bruscos)
      if (Math.abs(newDeg) <= 1.8) newDeg = 0;
      else if (Math.abs(newDeg - -5) <= 1.5) newDeg = -5;
      else if (Math.abs(newDeg - 5) <= 1.5) newDeg = 5;

      onUpdateTextGroup({
        ...initialGroup,
        rotation: newDeg,
      });
    }

    // 3. MODO ESCALADO PROPORCIONAL SUAVE (SCALING)
    else if (mode === 'SCALING') {
      const initialDist = Math.hypot(startPoint.x - centerPoint.x, startPoint.y - centerPoint.y);
      const currentDist = Math.hypot(point.x - centerPoint.x, point.y - centerPoint.y);

      if (initialDist > 0) {
        const factor = currentDist / initialDist;
        const newScale = Math.max(0.3, Math.min(3.5, initialGroup.scale * factor));

        onUpdateTextGroup({
          ...initialGroup,
          scale: Number(newScale.toFixed(2)),
        });
      }
    }
  };

  // MOUSE UP: Finalizar interacción
  const handleMouseUp = () => {
    interactionRef.current.mode = 'IDLE';
    interactionRef.current.handle = 'NONE';
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
        className="relative w-full max-w-[768px] aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-300 flex items-center justify-center"
        style={{ cursor: activeCursor }}
        onMouseDown={handleMouseDown}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pointer-events-auto"
        />

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

      <TelemetryBar
        x={textGroup?.x || 0}
        y={textGroup?.y || 0}
        scale={textGroup?.scale || 1}
        rotation={textGroup?.rotation || 0}
        hasCollision={hasCollision}
      />
    </div>
  );
};
