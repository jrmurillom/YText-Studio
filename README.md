<div align="center">

<!-- Playmark SVG de YText Studio -->
<svg width="72" height="52" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M136 28C136 12.536 123.464 0 108 0H32C16.536 0 4 12.536 4 28V72C4 87.464 16.536 100 32 100H108C123.464 100 136 87.464 136 72V28Z" fill="#FF0000"/>
  <path d="M56 34.5C56 32.96 57.67 32 59 32.77L88.5 48.27C89.83 49.04 89.83 50.96 88.5 51.73L59 67.23C57.67 68 56 67.04 56 65.5V34.5Z" fill="white"/>
</svg>

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

</div>

---

**YText Studio** es una aplicación gratuita y de código abierto que acelera la creación de miniaturas para YouTube combinando **Inteligencia Artificial visual** con un **editor gráfico fácil de usar sin previo conocimiento de software profesional**.

En lugar de empezar desde cero sin saber qué fuente elegir, dónde ubicar el texto o qué colores contrastan mejor, la IA estudia tu imagen, sintetiza tu idea en palabras gancho (*hooks*) y diseña múltiples propuestas visuales listas para aplicar y personalizar en un clic.

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

## Requisitos y Descarga

### Requisitos
- **100% Gratuito:** Sin suscripciones, sin cuentas obligatorias y sin marcas de agua.
- **Conexión de IA:** Solo necesitas una clave de API (*API Key*) de **Google Gemini** (cuenta con nivel gratuito), **OpenRouter**, **OpenAI** o un modelo local con **Ollama**. Tu clave se guarda únicamente en tu propio equipo.

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
