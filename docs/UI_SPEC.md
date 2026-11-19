# SSOT de Especificaciones de UI, Tokens y Layout (UI SSOT)

## 1. Stack Tecnológico Oficial Consolidado

| Capa del Sistema | Tecnología Elegida | Justificación Técnica |
| :--- | :--- | :--- |
| **Bundler & Tooling** | **Vite 6 + TypeScript** | Compilación nativa con esbuild, inicio en frío <300ms, HMR instantáneo y cero sobrecarga de configuración. |
| **Framework de UI** | **React 19** | Control declarativo para paneles laterales, formularios, modales y gestión de estado reactivo. |
| **Estilos & Diseño** | **Tailwind CSS v4** | Compilación pura a CSS en build time, sin librerías de componentes pesadas en runtime. Modo claro *Clean Studio Light*. |
| **Iconografía** | **Lucide React** | Iconos vectoriales limpios, consistentes y con trazo ultra-fino (1.5px). |
| **Motor de Canvas** | **API Nativa Canvas 2D + `DOMMatrix`** | Renderizado vectorial acelerado por hardware (GPU), <40MB de RAM, 60–120 FPS limpios. Desacoplado del ciclo de reconciliación de React. Cero librerías externas pesadas (sin Fabric.js). |
| **Conectividad LMM** | **`fetch` Nativo + Universal Adapter Pattern** | Comunicación directa con Google Gemini, OpenRouter, OpenAI y Ollama con soporte de 3 a 5 propuestas dinámicas. |
| **Desktop Runtime** | **Tauri v2 (Rust + Native Webview)** | Binario nativo ultraligero (<15MB), menú de contexto de escritorio, aceleración por hardware y cero consumo inflado de Chromium. |
| **Internacionalización** | **`I18nProvider` (Motor Ligero Nativo)** | Switch reactivo bilingüe (EN/ES) con catálogos JSON independientes y detección automática de locale. |
| **Exportador Master** | **`OffscreenCanvas` Lossless Pipeline** | Rasterizado virtual en segundo plano a 1280×720 y 1920×1080 (PNG/JPEG 1.0) sin alteración de la imagen original. |

---

## 2. Sistema de Tokens Visuales (*Clean Studio Light*)

La interfaz está diseñada para ser una **herramienta de estudio profesional**: fondo claro suave, contraste estricto, paneles blancos limpios y mínima distracción visual para que el protagonismo absoluto sea la portada de YouTube.

### 2.1 Superficies y Fondos
```css
--bg-app:          #F8FAFC; /* Slate 50: Fondo principal de la aplicación */
--bg-panel:        #FFFFFF; /* Blanco puro: Paneles de herramientas e inspectores */
--bg-canvas-stage: #F1F5F9; /* Slate 100: Área neutra donde descansa el canvas */
--bg-input:        #FFFFFF; /* Blanco: Entradas de texto y selects */
--bg-hover:        #F8FAFC; /* Slate 50: Hover sutil en botones secundarios */
--bg-active:       #EFF6FF; /* Blue 50: Estado activo o seleccionado */
```

### 2.2 Bordes y Separadores
```css
--border-subtle: #E2E8F0; /* Slate 200: Bordes finos de 1px entre paneles */
--border-hover:  #CBD5E1; /* Slate 300: Bordes al pasar el cursor */
--border-focus:  #3B82F6; /* Blue 500: Anillo de foco accesible */
--border-danger: #EF4444; /* Red 500: Alerta de colisión con Safe Zone */
```

### 2.3 Tipografía y Jerarquía Textual
- **Fuente de la Interfaz:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `sans-serif` (neutra, jamás compite con las fuentes del thumbnail).
- **Escala de Colores de Texto:**
  - `text-primary`: `#0F172A` (Slate 900) - Títulos, valores activos y etiquetas principales.
  - `text-secondary`: `#475569` (Slate 600) - Etiquetas de campos y textos descriptivos.
  - `text-muted`: `#94A3B8` (Slate 400) - Placeholders, atajos de teclado y notas de telemetría.
  - `text-accent`: `#2563EB` (Blue 600) - Enlaces, estados activos e insignias.

### 2.4 Acentos y Estados de Sistema
```css
--accent-primary: #2563EB; /* Blue 600: Botón de exportación y acciones maestras */
--accent-hover:   #1D4ED8; /* Blue 700: Hover del botón principal */
--status-success: #10B981; /* Emerald 500: Indicador TRI óptimo (>=85) */
--status-warning: #F59E0B; /* Amber 500: Advertencia de legibilidad TRI (65-84) */
--status-danger:  #EF4444; /* Red 500: Invasión de zona de timestamp YouTube (<65) */
```

---

## 3. Distribución Espacial de la Interfaz (3-Column Workspace con Paneles Colapsables)

