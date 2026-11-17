import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StudioShell } from '@/components/layout/StudioShell';
import { IngestionPanel } from '@/components/left-panel/IngestionPanel';
import { CanvasStage } from '@/components/center-stage/CanvasStage';
import { InspectorPanel } from '@/components/right-panel/InspectorPanel';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { FeedSimulatorModal } from '@/components/modals/FeedSimulatorModal';
import {
  IntentType,
  TypoPresetId,
  ProposalCard,
  CompositeTextGroup,
  BaseImageState,
  LMMConfig,
} from '@/types';
import { TYPO_PRESETS } from '@/core/presets/typoPresets';

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
  const [safeZonesVisible, setSafeZonesVisible] = useState(true);

  // 2. Estado de Imagen Base
  const [baseImage, setBaseImage] = useState<BaseImageState>({
    file: null,
    dataUrl: null,
    width: 1280,
    height: 720,
    isLoaded: false,
  });

  // 3. Estado de Texto e Intención
  const [rawText, setRawText] = useState('MEJOR DISCO DE ROCK');
  const [selectedIntent, setSelectedIntent] = useState<IntentType>('hype');
  const [selectedPresetId, setSelectedPresetId] = useState<TypoPresetId>('mrbeast_pop');

  // 4. Estado de Propuestas e IA
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [proposals, setProposals] = useState<ProposalCard[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  // 5. Estado del Grupo de Texto Activo en Canvas
  const [textGroup, setTextGroup] = useState<CompositeTextGroup | null>(null);

  // Manejo de carga de imagen
  const handleImageSelected = (file: File) => {
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

        // Montar grupo inicial de texto al cargar la imagen si no existe
        if (!textGroup) {
          initDefaultTextGroup();
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const initDefaultTextGroup = () => {
    const preset = TYPO_PRESETS[selectedPresetId];
    const initialGroup: CompositeTextGroup = {
      id: 'default_group',
      x: 64,
      y: 64,
      width: 480,
      height: 180,
      rotation: preset.slant,
      scale: 1,
      segments: [
        {
          id: 'seg_1',
          text: 'MEJOR DISCO',
          role: 'anchor_secondary',
          presetId: selectedPresetId,
          fontFamily: preset.fontFamily,
          fontSize: 48,
          colorHex: '#FFFFFF',
          strokeColorHex: '#000000',
          strokeWidth: 10,
          shadowColorHex: '#000000',
          shadowDepth: 4,
          slant: preset.slant,
        },
        {
          id: 'seg_2',
          text: 'DE ROCK!',
          role: 'power_primary',
          presetId: selectedPresetId,
          fontFamily: preset.fontFamily,
          fontSize: 76,
          colorHex: preset.fillColorHex,
          strokeColorHex: preset.strokeColorHex,
          strokeWidth: preset.strokeWidth,
          shadowColorHex: preset.shadowColorHex,
          shadowDepth: preset.shadowDepth,
          slant: preset.slant,
        },
      ],
    };
    setTextGroup(initialGroup);
  };

  // Simulación del análisis y generación de propuestas
  const handleAnalyze = () => {
    if (!baseImage.dataUrl) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const propA: ProposalCard = {
        id: 'prop_a',
        title: 'Opción A: Arriba Izquierda',
        subtitle: `${selectedIntent.toUpperCase()} • Máximo Espacio Libre`,
        intent: selectedIntent,
        presetId: selectedIntent === 'horror' ? 'docu_drama' : 'mrbeast_pop',
        placement: 'TOP_LEFT',
        previewGroup: {
          id: 'group_a',
          x: 64,
          y: 48,
          width: 460,
          height: 180,
          rotation: selectedIntent === 'horror' ? 0 : -2,
          scale: 1,
          segments: [
            {
              id: 'a1',
              text: selectedIntent === 'horror' ? 'NO MIRES' : 'MEJOR DISCO',
              role: 'anchor_secondary',
              presetId: 'docu_drama',
              fontFamily: 'Anton',
              fontSize: 44,
              colorHex: '#FFFFFF',
              strokeColorHex: '#000000',
              strokeWidth: 10,
              shadowColorHex: '#000000',
              shadowDepth: 6,
              slant: 0,
            },
            {
              id: 'a2',
              text: selectedIntent === 'horror' ? 'ESTÁ AQUÍ...' : 'DE ROCK!',
              role: 'power_primary',
              presetId: selectedIntent === 'horror' ? 'docu_drama' : 'mrbeast_pop',
              fontFamily: selectedIntent === 'horror' ? 'Anton' : 'Luckiest Guy',
              fontSize: 74,
              colorHex: selectedIntent === 'horror' ? '#E50914' : '#FFE600',
              strokeColorHex: '#000000',
              strokeWidth: 16,
              shadowColorHex: '#000000',
              shadowDepth: 10,
              slant: selectedIntent === 'horror' ? 0 : -2,
            },
          ],
        },
      };

      const propB: ProposalCard = {
        id: 'prop_b',
        title: 'Opción B: Lateral Centrado',
        subtitle: 'Docu-Drama • Alto Contraste Vertical',
        intent: selectedIntent,
        presetId: 'docu_drama',
        placement: 'CENTER_LEFT',
        previewGroup: {
          id: 'group_b',
          x: 64,
          y: 220,
          width: 440,
          height: 160,
          rotation: 0,
          scale: 1,
          segments: [
            {
              id: 'b1',
              text: 'EL VEREDICTO:',
              role: 'anchor_secondary',
              presetId: 'authority_badge',
              fontFamily: 'Montserrat',
              fontSize: 38,
              colorHex: '#FFFFFF',
              strokeColorHex: '#000000',
              strokeWidth: 0,
              shadowColorHex: '#000000',
              shadowDepth: 4,
              slant: 0,
            },
            {
              id: 'b2',
              text: 'INIGUALABLE.',
              role: 'power_primary',
              presetId: 'docu_drama',
              fontFamily: 'Anton',
              fontSize: 72,
              colorHex: '#FFFFFF',
              strokeColorHex: '#000000',
              strokeWidth: 16,
              shadowColorHex: '#000000',
              shadowDepth: 12,
              slant: 0,
            },
          ],
        },
      };

      setProposals([propA, propB]);
      setSelectedProposalId(propA.id);
      setTextGroup(propA.previewGroup);
      setIsAnalyzing(false);
    }, 900);
  };

  const handleSelectProposal = (proposal: ProposalCard) => {
    setSelectedProposalId(proposal.id);
    setTextGroup(proposal.previewGroup);
    setSelectedPresetId(proposal.presetId);
  };

  const handleSelectPreset = (presetId: TypoPresetId) => {
    setSelectedPresetId(presetId);
    if (!textGroup) return;

    const preset = TYPO_PRESETS[presetId];
    setTextGroup({
      ...textGroup,
      rotation: preset.slant,
      segments: textGroup.segments.map((seg, idx) => ({
        ...seg,
        presetId,
        fontFamily: preset.fontFamily,
        colorHex: idx === 1 ? preset.fillColorHex : '#FFFFFF',
        strokeColorHex: preset.strokeColorHex,
        strokeWidth: idx === 1 ? preset.strokeWidth : 10,
        shadowColorHex: preset.shadowColorHex,
        shadowDepth: preset.shadowDepth,
        slant: preset.slant,
      })),
    });
  };

  const handleExport = () => {
    alert('Exportando portada master a 1280x720 PNG sin pérdida (Lossless)...');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSafeZones={() => setSafeZonesVisible(!safeZonesVisible)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onExport={handleExport}
        safeZonesEnabled={safeZonesVisible}
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
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            proposals={proposals}
            selectedProposalId={selectedProposalId}
            onSelectProposal={handleSelectProposal}
          />
        }
        centerStage={
          <CanvasStage
            baseImageUrl={baseImage.dataUrl}
            textGroup={textGroup}
            onUpdateTextGroup={setTextGroup}
            safeZonesVisible={safeZonesVisible}
          />
        }
        rightPanel={
          <InspectorPanel
            textGroup={textGroup}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
            onUpdateTextGroup={setTextGroup}
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
        canvasDataUrl={baseImage.dataUrl}
        videoTitle={rawText}
      />
    </div>
  );
}
