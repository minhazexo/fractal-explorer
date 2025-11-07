import React, { useEffect, useRef } from 'react';
import { createProgram, QUAD_VERT, createQuad } from '../lib/glUtils';
import { attachGestures } from '../lib/gestures';
import { createFPSMeter } from '../lib/fps';
import type { ViewState } from '../types';

// Load shaders as strings
// @ts-ignore: allow importing GLSL files as strings
// Load shaders as raw strings
// Vite will treat .glsl as plain text
import commonSrc from '../shaders/common.glsl?raw';



function buildFragment(common: string) {
  // We use common as the fragment directly
  // Single shader handles both modes via u_mode
  return common;
}

interface Props {
  view: ViewState;
  palette: string[];
  onViewChange: (v: Partial<ViewState>) => void;
  onFPS: (fps: number) => void;
}

export default function FractalCanvas({ view, palette, onViewChange, onFPS }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
  const rafRef = useRef<number>(0);
  const lastInteractionRef = useRef<number>(performance.now());
  const exportListenerRef = useRef<(e: Event) => void>();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
    if (!gl) {
      alert('WebGL2 not supported');
      return;
    }
    glRef.current = gl;

    const fragSource = buildFragment(commonSrc);
    const prog = createProgram(gl, QUAD_VERT, fragSource);
    progRef.current = prog;

    const { vao } = createQuad(gl);
    vaoRef.current = vao;

    const locs = {
      u_resolution: gl.getUniformLocation(prog, 'u_resolution'),
      u_time: gl.getUniformLocation(prog, 'u_time'),
      u_maxIter: gl.getUniformLocation(prog, 'u_maxIter'),
      u_center: gl.getUniformLocation(prog, 'u_center'),
      u_scale: gl.getUniformLocation(prog, 'u_scale'),
      u_juliaC: gl.getUniformLocation(prog, 'u_juliaC'),
      u_mode: gl.getUniformLocation(prog, 'u_mode'),
      u_interp: gl.getUniformLocation(prog, 'u_interp'),
      u_paletteSize: gl.getUniformLocation(prog, 'u_paletteSize'),
      u_palette: [...Array(8)].map((_, i) => gl.getUniformLocation(prog, `u_palette[${i}]`))
    };

    const fps = createFPSMeter();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const gestureCleanup = attachGestures(canvas, {
      onWheel: (_dx, dy) => {
        lastInteractionRef.current = performance.now();
        const factor = Math.exp(-dy * 0.0015);
        onViewChange({ scale: view.scale * factor });
      },
      onPan: (dx, dy) => {
        lastInteractionRef.current = performance.now();
        // Translate in complex plane: dx pixels -> dx/u_scale units
        onViewChange({
          centerX: view.centerX - dx / view.scale,
          centerY: view.centerY + dy / view.scale
        });
      },
      onPinch: (d) => {
        lastInteractionRef.current = performance.now();
        onViewChange({ scale: view.scale * d });
      },
      onTap: (x, y, buttons) => {
        lastInteractionRef.current = performance.now();
        // Tap sets Julia seed (right-click/secondary toggles sign)
        const rect = canvas.getBoundingClientRect();
        const uv = [(x) / canvas.width, (y) / canvas.height] as const;
        const cx = view.centerX + (uv[0] * canvas.width - canvas.width / 2) / view.scale;
        const cy = view.centerY + (uv[1] * canvas.height - canvas.height / 2) / view.scale;
        if (view.mode === 'julia') {
          const sign = (buttons === 2) ? -1 : 1;
          onViewChange({ juliaCx: sign * cx, juliaCy: sign * cy });
        } else {
          // Switch to Julia using clicked point as seed
          onViewChange({ mode: 'julia', juliaCx: cx, juliaCy: cy });
        }
      }
    });

    const render = () => {
      const now = performance.now();
      const gl = glRef.current!;
      const prog = progRef.current!;
      gl.useProgram(prog);
      gl.bindVertexArray(vaoRef.current);

      const width = canvas.width;
      const height = canvas.height;

      // Dynamic resolution scaling: during interaction, lower iteration for responsiveness
      const interacting = (now - lastInteractionRef.current) < 200;
      const iter = interacting ? Math.max(100, Math.floor(view.maxIter * 0.4)) : view.maxIter;

      gl.uniform2f(locs.u_resolution, width, height);
      gl.uniform1f(locs.u_time, now * 0.001);
      gl.uniform1i(locs.u_maxIter, iter);
      gl.uniform2f(locs.u_center, view.centerX, view.centerY);
      gl.uniform1f(locs.u_scale, view.scale);
      gl.uniform2f(locs.u_juliaC, view.juliaCx, view.juliaCy);
      gl.uniform1i(locs.u_mode, view.mode === 'mandelbrot' ? 0 : 1);
      gl.uniform1i(locs.u_interp, view.interpolation === 'smooth' ? 0 : (view.interpolation === 'escape' ? 1 : 2));

      // palette uniforms (convert hex to linear RGB)
      const toRGB = (hex: string) => {
        const h = hex.replace('#','');
        const r = parseInt(h.slice(0,2),16)/255;
        const g = parseInt(h.slice(2,4),16)/255;
        const b = parseInt(h.slice(4,6),16)/255;
        return [r,g,b] as const;
      };
      const cols = palette.slice(0,8).map(toRGB);
      gl.uniform1i(locs.u_paletteSize, cols.length);
      for (let i=0;i<8;i++){
        const c = cols[i] || cols[cols.length-1] || [0,0,0];
        gl.uniform3f(locs.u_palette[i], c[0], c[1], c[2]);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const f = fps.tick();
      if (f) onFPS(f);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    // Export PNG
    const onExport = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const targetRes = detail.resolution || 3840;
      const aspect = canvas.height / canvas.width;
      const tmp = document.createElement('canvas');
      tmp.width = targetRes;
      tmp.height = Math.round(targetRes * aspect);
      const gl2 = tmp.getContext('webgl2', { preserveDrawingBuffer: true })!;
      const prog2 = createProgram(gl2, QUAD_VERT, buildFragment(commonSrc));
      const { vao: vao2 } = createQuad(gl2);

      // Render once at full iter, full resolution
      gl2.useProgram(prog2);
      gl2.bindVertexArray(vao2);
      gl2.viewport(0,0,tmp.width,tmp.height);

      const loc2 = {
        u_resolution: gl2.getUniformLocation(prog2, 'u_resolution'),
        u_time: gl2.getUniformLocation(prog2, 'u_time'),
        u_maxIter: gl2.getUniformLocation(prog2, 'u_maxIter'),
        u_center: gl2.getUniformLocation(prog2, 'u_center'),
        u_scale: gl2.getUniformLocation(prog2, 'u_scale'),
        u_juliaC: gl2.getUniformLocation(prog2, 'u_juliaC'),
        u_mode: gl2.getUniformLocation(prog2, 'u_mode'),
        u_interp: gl2.getUniformLocation(prog2, 'u_interp'),
        u_paletteSize: gl2.getUniformLocation(prog2, 'u_paletteSize'),
        u_palette: [...Array(8)].map((_, i) => gl2.getUniformLocation(prog2, `u_palette[${i}]`))
      };

      gl2.uniform2f(loc2.u_resolution, tmp.width, tmp.height);
      gl2.uniform1f(loc2.u_time, performance.now() * 0.001);
      gl2.uniform1i(loc2.u_maxIter, view.maxIter);
      gl2.uniform2f(loc2.u_center, view.centerX, view.centerY);
      // scale must adapt to new resolution to keep same world units per pixel
      const scaleFactor = tmp.width / canvas.width;
      gl2.uniform1f(loc2.u_scale, view.scale * scaleFactor);
      gl2.uniform2f(loc2.u_juliaC, view.juliaCx, view.juliaCy);
      gl2.uniform1i(loc2.u_mode, view.mode === 'mandelbrot' ? 0 : 1);
      gl2.uniform1i(loc2.u_interp, view.interpolation === 'smooth' ? 0 : (view.interpolation === 'escape' ? 1 : 2));
      const toRGB = (hex: string) => {
        const h = hex.replace('#','');
        const r = parseInt(h.slice(0,2),16)/255;
        const g = parseInt(h.slice(2,4),16)/255;
        const b = parseInt(h.slice(4,6),16)/255;
        return [r,g,b] as const;
      };
      const cols = palette.slice(0,8).map(toRGB);
      gl2.uniform1i(loc2.u_paletteSize, cols.length);
      for (let i=0;i<8;i++){
        const c = cols[i] || cols[cols.length-1] || [0,0,0];
        gl2.uniform3f(loc2.u_palette[i], c[0], c[1], c[2]);
      }

      gl2.drawArrays(gl2.TRIANGLES, 0, 6);
      const link = document.createElement('a');
      link.download = `fractal-${Date.now()}.png`;
      link.href = tmp.toDataURL('image/png');
      link.click();
    };
    exportListenerRef.current = onExport;
    document.addEventListener('fractal-export', onExport as EventListener);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gestureCleanup();
      document.removeEventListener('fractal-export', onExport as EventListener);
      gl.deleteProgram(progRef.current!);
      gl.deleteVertexArray(vaoRef.current!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update causes redraw automatically via RAF; uniforms read from view each frame.
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-label="Fractal canvas"
    />
  );
}
