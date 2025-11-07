import React, { useEffect, useRef } from 'react';
import type { ViewState } from '../types';

interface Props {
  view: ViewState;
  onJump: (x: number, y: number) => void;
}

export default function Minimap({ view, onJump }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w;
    canvas.height = h;

    // draw simple thumbnail: gradient background, viewport rectangle
    ctx.clearRect(0,0,w,h);
    const grd = ctx.createLinearGradient(0,0,w,h);
    grd.addColorStop(0,'#0b132b');
    grd.addColorStop(1,'#1c2541');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);

    // Approximate viewport rect mapping for Mandelbrot typical bounds (-2..1, -1..1)
    const worldWidth = 3;   // real range ~[-2,1]
    const worldHeight = 2;  // imag range ~[-1,1]
    // map center/scale to rectangle in minimap
    const pxPerUnit = Math.min(w / worldWidth, h / worldHeight);
    const cx = (view.centerX + 2) * pxPerUnit;
    const cy = (1 - (view.centerY + 1) / worldHeight) * h; // flip y
    const vw = (w / view.scale) * pxPerUnit;
    const vh = (h / view.scale) * pxPerUnit;

    ctx.strokeStyle = '#00ffd1';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - vw/2, cy - vh/2, vw, vh);
  }, [view.centerX, view.centerY, view.scale]);

  return (
    <div className="flex items-center gap-2">
      <canvas
        ref={ref}
        className="w-[220px] h-[120px] rounded-lg border border-[var(--glass-border)]"
        onClick={(e) => {
          const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          // map click to center jump
          const w = rect.width, h = rect.height;
          const worldWidth = 3, worldHeight = 2;
          const real = (x / w) * worldWidth - 2;
          const imag = (1 - y / h) * worldHeight - 1;
          onJump(real, imag);
        }}
      />
      <div>
        <div className="panel-title">Minimap</div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          Click to jump view
        </div>
      </div>
    </div>
  );
}
