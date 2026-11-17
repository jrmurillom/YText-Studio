# SSOT de Estándares y Definiciones del Sistema (Non-UI SSOT)

## 1. Propósito del Documento
Este documento constituye la **Fuente Única de Verdad (Single Source of Truth - SSOT)** para todas las especificaciones de datos, matemáticas de composición, contratos de comunicación con modelos de lenguaje (LMM), estándares de renderizado gráfico y algoritmos de optimización para **YText Studio**.

Cualquier implementación en código debe apegarse estrictamente a las definiciones aquí consignadas.

---

## 2. Contratos de Comunicación con LMMs (Schema Normalizado)

Todos los adaptadores de proveedores (Google Gemini, OpenRouter, OpenAI, Ollama) deben forzar la salida del modelo a un JSON estricto que cumpla con el siguiente contrato de datos.

### 2.1 Payload de Solicitud de Visión (`LMMVisionRequest`)
```typescript
export interface LMMVisionRequest {
  imageBase64WebP: string; // Imagen reescalada a max 640px de ancho (<50KB)
  rawText: string;          // Texto introducido por el usuario (ej. "MEJOR DISCO DE ROCK")
  intent: 'hype' | 'horror' | 'mystery' | 'tech' | 'alert' | 'authority'; // Intención / Atmósfera Emocional
  marketingContext?: {
    niche?: 'gaming' | 'music' | 'tech' | 'finance' | 'vlog' | 'education' | 'general';
    videoTitle?: string;
  };
}
```

### 2.2 Payload de Respuesta Estructurada (`LMMVisionResponse`)
El LMM no define píxeles directos, sino cuadrantes semánticos y segmentación jerárquica:

```typescript
export interface LMMVisionResponse {
  analysis: {
    subjectZone: 'LEFT_HALF' | 'RIGHT_HALF' | 'CENTER' | 'FULL_BOTTOM';
    recommendedPlacement: 'TOP_LEFT' | 'CENTER_LEFT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'CENTER_RIGHT' | 'TOP_CENTER';
    dominantColors: string[];       // Hexadecimales dominantes de la foto (ej. ["#1A1A24", "#3D2645"])
    contrastAccentColor: string;    // Color de máximo contraste recomendado (ej. "#FFE500")
  };
  segmentation: {
    lines: Array<{
      text: string;                 // Fragmento de texto (ej. "MEJOR DISCO")
      role: 'anchor_secondary' | 'power_primary';
      suggestedPresetId: 'mrbeast_pop' | 'docu_drama' | 'gaming_neon' | 'authority_badge';
      fontSizeRatio: number;        // Multiplicador relativo (ej. 0.7 para apoyo, 1.0 a 1.25 para impacto)
      colorHex: string;             // Color de relleno propuesto
      strokeColorHex: string;       // Color del trazo perimetral
    }>;
  };
  reasoning: string;                // Explicación breve de la decisión de composición
}
```

---

## 3. Especificación Matemática de Safe Zones de YouTube

Para evitar que los títulos queden bloqueados por la interfaz de YouTube, el canvas de 16:9 (`1280 x 720` px) define zonas de exclusión obligatorias.

```
0,0 ───────────────────────────────────────────────────────────── 1280,0
│  [ SAFE ZONE SUPERIOR: Libre de obstáculos ]                        │
│                                                                     │
│                                                                     │
│                                     ┌────────────────────────────┐  │
│                                     │ ⛔ EXCLUSIÓN TIMESTAMP     │  │
│                                     │ x: 1040, y: 640            │  │
│                                     │ w: 220,  h: 60             │  │
0,720 ────────────────────────────────┴────────────────────────────┴─ 1280,720
```

### Constantes de Seguridad:
- **Resolución Maestra:** `WIDTH = 1280`, `HEIGHT = 720` (Ratio 16:9).
- **Margen de Respeto Perimetral (Padding):**
  - Horizontal: $X_{\text{pad}} = 1280 \times 0.05 = 64\text{ px}$.
  - Vertical: $Y_{\text{pad}} = 720 \times 0.06 = 43\text{ px}$.
- **Caja de Exclusión Timestamp (Inferior Derecha):**
  - $X_{\text{min}} = 1040\text{ px}$, $Y_{\text{min}} = 640\text{ px}$.
  - Ancho $= 220\text{ px}$, Alto $= 60\text{ px}$ (cubre insignias de `00:00:00` y badge "LIVE").
- **Regla de Detección AABB (Axis-Aligned Bounding Box):**
  Si el bounding box del `TextGroup` intersecta la caja de exclusión:
  $$\text{Intersect} = !(B_{\text{right}} < T_{\text{left}} \lor B_{\text{left}} > T_{\text{right}} \lor B_{\text{bottom}} < T_{\text{top}} \lor B_{\text{top}} > T_{\text{bottom}})$$
  Si $\text{Intersect} = \text{true}$, se bloquea el drop o se ejecuta una traslación forzada correctiva de $\Delta Y = -70\text{ px}$.

---

## 4. Estándares del Renderizado Gráfico Vectorial (Canvas 2D)

