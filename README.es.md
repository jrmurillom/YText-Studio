<div align="center">

<img src="public/favicon.svg" width="84" height="60" alt="YText Studio Logo" />

# YText Studio

**Dirección de arte con IA para miniaturas de YouTube. Sube tu imagen y genera títulos de alto impacto listos para publicar en segundos.**

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Tauri](https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri&logoColor=black)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-Backend-black?logo=rust)](https://www.rust-lang.org/)
[![Tests](https://img.shields.io/badge/Tests-43%20passed-brightgreen?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<br/>

🌐 **Idioma / Language:** <a href="./README.md">🇺🇸 English</a> • **🇪🇸 Español**

</div>

---

**YText Studio** es una aplicación gratuita y de código abierto que acelera la creación de miniaturas para YouTube combinando **Inteligencia Artificial visual** con un **editor gráfico fácil de usar sin previo conocimiento de software profesional**.

En lugar de empezar desde cero sin saber qué fuente elegir, dónde ubicar el texto o qué colores contrastan mejor, la IA estudia tu imagen, sintetiza tu idea en palabras gancho (*hooks*) y diseña múltiples propuestas visuales listas para aplicar y personalizar en un clic.

> 🌍 **Soporte Bilingüe & Language Mirroring:** La interfaz cuenta con selector de idioma en vivo (**Español / English**). Además, la IA detecta automáticamente el idioma de tu título: si escribes tu idea en español, genera ganchos y conceptos en español; si lo haces en inglés, responde en inglés.

---

## El Problema y la Solución

- **El Problema:** Crear títulos llamativos para miniaturas suele requerir programas complejos como Photoshop y conocimientos de diseño gráfico (composición, contraste, jerarquía y legibilidad). Cuando el texto se pierde con el fondo o es demasiado largo, la miniatura pasa desapercibida en el feed móvil de YouTube y pierde clics.
- **Lo que resuelve:** Ofrece una experiencia *plug-and-play* donde la IA hace el trabajo pesado de composición y diseño por ti, dándote herramientas visuales directas para ajustar el resultado en segundos sin curva de aprendizaje.

---

## Cómo Acelera tu Proceso Creativo

1. **🤖 Dirección de Arte Automática con IA**  
   Sube tu imagen, escribe el tema de tu video y elige la intención (*Hype, Misterio, Tech, Terror, etc.*). La IA analiza la escena, detecta las zonas libres para no tapar al sujeto principal y genera de **3 a 5 propuestas completas** con textos cortos de alto impacto, tipografías y combinación de colores.
2. **🎨 Ajustes Visuales Directos**  
   Personaliza cualquier propuesta al instante: cambia entre 12 tipografías probadas en YouTube, aplica colores, degradados, bordes gruesos, sombras 3D, cajas de fondo (*badges*) para resaltar palabras clave y añade stickers, flechas o íconos con borde recortado.
3. **📱 Simulador de YouTube y Legibilidad Móvil**  
   Previsualiza cómo se verá tu miniatura a tamaño real en el feed de un teléfono, en la página de inicio o en videos sugeridos. Incluye puntuación de legibilidad en tiempo real y alerta automática si el reloj de duración de YouTube (`14:25`) tapa tu texto.
4. **⚡ Exportación en Resolución Oficial**  
   Descarga tu portada terminada en las dimensiones exactas de YouTube (`1280×720` o `1920×1080` Full HD) en formato PNG o JPG de máxima nitidez.

---

## Requisitos, Drivers de IA y Descarga

### Requisitos
- **100% Gratuito:** Sin suscripciones, sin cuentas obligatorias y sin marcas de agua.
- **Conexión de IA:** Solo necesitas una clave de API (*API Key*) de cualquiera de los proveedores compatibles listados abajo. Tu clave se guarda únicamente en tu propio equipo (`localStorage`).

### 🔌 Drivers de IA Compatibles
Haz clic en cualquiera de los proveedores soportados para obtener tu clave de API o descargar el motor local:

[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://aistudio.google.com/apikey)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-6366F1?style=for-the-badge&logo=openrouter&logoColor=white)](https://openrouter.ai/keys)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://platform.openai.com/api-keys)
[![Ollama Local](https://img.shields.io/badge/Ollama_(Local)-000000?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.com/)

| Proveedor | Modelo Recomendado por Defecto | Tipo de Acceso | Enlace Directo |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | `gemini-2.0-flash` | Nivel gratuito disponible / Pago por uso | [Obtener API Key en Google AI Studio](https://aistudio.google.com/apikey) |
| **OpenRouter** | `anthropic/claude-3.5-sonnet` | Multimodelo unificado (Prepago / Free models) | [Obtener API Key en OpenRouter](https://openrouter.ai/keys) |
| **OpenAI** | `gpt-4o` / `gpt-4o-mini` | Pago por uso (API oficial) | [Obtener API Key en OpenAI Platform](https://platform.openai.com/api-keys) |
| **Ollama** | `llama3.2-vision` | 100% Local y sin conexión a internet | [Descargar Ollama](https://ollama.com/) |

### ⚡ Bajo Consumo de Tokens y Compresión Inteligente
YText Studio está diseñado para reducir al mínimo el consumo de tokens en cada análisis:

- **Compresión Dual sin pérdida de calidad:** Aunque cargues una fotografía pesada en 4K o Full HD, la aplicación genera internamente una copia ultraligera en formato **WebP (`640 px`, menos de `40 KB`)** exclusiva para que la IA la analice rápido y ahorrando más del **80% en tokens de visión**, mientras **conserva tu imagen original intacta** para exportar tu miniatura en máxima definición.
- **Arquitectura *One-Shot* (0 tokens al editar):** Solo se consumen tokens en el instante en que presionas **"Analizar"**. Todos los ajustes posteriores (mover textos, cambiar fuentes, colores, degradados, sombras 3D, cajas, stickers y exportar) ocurren 100% en tu computadora y consumen **0 tokens**.
- **Consumo y costo promedio por solicitud:** **~1,800 tokens totales** por análisis (~258 tokens de visión + ~900 de instrucciones + ~650 de respuesta con las propuestas):
  - Con el nivel gratuito de **Google Gemini Flash** u **Ollama Local**: **$0.00 USD**.
  - Con saldo de pago (`gemini-2.0-flash` / `gpt-4o-mini`): **`~$0.0004 USD` por análisis** (más de **2,500 análisis completos por cada $1 USD**).

### Descarga para Escritorio (Windows y macOS)
Si prefieres usar la aplicación directamente en tu computadora sin instalar herramientas de programación:

1. Entra a la sección de **[Releases](../../releases)** de este repositorio.
2. Descarga e instala el archivo correspondiente a tu sistema:
   - 🪟 **Windows:** Ejecutable `.exe` o instalador `.msi`.
   - 🍏 **macOS:** Imagen `.dmg`.

---

<br>

<div align="center">
  <h3>🛠️ Documentación para Desarrolladores</h3>
</div>

### Arquitectura Técnica

YText Studio está diseñado bajo una arquitectura **Local-First / Zero-Backend**: todo el procesamiento de visión, renderizado gráfico y exportación se ejecuta directamente en el cliente sin servidores intermedios ni bases de datos externas.

- **Pipeline de Visión y Dirección de Arte IA (`src/core/lmm/`):** Adaptador multimodal compatible con Google Gemini, OpenRouter, OpenAI y Ollama. Comprime la imagen en cliente vía `OffscreenCanvas` (WebP 640px) para análisis *one-shot* de espacio negativo, detección de sujeto y generación estructurada en JSON con sanitización estricta.
- **Motor Gráfico Canvas 2D (`src/core/canvas/`):** Loop de renderizado vectorial acelerado por hardware a 60–120 FPS, desacoplado del ciclo de reconciliación de React. Ejecuta trazado concéntrico multipasada para contornos limpios, extrusión de sombras 3D a 45°, composición de stickers con silueta troquelada y transformaciones afines mediante `DOMMatrix`.
- **Layout Determinista y Safe Zones (`src/core/layout/`, `src/core/safezones/`):** Posicionamiento geométrico por cuadrantes y detección de colisiones AABB en tiempo real contra la zona reservada del badge de duración de YouTube.
- **Thumbnail Readability Index (`src/core/metrics/ReadabilityCalculator.ts`):** Evaluación algorítmica reactiva y holística multi-línea que audita densidad de palabras, tamaño de fuente proyectado en pantallas móviles (`320×180 px`) y protección de contraste por segmento.
- **Exportador Lossless (`src/core/canvas/OffscreenExporter.ts`):** Rasterizado en buffer virtual independiente del monitor a `1280×720` y `1920×1080` con interpolación bicúbica de alta calidad (`imageSmoothingQuality = 'high'`).
- **Internacionalización Reactiva (`src/i18n/`):** Motor tipado ligero en TypeScript con soporte en vivo para Español (`es`) e Inglés (`en`) sin dependencias externas.
- **Empaquetado Nativo (`src-tauri/`):** Aplicación de escritorio multiplataforma construida sobre Tauri v2 y Rust, con pipeline de publicación automatizada en GitHub Actions (`.github/workflows/release-desktop.yml`).

### Requisitos de Entorno

- **Node.js:** v18+ (recomendado v22 LTS).
- **Rust Toolchain:** Solo requerido si deseas compilar el binario nativo de escritorio localmente ([rustup.rs](https://rustup.rs/)).

### Instalación y Comandos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/ytext-studio.git
cd ytext-studio

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo web (Vite)
npm run dev

# 4. Iniciar aplicación de escritorio en modo desarrollo (Tauri)
npm run tauri:dev

# 5. Ejecutar suite de pruebas unitarias (Vitest)
npm test

# 6. Compilar versión web para producción
npm run build

# 7. Compilar instaladores nativos de escritorio (.exe / .msi / .dmg)
npm run tauri:build
```

---

## ⚖️ Licencia y Exención de Responsabilidad (Disclaimer)

Este proyecto es de código abierto y se distribuye de forma gratuita bajo la **[Licencia MIT](LICENSE)**.

Al descargar, instalar, compilar o utilizar **YText Studio**, aceptas de forma expresa las siguientes condiciones de exención de responsabilidad:

1. **Entrega "Tal Cual" (*"AS IS"*) y Limitación de Responsabilidad:**  
   El software se proporciona de manera gratuita **"TAL CUAL"**, sin garantía de ningún tipo, expresa o implícita. En ningún caso el autor o los colaboradores serán responsables de ningún reclamo, demanda, daño directo, indirecto, incidental o consecuente, pérdida de datos o interrupción de actividad derivada de la descarga, instalación o uso de esta aplicación.
2. **Uso y Costos de APIs de Terceros:**  
   La aplicación permite conectar servicios externos de Inteligencia Artificial (Google Gemini, OpenRouter, OpenAI, etc.) mediante claves proporcionadas por el propio usuario. El usuario es el **único responsable** del resguardo de sus claves, del cumplimiento de los términos de servicio de dichos proveedores y de cualquier cargo o facturación que se derive del consumo de sus cuentas.
3. **Propiedad Intelectual, Contenido y Plataformas:**  
   El usuario asume la **total y exclusiva responsabilidad legal** sobre las fotografías, imágenes, textos, tipografías y composiciones que procese, genere, exporte o publique con esta herramienta. El autor del software no asume ninguna responsabilidad por infracciones de derechos de autor (*copyright*), marcas registradas, políticas de monetización, sanciones de canales o por el rendimiento comercial de los contenidos publicados en YouTube o cualquier otra plataforma.
