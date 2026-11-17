# SSOT de Especificaciones de UI, Tokens y Layout (UI SSOT)

## 1. Stack Tecnológico Oficial Consolidado

| Capa del Sistema | Tecnología Elegida | Justificación Técnica |
| :--- | :--- | :--- |
| **Bundler & Tooling** | **Vite 6 + TypeScript** | Compilación nativa con esbuild, inicio en frío <300ms, HMR instantáneo y cero sobrecarga de configuración. |
| **Framework de UI** | **React 19** | Control declarativo para paneles laterales, formularios, modales y gestión de estado reactivo. |
| **Estilos & Diseño** | **Tailwind CSS v4** | Compilación pura a CSS en build time, sin librerías de componentes pesadas en runtime. Modo claro *Clean Studio Light*. |
| **Iconografía** | **Lucide React** | Iconos vectoriales limpios, consistentes y con trazo ultra-fino (1.5px). |
| **Motor de Canvas** | **API Nativa Canvas 2D + `DOMMatrix`** | Renderizado vectorial acelerado por hardware (GPU), <35MB de RAM, 60–120 FPS limpios. Desacoplado del ciclo de reconciliación de React. Cero librerías externas pesadas (sin Fabric.js). |
| **Conectividad LMM** | **`fetch` Nativo + Universal Adapter Pattern** | Comunicación directa con Google Gemini (Flash 2.0), OpenRouter, OpenAI y servidores locales/Ollama sin SDKs externos redundantes. |
| **Almacenamiento** | **`localStorage` & Estado en Memoria** | Persistencia segura en cliente para claves de API y presets. Cero base de datos backend obligatoria. |
| **Exportador Master** | **`OffscreenCanvas` Lossless Pipeline** | Rasterizado virtual en segundo plano a 1280x720 y 1920x1080 (PNG/JPEG 1.0) sin alteración de la imagen original. |

---

## 2. Sistema de Tokens Visuales (*Clean Studio Light*)

La interfaz está diseñada para ser una **herramienta de estudio profesional**: fondo claro suave, contraste estricto, paneles blancos limpios y mínima distracción visual para que el protagonismo absoluto sea la portada de YouTube.

### 2.1 Superficies y Fondos
```css
--bg-app:        #F8FAFC; /* Slate 50: Fondo principal de la aplicación */
--bg-panel:      #FFFFFF; /* Blanco puro: Paneles de herramientas e inspectores */
--bg-canvas-stage: #F1F5F9; /* Slate 100: Área neutra donde descansa el canvas */
--bg-input:      #FFFFFF; /* Blanco: Entradas de texto y selects */
--bg-hover:      #F8FAFC; /* Slate 50: Hover sutil en botones secundarios */
--bg-active:     #EFF6FF; /* Blue 50: Estado activo o seleccionado */
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
--status-success: #10B981; /* Emerald 500: Indicador TRI óptimo */
--status-warning: #F59E0B; /* Amber 500: Alerta de densidad de texto */
--status-danger:  #EF4444; /* Red 500: Invasión de zona de timestamp YouTube */
```

### 2.5 Bordes Redondeados y Sombras
- **Radios:**
  - `rounded-xs`: `3px` (Badges y chips pequeños)
  - `rounded-md`: `6px` (Botones estándar e inputs)
  - `rounded-lg`: `8px` (Contenedor del canvas y tarjetas de presets)
  - `rounded-xl`: `12px` (Modales y drawers flotantes)
- **Sombras:**
  - `shadow-xs`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (Tarjetas de inspector e inputs)
  - `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.08)` (Mesa de trabajo del canvas)
  - `shadow-xl`: `0 20px 25px -5px rgba(0, 0, 0, 0.1)` (Modal de simulación y settings)

---

