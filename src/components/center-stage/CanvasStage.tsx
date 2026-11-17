import React, { useRef, useEffect } from 'react';
import { TelemetryBar } from './TelemetryBar';
import { CompositeTextGroup } from '@/types';
import { CanvasEngine } from '@/core/canvas/CanvasEngine';
import { YouTubeSafeZoneGuard } from '@/core/safezones/YouTubeSafeZone';

interface CanvasStageProps {
  baseImageUrl: string | null;
  textGroup: CompositeTextGroup | null;
  onUpdateTextGroup: (group: CompositeTextGroup) => void;
  safeZonesVisible: boolean;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  baseImageUrl,
  textGroup,
  onUpdateTextGroup,
  safeZonesVisible,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const [hasCollision, setHasCollision] = React.useState(false);

  // Inicializar CanvasEngine nativo
  useEffect(() => {
    if (canvasRef.current) {
      engineRef.current = new CanvasEngine(canvasRef.current);
    }
    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  // Cargar imagen base fija
  useEffect(() => {
    if (!engineRef.current || !baseImageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = baseImageUrl;
    img.onload = () => {
      engineRef.current?.setBaseImage(img);
    };
  }, [baseImageUrl]);

  // Actualizar layer de texto
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setTextGroup(textGroup);

    if (textGroup) {
      const collision = YouTubeSafeZoneGuard.checkCollision({
        x: textGroup.x,
        y: textGroup.y,
        width: textGroup.width,
        height: textGroup.height,
      });
      setHasCollision(collision);
    }
  }, [textGroup]);

  // Arrastre interactivo simple en el stage
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!textGroup) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - textGroup.x,
      y: e.clientY - textGroup.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !textGroup) return;
    const newX = Math.max(20, Math.min(1000, e.clientX - dragStartRef.current.x));
    const newY = Math.max(20, Math.min(600, e.clientY - dragStartRef.current.y));

    onUpdateTextGroup({
      ...textGroup,
      x: newX,
      y: newY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="flex flex-col items-center justify-center relative w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Marco 16:9 con sombra y borde sutil */}
      <div
        className="relative w-full max-w-[768px] aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-300 flex items-center justify-center cursor-default"
        onMouseDown={handleMouseDown}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Overlay de YouTube Safe Zone (Timestamp 14:25) */}
        {safeZonesVisible && (
          <div
            className={`absolute right-4 bottom-4 w-18 h-7 bg-black/90 text-white rounded text-xs font-mono font-bold flex items-center justify-center border transition-all ${
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
