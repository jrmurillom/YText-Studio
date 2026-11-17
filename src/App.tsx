import { useState, useRef, useCallback } from 'react';
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
} from '@/types';
import { ImagePreprocessor } from '@/core/image/ImagePreprocessor';
import { VisionAnalysisPipeline } from '@/core/lmm/VisionAnalysisPipeline';

export function App() {
  // 1. Estado de Configuración LMM
  const [lmmConfig, setLmmConfig] = useState<LMMConfig>(() => {
    const saved = localStorage.getItem('ytext_lmm_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-2.0-flash',
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

  // 5. Estado del Grupo de Texto Activo en Canvas (Inicia null: Canvas 100% limpio)
  const [textGroup, setTextGroup] = useState<CompositeTextGroup | null>(null);
  const cleanCanvasExporterRef = useRef<(() => string) | null>(null);

  const handleRegisterCanvasExporter = useCallback((exporter: () => string) => {
    cleanCanvasExporterRef.current = exporter;
  }, []);

  // Manejo de carga de imagen
  const handleImageSelected = (file: File) => {
    // Limpieza de estado previo para evitar confusión de contexto entre imágenes
    setProposals([]);
    setSelectedProposalId(null);
    setLmmTelemetry(null);
    setAnalysisError(undefined);
    setTextGroup(null); // Canvas permanece 100% limpio con solo la imagen de fondo
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
    setIsAnalyzing(true);
    setLmmTelemetry(null); // Reset inmediato de logs previos
    setAnalysisError(undefined);

    try {
      // 1. Compresión instantánea en cliente a WebP 640px (<50KB)
      const compressed = await ImagePreprocessor.compressForLMM(baseImage.dataUrl);

      // 2. Ejecutar análisis semántico con el LMM (o fallback local)
      const result = await VisionAnalysisPipeline.execute(
        compressed.base64Data,
        rawText,
        selectedIntent,
        lmmConfig,
        customIntentText,
        true // bypassCache: fuerza llamada fresca al modelo al hacer clic explícito
      );

      setProposals(result.proposals);
      setIsOfflineFallback(result.isOfflineFallback);
      setAnalysisError(result.errorMessage);
      setLmmTelemetry(result.telemetry);

      if (result.proposals.length > 0) {
        const first = result.proposals[0];
        setSelectedProposalId(first.id);
        setTextGroup(first.previewGroup);
        // Sincronizar texto de la propuesta al campo base
        const joined = first.previewGroup.segments?.map((s) => s.text).filter(Boolean).join(' ');
        if (joined) setRawText(joined);
      }
    } catch (err) {
      console.error('Error durante el análisis de portada:', err);
      setAnalysisError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectProposal = (proposal: ProposalCard) => {
    setSelectedProposalId(proposal.id);
    setTextGroup(proposal.previewGroup);
    // Sincronizar el texto de la propuesta seleccionada al input para evitar desfases
    const joinedText = proposal.previewGroup.segments
      ?.map((s) => s.text)
      .filter(Boolean)
      .join(' ');
    if (joinedText) {
      setRawText(joinedText);
    } else if (proposal.copySummary) {
      setRawText(proposal.copySummary);
    }
  };

  const handleUpdateTextGroup = (updated: CompositeTextGroup) => {
    setTextGroup(updated);
    const joined = updated.segments?.map((s) => s.text).filter(Boolean).join(' ');
    if (joined && joined !== rawText) {
      setRawText(joined);
    }
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const hasApiKey = Boolean(lmmConfig.apiKey && lmmConfig.apiKey.trim().length > 0);

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
        hasApiKey={hasApiKey}
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
            proposals={proposals}
            selectedProposalId={selectedProposalId}
            onSelectProposal={handleSelectProposal}
            hasApiKey={hasApiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
            errorMessage={analysisError}
            telemetry={lmmTelemetry}
          />
        }
        centerStage={
          <CanvasStage
            baseImageUrl={baseImage.dataUrl}
            textGroup={textGroup}
            onUpdateTextGroup={handleUpdateTextGroup}
            safeZonesVisible={safeZonesVisible}
            ruleOfThirdsVisible={ruleOfThirdsVisible}
            onRegisterCanvasExporter={handleRegisterCanvasExporter}
          />
        }
        rightPanel={
          <InspectorPanel
            textGroup={textGroup}
            onUpdateTextGroup={handleUpdateTextGroup}
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
        canvasDataUrl={cleanCanvasExporterRef.current ? cleanCanvasExporterRef.current() : baseImage.dataUrl}
        videoTitle={rawText}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        bgImage={baseImage.dataUrl}
        textGroup={textGroup}
        canvasPreviewUrl={cleanCanvasExporterRef.current ? cleanCanvasExporterRef.current() : baseImage.dataUrl}
        videoTitle={rawText}
      />
    </div>
  );
}
