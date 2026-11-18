import { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { StudioShell } from '@/components/layout/StudioShell';
import { IngestionPanel } from '@/components/left-panel/IngestionPanel';
import { CanvasStage } from '@/components/center-stage/CanvasStage';
import { InspectorPanel } from '@/components/right-panel/InspectorPanel';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { FeedSimulatorModal } from '@/components/modals/FeedSimulatorModal';
import { ExportModal } from '@/components/modals/ExportModal';
import {
  IntentType,
  ProposalCard,
  CompositeTextGroup,
  BaseImageState,
  LMMConfig,
  LMMTelemetry,
  GraphicAssetElement,
  ActiveCanvasElement,
} from '@/types';
import { ImagePreprocessor } from '@/core/image/ImagePreprocessor';
import { VisionAnalysisPipeline } from '@/core/lmm/VisionAnalysisPipeline';
import { useHistory } from '@/hooks/useHistory';

export function App() {
  // 1. Estado de Configuración LMM
  const [lmmConfig, setLmmConfig] = useState<LMMConfig>(() => {
    const saved = localStorage.getItem('ytext_lmm_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned: LMMConfig = {
          provider: parsed.provider || 'gemini',
          apiKey: parsed.apiKey || '',
          model: parsed.model || 'gemini-2.0-flash',
          proposalCount: parsed.proposalCount || 3,
          customEndpoint: parsed.customEndpoint,
        };
        localStorage.setItem('ytext_lmm_config', JSON.stringify(cleaned));
        return cleaned;
      } catch {
        // fallback
      }
    }
    return {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-2.0-flash',
      proposalCount: 3,
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [safeZonesVisible, setSafeZonesVisible] = useState(true);
  const [ruleOfThirdsVisible, setRuleOfThirdsVisible] = useState(false);

  // 2. Estado de Imagen Base
  const [baseImage, setBaseImage] = useState<BaseImageState>({
    file: null,
    dataUrl: null,
    width: 1280,
    height: 720,
    isLoaded: false,
  });

  // 3. Estado de Texto e Intención (Inicia 100% limpio sin sesgos ni dummy text)
  const [rawText, setRawText] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<IntentType>('hype');
  const [customIntentText, setCustomIntentText] = useState('');

  // 4. Estado de Propuestas e IA
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [proposals, setProposals] = useState<ProposalCard[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | undefined>();
  const [lmmTelemetry, setLmmTelemetry] = useState<LMMTelemetry | null>(null);
  const [, setIsOfflineFallback] = useState(false);

  // 5 & 6. Historial Unificado (Undo/Redo) para TextGroup y Capas de Assets Gráficos
  const {
    state: canvasState,
    set: setCanvasState,
    undo,
    redo,
    reset: resetCanvasHistory,
    canUndo,
    canRedo,
  } = useHistory<{
    textGroup: CompositeTextGroup | null;
    graphicAssets: GraphicAssetElement[];
  }>({
    textGroup: null,
    graphicAssets: [],
  });

  const { textGroup, graphicAssets } = canvasState;
  const [activeElement, setActiveElement] = useState<ActiveCanvasElement>({ type: 'text' });
  const cleanCanvasExporterRef = useRef<(() => string) | null>(null);
  const analysisSessionRef = useRef(0);
  const isAnyModalOpen = isSettingsOpen || isSimulatorOpen || isExportOpen;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
      if (
        e.target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
      ) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        if (canUndo) {
          e.preventDefault();
          undo();
        }
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnyModalOpen, canUndo, canRedo, undo, redo]);

  const handleRegisterCanvasExporter = useCallback((exporter: () => string) => {
    cleanCanvasExporterRef.current = exporter;
  }, []);

  const handleUpdateGraphicAssets = (assets: GraphicAssetElement[]) => {
    setCanvasState((prev) => ({
      ...prev,
      graphicAssets: assets,
    }));
  };

  const handleAddGraphicAsset = (asset: GraphicAssetElement) => {
    setCanvasState((prev) => ({
      ...prev,
      graphicAssets: [...prev.graphicAssets, asset],
    }));
    setActiveElement({ type: 'asset', id: asset.id });
  };

  const handleRemoveGraphicAsset = (id: string) => {
    setCanvasState((prev) => ({
      ...prev,
      graphicAssets: prev.graphicAssets.filter((a) => a.id !== id),
    }));
    if (activeElement?.type === 'asset' && activeElement.id === id) {
      setActiveElement(textGroup ? { type: 'text' } : null);
    }
  };

  // Manejo de carga de imagen
  const handleImageSelected = (file: File) => {
    analysisSessionRef.current += 1;
    setIsAnalyzing(false);
    // Limpieza de estado previo para evitar confusión de contexto entre imágenes
    setProposals([]);
    setSelectedProposalId(null);
    setLmmTelemetry(null);
    setAnalysisError(undefined);
    resetCanvasHistory({ textGroup: null, graphicAssets: [] });
    setActiveElement({ type: 'text' });
    VisionAnalysisPipeline.clearCache();

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setBaseImage({
          file,
          dataUrl,
          width: img.naturalWidth || 1280,
          height: img.naturalHeight || 720,
          isLoaded: true,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Pipeline Real de Visión One-Shot
  const handleAnalyze = async () => {
    if (!baseImage.dataUrl) return;
    const sessionId = ++analysisSessionRef.current;
    setIsAnalyzing(true);
    setLmmTelemetry(null); // Reset inmediato de logs previos
    setAnalysisError(undefined);

    try {
      // 1. Compresión instantánea en cliente a WebP 640px (<50KB)
      const compressed = await ImagePreprocessor.compressForLMM(baseImage.dataUrl);
      if (sessionId !== analysisSessionRef.current) return;

      // 2. Ejecutar análisis semántico con el LMM (o fallback local)
      const result = await VisionAnalysisPipeline.execute(
        compressed.base64Data,
        rawText,
        selectedIntent,
        lmmConfig,
        customIntentText,
        true // bypassCache: fuerza llamada fresca al modelo al hacer clic explícito
      );
      if (sessionId !== analysisSessionRef.current) return;

      setProposals(result.proposals);
      setIsOfflineFallback(result.isOfflineFallback);
      setAnalysisError(result.errorMessage);
      setLmmTelemetry(result.telemetry);

      if (result.proposals.length > 0) {
        const first = result.proposals[0];
        setSelectedProposalId(first.id);
        setCanvasState((prev) => ({ ...prev, textGroup: first.previewGroup }));
      }
    } catch (err) {
      if (sessionId !== analysisSessionRef.current) return;
      console.error('Error during cover analysis:', err);
      setProposals([]);
      setIsOfflineFallback(false);
      setAnalysisError(err instanceof Error ? err.message : String(err));
    } finally {
      if (sessionId === analysisSessionRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSelectProposal = (proposal: ProposalCard) => {
    setSelectedProposalId(proposal.id);
    setCanvasState((prev) => ({ ...prev, textGroup: proposal.previewGroup }));
  };

  const handleUpdateTextGroup = (updated: CompositeTextGroup) => {
    setCanvasState((prev) => ({ ...prev, textGroup: updated }));
    if (selectedProposalId) {
      setProposals((prev) =>
        prev.map((p) =>
          p.id === selectedProposalId
            ? {
                ...p,
                previewGroup: updated,
                fontFamily: updated.segments[0]?.fontFamily || p.fontFamily,
                copySummary: updated.segments.map((s) => s.text).join(' • '),
              }
            : p
        )
      );
    }
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const hasApiKey =
    lmmConfig.provider === 'ollama' ||
    Boolean(lmmConfig.apiKey && lmmConfig.apiKey.trim().length > 0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSafeZones={() => setSafeZonesVisible(!safeZonesVisible)}
        onToggleRuleOfThirds={() => setRuleOfThirdsVisible(!ruleOfThirdsVisible)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onExport={handleExport}
        safeZonesEnabled={safeZonesVisible}
        ruleOfThirdsEnabled={ruleOfThirdsVisible}
        lmmProviderName={lmmConfig.provider}
        lmmModelName={lmmConfig.model}
        hasApiKey={hasApiKey}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      <StudioShell
        leftPanel={
          <IngestionPanel
            baseImage={baseImage}
            onImageSelected={handleImageSelected}
            rawText={rawText}
            onRawTextChange={setRawText}
            selectedIntent={selectedIntent}
            onSelectIntent={setSelectedIntent}
            customIntentText={customIntentText}
            onCustomIntentTextChange={setCustomIntentText}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            proposalCount={lmmConfig.proposalCount || 3}
            proposals={proposals}
            selectedProposalId={selectedProposalId}
            onSelectProposal={handleSelectProposal}
            hasApiKey={hasApiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
            errorMessage={analysisError}
            telemetry={lmmTelemetry}
            graphicAssets={graphicAssets}
            onAddGraphicAsset={handleAddGraphicAsset}
            onRemoveGraphicAsset={handleRemoveGraphicAsset}
            activeElement={activeElement}
            onSelectActiveElement={setActiveElement}
          />
        }
        centerStage={
          <CanvasStage
            baseImageUrl={baseImage.dataUrl}
            textGroup={textGroup}
            onUpdateTextGroup={handleUpdateTextGroup}
            graphicAssets={graphicAssets}
            onUpdateGraphicAssets={handleUpdateGraphicAssets}
            activeElement={activeElement}
            onSelectActiveElement={setActiveElement}
            safeZonesVisible={safeZonesVisible}
            ruleOfThirdsVisible={ruleOfThirdsVisible}
            isModalOpen={isAnyModalOpen}
            onRegisterCanvasExporter={handleRegisterCanvasExporter}
          />
        }
        rightPanel={
          <InspectorPanel
            textGroup={textGroup}
            onUpdateTextGroup={handleUpdateTextGroup}
            graphicAssets={graphicAssets}
            onUpdateGraphicAssets={handleUpdateGraphicAssets}
            activeElement={activeElement}
            onSelectActiveElement={setActiveElement}
          />
        }
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={lmmConfig}
        onSaveConfig={(cfg) => {
          setLmmConfig(cfg);
          localStorage.setItem('ytext_lmm_config', JSON.stringify(cfg));
        }}
      />

      <FeedSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        canvasDataUrl={
          isSimulatorOpen
            ? cleanCanvasExporterRef.current
              ? cleanCanvasExporterRef.current()
              : baseImage.dataUrl
            : null
        }
        videoTitle={rawText}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        bgImage={baseImage.dataUrl}
        textGroup={textGroup}
        graphicAssets={graphicAssets}
        canvasPreviewUrl={
          isExportOpen
            ? cleanCanvasExporterRef.current
              ? cleanCanvasExporterRef.current()
              : baseImage.dataUrl
            : null
        }
        videoTitle={rawText}
      />
    </div>
  );
}
