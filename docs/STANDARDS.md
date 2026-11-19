# SSOT de Estándares y Definiciones del Sistema (Non-UI SSOT)

## 1. Propósito del Documento
Este documento constituye la **Fuente Única de Verdad (Single Source of Truth - SSOT)** para todas las especificaciones de datos, matemáticas de composición, contratos de comunicación con modelos de lenguaje y visión (LMM), estándares de renderizado gráfico, algoritmos de optimización y arquitectura desktop para **YText Studio**.

Cualquier implementación en código debe apegarse estrictamente a las definiciones aquí consignadas.

---

## 2. Contratos de Comunicación con LMMs (Dirección de Arte Autónoma 100%)

Todos los adaptadores de proveedores (Google Gemini, OpenRouter, OpenAI, Ollama) fuerzan la salida del modelo a un JSON estructurado que cumple con el siguiente contrato de datos. Se erradican los presets tipográficos fijos en favor de propuestas dinámicas generadas contextualmente por la IA.

### 2.1 Payload de Solicitud de Visión (`LMMVisionRequest`)
```typescript
export interface LMMVisionRequest {
  imageBase64WebP: string; // Imagen reescalada a max 640px de ancho (<50KB)
  rawText: string;          // Texto introducido por el creador (ej. "MEJOR DISCO DE ROCK")
  intent: IntentType;       // 'hype' | 'horror' | 'mystery' | 'tech' | 'alert' | 'authority' | 'other'
  customIntentText?: string;// Texto libre cuando intent === 'other'
  proposalCount?: number;   // Volumen de propuestas deseadas (3 a 5)
  marketingContext?: {
    niche?: string;
    videoTitle?: string;
  };
}
```

### 2.2 Payload de Respuesta Estructurada (`LMMVisionResponse`)
El LMM actúa como Director de Arte, determinando la distribución en espacio negativo, jerarquías de 1 a 3 líneas y estilización cinematográfica completa:

```typescript
export interface LMMProposalLine {
  text: string;
  role: 'anchor_secondary' | 'power_primary';
  fontSizeRatio: number;      // 0.6 a 1.2
  fontFamily?: string;        // Hereda o sobreescribe la tipografía base
  colorHex: string;
  gradientColorHex?: string;  // Degradado vertical cenital (opcional)
  strokeColorHex: string;
  strokeWidth: number;        // 6 a 18px
  shadowColorHex: string;
  shadowDepth: number;        // 2 a 8px
  hasBadge?: boolean;
  badgeBgColor?: string;
  slant?: number;             // Inclinación angular local (-6° a 6°)
}

export interface LMMProposalSpecification {
  id: string;
  title: string;              // Ej: "Opción A: Impacto Directo"
  concept: string;            // Justificación de marketing / ángulo de CTR
  placement: 'TOP_LEFT' | 'CENTER_LEFT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'CENTER_RIGHT' | 'TOP_CENTER';
  fontFamily: string;         // Familia tipográfica dominante
  rotation: number;           // Inclinación angular del bloque (-6° a 6°)
  hasBadge: boolean;
  badgeBgColor?: string;
  lines: LMMProposalLine[];   // De 1 a 3 líneas independientes
}

export interface LMMVisionResponse {
  analysis: {
    subjectZone: 'LEFT_HALF' | 'RIGHT_HALF' | 'CENTER' | 'FULL_BOTTOM';
    detectedNegativeSpace: Array<'TOP_LEFT' | 'CENTER_LEFT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'CENTER_RIGHT' | 'TOP_CENTER'>;
    dominantColors: string[];
    contrastAccentColor: string;
  };
  proposals: LMMProposalSpecification[]; // 3 a 5 propuestas autónomas
  reasoning: string;
}
```

---

## 3. Especificación Matemática de Safe Zones de YouTube

Para garantizar que el título no quede cubierto por los elementos de interfaz nativos de YouTube (especialmente en feed móvil), el lienzo de 16:9 (`1280 x 720` px) impone zonas de exclusión estrictas:

```
0,0 ───────────────────────────────────────────────────────────── 1280,0
│  [ SAFE ZONE SUPERIOR / LATERALES: Margen 5% horiz, 6% vert ]      │
│                                                                     │
│                                                                     │
│                                     ┌────────────────────────────┐  │
│                                     │ ⛔ BADGE DURACIÓN 14:25    │  │
│                                     │ x: 1040, y: 640            │  │
│                                     │ w: 220,  h: 60             │  │
0,720 ────────────────────────────────┴────────────────────────────┴─ 1280,720
```