### 4.1 Solución al "Stroke Bug"
Todo objeto de texto en canvas nativo debe dibujarse forzosamente con:
```javascript
ctx.textBaseline = 'top';
ctx.textAlign = 'left';
ctx.font = `${weight} ${size}px "${fontFamily}"`;

// DIBUJO CONCÉNTRICO DE 3 PASADAS:
// Pasada 1: Sombra 3D Dura
renderExtrudedDropShadow(ctx, text, x, y, shadowColor, offsetDistance, angle);

// Pasada 2: Trazo Exterior Masivo (paintFirst = 'stroke' manual)
ctx.strokeStyle = outerStrokeColor;
ctx.lineWidth = outerStrokeWidth; // ej. 18-24px
ctx.lineJoin = 'miter';
ctx.miterLimit = 3;
ctx.strokeText(text, x, y);

// Pasada 3: Trazo Secundario / Relleno Limpio
if (hasInnerStroke) {
  ctx.strokeStyle = innerStrokeColor;
  ctx.lineWidth = innerStrokeWidth; // ej. 8-10px
  ctx.strokeText(text, x, y);
}
ctx.fillStyle = fillStyle; // Color plano o gradiente vertical
ctx.fillText(text, x, y);
```

### 4.2 Extrusión de Sombra 3D (Hard Drop Shadow)
Las sombras de alto impacto para YouTube **no usan desenfoque (`filter blur = 0`)**. Se generan calculando una pila de traslaciones vectoriales discretas a paso de 1px a lo largo del ángulo de proyección $\theta$ (por defecto $\theta = 90^\circ$ o $45^\circ$):
$$\Delta x_i = i \cdot \cos(\theta), \quad \Delta y_i = i \cdot \sin(\theta) \quad \text{para } i \in [1, \text{depth}]$$
con $\text{depth} \in [8, 16]\text{ px}$.

---

## 5. Catálogo de Presets Tipográficos Estudiados

| ID Preset | Nombre Comercial | Fuente Display | Fill (Relleno) | Outer Stroke | 3D / Shadow | Slant | Uso Recomendado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `mrbeast_pop` | **Viral Pop** | `Komika Axis` / `Luckiest Guy` | Gradiente `#FFE600` $\to$ `#FF9000` | Negro 20px + Blanco 6px | Sombra dura 12px a 90° | $0^\circ$ a $-3^\circ$ | Retos, Vlogs, Hype, Gaming familiar |
| `docu_drama` | **Docu-Drama** | `Anton` / `Bebas Neue` | Blanco `#FFFFFF` o Rojo `#E50914` | Negro 16px | Sombra negra profunda 10px | $0^\circ$ | Documentales, Misterio, Crímenes, Noticias |
| `gaming_neon` | **Gaming Neon** | `Bangers` / `Montserrat Black` | Gradiente Cyan `#00F5FF` $\to$ Magenta `#FF007F` | Negro 18px con glow | Sombra cian 8px | $-6^\circ$ | Gameplays, eSports, Lanzamientos tech |
| `authority_badge`| **Authority / Business** | `Inter Black` / `Montserrat 900` | Blanco `#FFFFFF` sobre Badge negro/azul | N/A (Usa contenedor) | Sombra suave detrás de la caja | $0^\circ$ | Finanzas, Podcast, Educación, Tech reviews |

---

## 6. Algoritmo de Legibilidad Móvil: Thumbnail Readability Index (TRI)

Para evitar la saturación de texto en pantallas reducidas, el sistema evalúa el diseño antes de la exportación mediante la siguiente métrica continua:

$$\text{TRI} = 100 - \left( \text{Penalty}_{\text{words}} + \text{Penalty}_{\text{size}} + \text{Penalty}_{\text{contrast}} \right)$$

### Penalizaciones:
1. **Penalización por Densidad de Palabras ($W$):**
   $$\text{Penalty}_{\text{words}} = \begin{cases} 0 & \text{si } W \le 3 \\ 15 \cdot (W - 3) & \text{si } 4 \le W \le 6 \\ 60 & \text{si } W > 6 \end{cases}$$
2. **Penalización por Tamaño de Fuente Proyectada en Móvil ($S_{\text{mobile}} = \text{fontSize} \times \frac{320}{1280}$):**
   $$\text{Penalty}_{\text{size}} = \begin{cases} 0 & \text{si } S_{\text{mobile}} \ge 18\text{ px} \\ 10 \cdot (18 - S_{\text{mobile}}) & \text{si } 10\text{ px} \le S_{\text{mobile}} < 18\text{ px} \\ 50 & \text{si } S_{\text{mobile}} < 10\text{ px} \end{cases}$$
3. **Escala de Calificación:**
   - **Verde (Óptimo, CTR Alto):** $\text{TRI} \ge 85$
   - **Amarillo (Aceptable):** $65 \le \text{TRI} < 85$
   - **Rojo (Crítico / Ilegible en smartphone):** $\text{TRI} < 65$ $\to$ Activa automáticamente el botón *"Sintetizar a Power Words"*.

---

## 7. Pipeline de Integridad de Imagen y Exportación Lossless
1. **Inmutabilidad:** El objeto fuente original de la imagen `HTMLImageElement` permanece inalterado en memoria a su resolución original nativa ($W_{\text{orig}} \times H_{\text{orig}}$).
2. **Coordenadas Normalizadas:** Las posiciones $\{x, y\}$ y anchos del `TextGroup` se almacenan en ratio normalizado $[0.0 \to 1.0]$ respecto al canvas estándar de 1280x720.
3. **Exportación:** Se inicializa un `OffscreenCanvas` a la resolución seleccionada (1280x720 o 1920x1080), se pinta el bitmap fuente con `imageSmoothingQuality = 'high'` y se proyecta el rasterizado vectorial a escala 1:1, exportando en formato PNG (MIME: `image/png`) sin compresión con pérdida.