La interfaz cuenta con paneles colapsables independientes (`StudioShell.tsx`) que permiten liberar hasta 560px de área horizontal en monitores pequeños:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. BARRA SUPERIOR (H: 48px)                                                                            │
│ [Logo YText Studio]  [AI Provider: Gemini ⚡]  [↺ Undo / Redo ↻]  [EN/ES]  [Grid]  [SafeZones]  [Preview] [Export]│
├──────────────────────────┬─────────────────────────────────────────────────┬───────────────────────────┤
│ 2. HERRAMIENTAS (W: 268px│ 3. CANVAS CENTRAL (Flex-1)                      │ 4. INSPECTOR (W: 288px)   │
│    Colapsable [◀]        │    (Stage de Observación & Interacción)         │    Colapsable [▶]         │
│                          │                                                 │                           │
│ • Dropzone Fondo 16:9    │     ┌─────────────────────────────────────┐     │ • Tabs: [Text] [Stickers] │
│ • Video Title (Inmutable)│     │  [ POWER WORD ] (Line 1)            │     │                           │
│ • Intent Chips (2 líneas)│     │  [ SECONDARY ]  (Line 2)            │     │ • Líneas Tipográficas:    │
│   [Hype] [Horror] [Tech] │     └─────────────────────────────────────┘     │   L1: [Fuente, Color, Sz] │
│   [Mystery] [Alert] [Cust│                                                 │   L2: [Gradient, Stroke]  │
│ • Proposals Count (3..5) │                 (Imagen Fondo 16:9)             │   [+ Add Line] [↑] [↓] [×]│
│ • [⚡ Generate Proposals]│                          📸                     │                           │
│ • Proposal Cards (Accorde│                                                 │ • Precisión Numérica      │
│   [Option A] [Option B]  │     [ ⛔ Timestamp Badge: 14:25 ]               │ • Sombra 3D & Slant       │
│ • Raw LMM Telemetry Log  │ • Barra Zoom: [-] [100%] [+] [Fit]              │ • TRI Score Móvil en vivo │
└──────────────────────────┴─────────────────────────────────────────────────┴───────────────────────────┘
```

---

## 4. Flujo Operativo y Componentes Clave

### 4.1 IngestionPanel (Panel Izquierdo)
1. **Fondo Inmutable:** Ingesta de imagen 16:9 con bloqueo de proporción.
2. **Título del Video (`rawText`):** Persiste inalterado y sirve como contexto semántico para la IA y los simuladores.
3. **Selector de Intención Dinámico (`IntentSelector`):** Tarjetas compactas de 2 líneas (título en negrita + descripción de apoyo) y soporte de texto libre para intenciones personalizadas (`other`).
4. **Control de Propuestas:** Selector configurable (`3`, `4` o `5` opciones) interpolado en el prompt del sistema.
5. **Telemetría Transparente:** Acordeón colapsable con payload de envío y respuesta cruda del modelo con botón de copia de 1 clic.

### 4.2 CanvasStage & Viewport (Lienzo Central)
1. **Loop Fuera de React:** Bounding box interactivo calculado mediante `DOMMatrix` con pivote real para arrastre, escala y rotación sin disparar re-renders.
2. **Controles de Zoom:** Barra flotante en la esquina inferior (`[-]`, `100%`, `[+]`, `[Fit]`) con mapeo de coordenadas reactivo.
3. **Guardián de Safe Zones:** Overlay geométrico con caja de exclusión de duración `14:25` y advertencia en tiempo real.
4. **Regla de Tercios:** Cuadrícula 3×3 superpuesta con toggle directo.

### 4.3 InspectorPanel (Panel Derecho Master-Detail)
1. **Selector de Capa Activa:** Pestañas `[Text Layer]` y `[Graphic Assets / Stickers]`.
2. **Editor de Texto Jerárquico:**
   - Adición y eliminación de líneas (1 a 3 segmentos).
   - Reordenamiento vertical con `[↑]` y `[↓]`.
   - Selector tipográfico con las 12 fuentes display curadas.
   - Sliders táctiles sincronizados con inputs numéricos editables en tiempo real (`fontSize`, `strokeWidth`, `shadowDepth`, `slant`).
   - Toggle de gradiente cenital vertical y badge de contenedor por línea.
3. **Sticker / Asset Inspector:**
   - Ingesta de recortes PNG/WebP con canal alfa.
   - Control de borde blanco perimetral (`hasStickerBorder`, grosor y color).
   - Sombra 3D dura direccional consistente y opacidad.
4. **Modo Autónomo / Manual:** Botón `[+ Add Text Layer]` para diseñar sin requerir conexión a la IA si se desea partir de cero.

### 4.4 Modales de Validación y Exportación
1. **`SettingsModal`:** Almacenamiento seguro en cliente (`localStorage`) de claves de Gemini, OpenRouter, OpenAI y endpoints de Ollama, con selector de volumen de propuestas por defecto.
2. **`FeedSimulatorModal`:** Validación multi-contexto en feeds reales de YouTube:
   - *Mobile Feed (320×180 px):* Miniatura con timestamp `14:25` y título de video.
   - *Desktop Grid (360×202 px):* Visualización en modo claro y oscuro de YouTube.
   - *Sidebar Up Next (168×94 px):* Validación extrema de contraste a escala reducida.
3. **`ExportModal`:** Descarga sin pérdida a 1280×720 y 1920×1080 (PNG / JPEG 1.0) renderizado vía `OffscreenCanvas`.