### Constantes y Reglas Geométricas:
- **Resolución Maestra:** `WIDTH = 1280`, `HEIGHT = 720` (Ratio 16:9).
- **Margen de Respeto Perimetral (Padding):**
  - Horizontal: $X_{\text{pad}} = 1280 \times 0.05 = 64\text{ px}$.
  - Vertical: $Y_{\text{pad}} = 720 \times 0.06 = 43\text{ px}$.
- **Caja de Exclusión Timestamp (Inferior Derecha):**
  - $X_{\text{min}} = 1040\text{ px}$, $Y_{\text{min}} = 640\text{ px}$.
  - Ancho $= 220\text{ px}$, Alto $= 60\text{ px}$ (cubre insignias de `00:00:00` y badge "LIVE").
- **Detección AABB (Axis-Aligned Bounding Box):**
  Si el bounding box interactivo intersecta la caja de exclusión:
  $$\text{Intersect} = !(B_{\text{right}} < T_{\text{left}} \lor B_{\text{left}} > T_{\text{right}} \lor B_{\text{bottom}} < T_{\text{top}} \lor B_{\text{top}} > T_{\text{bottom}})$$
  Si $\text{Intersect} = \text{true}$, se dispara la alerta visual en el canvas stage y se provee snap correctivo de seguridad.

---

## 4. Renderizado Gráfico Vectorial (Canvas 2D) y Render Loop

### 4.1 Solución al "Stroke Bug"
Todo objeto de texto en canvas nativo se dibuja con soporte `paintFirst = 'stroke'` manual para evitar que trazos gruesos (12–24px) devoren el cuerpo de los glifos:

```javascript
ctx.textBaseline = 'top';
ctx.textAlign = 'left';
ctx.font = `${weight} ${size}px "${fontFamily}"`;

// Pasada 1: Sombra 3D Dura oblicua a 45°
renderExtrudedDropShadow(ctx, text, x, y, shadowColor, offsetDistance);

// Pasada 2: Trazo Exterior Masivo
ctx.strokeStyle = outerStrokeColor;
ctx.lineWidth = outerStrokeWidth;
ctx.lineJoin = 'miter';
ctx.miterLimit = 3;
ctx.strokeText(text, x, y);

// Pasada 3: Relleno Limpio (Plano o Gradiente Cenital)
ctx.fillStyle = fillStyle;
ctx.fillText(text, x, y);
```

### 4.2 Sombra 3D Dura Oblicua (45°)
Las miniaturas de alto impacto prescinden de desenfoque (`filter blur = 0`). La extrusión se genera acumulando traslaciones vectoriales discretas a paso de 1px en ángulo oblicuo a 45°:
$$\Delta x_i = \text{round}(i \times 0.75), \quad \Delta y_i = i \quad \text{para } i \in [1, \text{depth}]$$
con $\text{depth} \in [2, 16]\text{ px}$.

### 4.3 Renderizado de Stickers y Assets Gráficos (`StickerRenderer`)
Para elementos con canal alfa (PNG, WebP transparente, SVGs):
1. **Silueta Cacheada:** Se genera la máscara perimetral en un `scratchCanvas` fuera de pantalla evaluado una sola vez por cambio de asset.
2. **Borde Exterior (Sticker Cutout):** Operación de composición `destination-over` con dilatación perimetral a escala global (`globalScale`), asegurando nitidez 100% en exportaciones 1080p.
3. **Sombra Proyectada:** Offset 3D a 45° idéntico a las capas tipográficas para coherencia lumínica en la composición.

---

## 5. Catálogo de 12 Tipografías Display Curadas de YouTube

Se eliminan los presets fijos. El sistema carga y valida 12 fuentes de alto rendimiento visual en YouTube:

| Tipografía | Familia / Categoría | Atmósfera Principal | Características de Renderizado |
| :--- | :--- | :--- | :--- |
| **Anton** | Sans Ultra-Condensada | Hype / Breaking News | Impacto vertical masivo, óptima para 1 o 2 palabras. |
| **Bebas Neue** | Sans Condensada Display | Documental / Retos | Glifos geométricos limpios, gran legibilidad en móvil. |
| **Bangers** | Comic / Pop Display | Humor / Gaming Casual | Trazos dinámicos enérgicos con gran masa de relleno. |
| **Luckiest Guy** | Rounded Heavy | Vlogs / Virales / Familiar | Bordes suaves y gran área para gradientes brillantes. |
| **Montserrat** | Sans Geométrica 900 | Autoridad / Podcasts | Estabilidad moderna y excelente rendimiento con badges. |
| **Inter** | Sans Neo-grotesca Black | Tech / Negocios | Neutralidad analítica con kerning ultra-preciso. |
| **Teko** | Sans Extra-Alta | eSports / Competitivo | Densidad horizontal máxima para copys de 3 o 4 palabras. |
| **Rubik** | Sans Redondeada Black | Educación / Explicaciones | Claridad pedagógica con peso visual contundente. |
| **Poppins** | Geométrica Bold | Estilo de Vida / Moda | Curvas simétricas y apariencia contemporánea. |
| **Playfair Display** | Serif Elegante Black | Misterio / Crónica Negra | Serifas contrastadas para miniaturas dramáticas. |
| **Cinzel** | Serif Clásica Display | Historia / Épica / Cine | Distinción formal inspirada en inscripciones latinas. |
| **Permanent Marker**| Hand-Drawn Brush | Caos / Storytime / Reacciones | Sensación de urgencia e improvisación auténtica. |

