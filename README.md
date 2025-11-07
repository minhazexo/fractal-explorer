# Fractal Explorer (React + WebGL2)

GPU-accelerated Mandelbrot & Julia explorer with smooth zoom/pan, palette themes, info panel, minimap, URL state, and PNG export.

## Features
- Real-time fractal rendering in WebGL2 with GLSL fragment shader
- Smooth wheel zoom, drag pan, pinch zoom (mobile), click-to-set Julia seed
- Toggle Mandelbrot/Julia, adjust max iterations
- Preset palettes (Aurora, Solar, Neon, Retro, Grayscale)
- Themes: Dark / AMOLED / Light / Gradient
- Info: coordinates, scale (px/unit), iterations, FPS, palette, theme
- Minimap with viewport rectangle; click to jump
- Shareable URLs with state encoded (mode, center, scale, iter, C, palette, theme, interpolation)
- PNG export up to 4K, consistent world scaling
- Dynamic resolution/iteration scaling during interaction for high FPS
- Double-buffer-like stable drawing via RAF and preserveDrawingBuffer

## Tech
- React 18 + Vite
- WebGL2 shaders
- TailwindCSS
- TypeScript

## Development
```bash
npm i
npm run dev