## 3. Distribución Espacial de la Interfaz (3-Column Studio Workstation)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. BARRA SUPERIOR (H: 48px)                                                                 │
│ [Logo YText Studio]    [⚙️ API Settings]    [👁️ Safe Zones]    [📱 Simular Feed]    [Exportar]│
├──────────────────────────┬───────────────────────────────────────────┬──────────────────────┤
│ 2. PANEL IZQUIERDO       │ 3. CANVAS CENTRAL (Flex-1)                │ 4. PANEL DERECHO     │
│    (W: 260px)            │    (Stage de Observación & Interacción)   │    (W: 280px)        │
│                          │                                           │                      │
│ • Dropzone Imagen 16:9   │     ┌───────────────────────────────┐     │ • Presets Estudiados │
│ • Input Texto Base       │     │  [ MEJOR DISCO ] (Anchor)     │     │   [💥 Viral Pop]     │
│ • Chips de Intención:    │     │  [ DE ROCK! ]    (3D Power)   │     │   [🎬 Docu-Drama]    │
│   [⚡ Hype]   [👻 Horror]│     └───────────────────────────────┘     │   [⚡ Gaming Neon]   │
│   [🕵️ Misterio] [🔬 Tech]│                                           │   [💼 Authority]     │
│ • [⚡ Analizar & Proponer]│               (Sujeto Foto)               │                      │
│ • Tarjetas de Propuesta: │                     📸                    │ • Editor Segmentos   │
│   [Opción A]             │                                           │   L1: [Blanco/Badge] │
│   [Opción B]             │    [ ⛔ Safe Zone Timestamp: 14:25 ]      │   L2: [Amarillo 3D]  │
│   [Opción C]             │                                           │   [🔀 Invertir]      │
│                          │                                           │                      │
│                          │ • Telemetría: X: 48, Y: 32 • Escala: 100% │ • Sliders Ajuste Fino│
│                          │                                           │ • TRI Score (Móvil)  │
└──────────────────────────┴───────────────────────────────────────────┴──────────────────────┘
```

---

## 4. Flujo Operativo Secuencial de la UI

Para evitar mutaciones reactivas no deseadas sobre el lienzo, la interfaz opera en **4 fases estrictamente delimitadas**:

### Fase A: Preparación de Insumos (Panel Izquierdo - Pre-Análisis)
1. El usuario suelta la imagen base (se bloquea en el canvas 16:9 de fondo).
2. Escribe el texto base que desea en la portada (ej. *"mejor disco de rock"*).
3. Selecciona la **Intención / Atmósfera Emocional** (ej. `[👻 Horror]`, `[⚡ Hype]`, `[🕵️ Misterio]`, etc.).
4. **Estado del Canvas en este punto:** Muestra la imagen base pura. El layer de títulos aún no existe porque la IA no ha estudiado la imagen.

### Fase B: Disparo y Generación de Propuestas (El Puente)
1. El usuario pulsa el botón maestro: **`[ ⚡ Analizar & Proponer Portada ]`**.
2. El botón entra en estado de carga con spinner y el panel izquierdo muestra esqueletos (*skeletons*) de carga en la sección de propuestas.
3. El LMM procesa la imagen comprimida (640px WebP) + texto + intención elegida.
4. Se renderizan 3 **Tarjetas de Propuesta** (A, B, C) con copys sintetizados, cuadrantes de ubicación y paletas complementarias.

### Fase C: Montaje en Canvas (Activación de la Propuesta)
1. El usuario hace clic en una propuesta (ej. *"Propuesta A: Arriba a la izquierda"*).
2. El sistema monta inmediatamente el `CompositeTextGroup` vectorial en el canvas sobre el espacio negativo detectado.

### Fase D: Afinación Fina y Ajuste Manual (Canvas y Panel Derecho)
1. **En el Canvas:**
   - La caja de texto seleccionada muestra su *bounding box* con tiradores de redimensionado, rotación y arrastre a 60 FPS.
   - Si se arrastra sobre la esquina inferior derecha, se ilumina en rojo la alerta de colisión contra el timestamp de YouTube.
2. **En el Panel Derecho:**
   - El usuario puede conmutar entre presets estudiados con 1 clic.
   - Puede modificar individualmente la palabra secundaria frente a la principal.
   - Puede ajustar grosor de contorno (*stroke*), sombra 3D o inclinación (*slant*) mediante sliders táctiles limpios.
   - Monitorea el índice de legibilidad móvil (TRI) en tiempo real.

### Fase E: Validación Multi-Contexto y Exportación (Barra Superior)
1. El usuario pulsa **"📱 Simular Feed"** para abrir el drawer que muestra cómo se visualiza la miniatura a escala real en la aplicación móvil de YouTube (~320px de ancho) y en la barra lateral.
2. Pulsa **"Exportar 1280x720"** para generar la descarga del archivo PNG sin pérdida (*lossless*).

---

## 5. Especificación de Componentes Clave

### 5.1 `SettingsModal` (Configuración Rápida de APIs)
- **Activador:** Icono de engranaje (⚙️) en la barra superior.
- **Campos:**
  - Selector de Proveedor: `[ Google Gemini | OpenRouter | OpenAI Directo | Local / Ollama ]`.
  - Campo de clave de API con máscara de seguridad (tipo `password`) y botón de revelar.
  - Selector de modelo específico con valores recomendados por defecto (`gemini-2.0-flash`, `claude-3.5-sonnet`, `gpt-4o`, `llama3.2-vision`).
  - Almacenamiento instantáneo en `localStorage.setItem('ytext_config', ...)` al hacer clic en "Guardar y Cerrar".

### 5.2 `CanvasViewport` (Mesa de Trabajo Acelerada)
- Elemento `<canvas>` nativo con proporción 16:9 forzada vía CSS (`aspect-ratio: 16 / 9`).
- Eventos de ratón desacoplados: `mousedown`, `mousemove`, `mouseup` operan directamente en memoria vectorial sin provocar renders en el árbol de React.
- Overlay SVG transparente para dibujar la caja de selección y los tiradores de escala/rotación.

### 5.3 `FeedSimulatorModal` (Prueba de Fuego en Móvil)
- Renderiza 3 vistas de escala fija:
  1. **Mobile Feed:** `320 x 180 px` con duración `14:25` y título de video de 2 líneas simulado.
  2. **Desktop Grid:** `360 x 202 px` en layout de 3 columnas de YouTube con modo oscuro/claro conmutable.
  3. **Sidebar Up Next:** `168 x 94 px` para validación extrema de contraste en tamaños mínimos.
