import React, { useEffect, useRef } from 'react';
import { createProgram, QUAD_VERT, createQuad } from '../lib/glUtils';
import { attachGestures } from '../lib/gestures';
import { createFPSMeter } from '../lib/fps';
import type { ViewState } from '../types';

// Load shaders as raw strings (critical to avoid JS parsing errors)
import commonSrc from '../shaders/common.glsl?raw';

function buildFragment(common: string) {
  // We use common as the fragment directly
  // Single shader handles both modes via u_mode
  return common;
}

interface Props {
  view: ViewState;
  palette: string[]; // always an array
  onViewChange: (v: Partial<ViewState>) => void;
  onFPS: (fps: number) => void;
}

export default function FractalCanvas({ view, palette = [], onViewChange, onFPS }: Props) {
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

    const render = () => {
      const now = performance.now();
      const gl = glRef.current!;
      const prog = progRef.current!;
      gl.useProgram(prog);
      gl.bindVertexArray(vaoRef.current);

      const width = canvas.width;
      const height = canvas.height;

      // Dynamic resolution scaling
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

      // palette uniforms (safe guard against undefined)
      const toRGB = (hex: string) => {
        const h = hex.replace('#','');
        const r = parseInt(h.slice(0,2),16)/255;
        const g = parseInt(h.slice(2,4),16)/255;
        const b = parseInt(h.slice(4,6),16)/255;
        return [r,g,b] as const;
      };
      const cols = (palette || []).slice(0,8).map(toRGB);
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

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(progRef.current!);
      gl.deleteVertexArray(vaoRef.current!);
    };
  }, [palette, view, onViewChange, onFPS]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-label="Fractal canvas"
    />
  );
}