---

## 6. Thumbnail Readability Index (TRI)

Evaluación en tiempo real de legibilidad para feeds móviles (~320 px de ancho):

$$\text{TRI} = 100 - \left( \text{Penalty}_{\text{words}} + \text{Penalty}_{\text{size}} + \text{Penalty}_{\text{contrast}} \right)$$

### Penalizaciones:
1. **Densidad de Palabras ($W$):**
   $$\text{Penalty}_{\text{words}} = \begin{cases} 0 & \text{si } W \le 3 \\ 15 \cdot (W - 3) & \text{si } 4 \le W \le 6 \\ 60 & \text{si } W > 6 \end{cases}$$
2. **Tamaño de Fuente en Pantalla Móvil ($S_{\text{mobile}} = \text{fontSize} \times \frac{320}{1280}$):**
   $$\text{Penalty}_{\text{size}} = \begin{cases} 0 & \text{si } S_{\text{mobile}} \ge 18\text{ px} \\ 10 \cdot (18 - S_{\text{mobile}}) & \text{si } 10\text{ px} \le S_{\text{mobile}} < 18\text{ px} \\ 50 & \text{si } S_{\text{mobile}} < 10\text{ px} \end{cases}$$
3. **Escala de Calificación:**
   - **Verde (Óptimo):** $\text{TRI} \ge 85$
   - **Amarillo (Aceptable):** $65 \le \text{TRI} < 85$
   - **Rojo (Crítico en smartphone):** $\text{TRI} < 65$

---

## 7. Arquitectura Multi-Capa (Multi-Layer Canvas)

El modelo de composición soporta capas tipográficas y stickers gráficos en un árbol ordenado por `zIndex`:

- **Capa Tipográfica (`CompositeTextGroup`):**
  - Contiene de 1 a 3 `TextSegment`s independientes.
  - Transformación afín global mediante `DOMMatrix` (posición $x, y$, escala $0.5 \times \to 2.5 \times$, rotación $-180^\circ \to +180^\circ$).
  - Control granular por segmento (fuente, tamaño, color, gradiente cenital, offset $x/y$ local, badge individual).
- **Capa de Asset Gráfico (`GraphicAssetElement`):**
  - Imágenes PNG/WebP con canal alfa optimizadas en memoria.
  - Borde de recorte tipo calcomanía (`hasStickerBorder`, ancho y color configurable).
  - Sombra dura 3D a 45° y control de opacidad.
- **Historial Inmutable (`useHistory`):**
  - Pila `past / present / future` desacoplada para deshacer (`Ctrl+Z`) y rehacer (`Ctrl+Y` / `Ctrl+Shift+Z`) tanto en texto como en assets gráficos.

---

## 8. Arquitectura de Internacionalización (i18n Engine)

- **Contexto Reactivo Desacoplado:** `I18nProvider` y hook `useTranslation` con peso <1.5 KB y tipado exhaustivo en TypeScript (`keyof typeof en`).
- **Diccionarios Estáticos:** Catálogos JSON desacoplados en `src/locales/en.json` (inglés Baseline canónico) y `src/locales/es.json` (español profesional).
- **Aislamiento Gráfico:** El ciclo de renderizado de Canvas 2D permanece inmune a los re-renders de idioma de la interfaz.

---

## 9. Pipeline de Exportación Lossless y Tauri v2 Desktop

1. **Inmutabilidad:** El archivo de imagen fuente permanece intacto en memoria en su resolución nativa.
2. **Coordenadas y Escala:** Posiciones normalizadas respecto a la resolución estándar 1280×720 y escalables a 1920×1080 (Full HD).
3. **Exportación Lossless:** Buffer virtual en `OffscreenCanvas` con `imageSmoothingQuality = 'high'`, rasterizado vectorial 1:1 y exportación a PNG / JPEG 1.0.
4. **Modo Desktop Nativo (Tauri v2):**
   - Integración nativa con Webview de bajo consumo de recursos (<40MB RAM).
   - Menú de contexto nativo personalizado y atajos de teclado del sistema.
   - Pipeline de empaquetado multi-plataforma (Windows MSI/EXE, macOS DMG, Linux AppImage/DEB) vía GitHub Actions.
