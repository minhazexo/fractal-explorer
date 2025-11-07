import React from 'react';
import type { ViewState } from '../types';
import { PALETTES, PaletteName } from '../lib/palettes';

interface Props {
  state: ViewState;
  onChange: (v: Partial<ViewState>) => void;
}

export default function ControlPanel({ state, onChange }: Props) {
  const paletteNames = Object.keys(PALETTES) as PaletteName[];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          className={`btn ${state.mode === 'mandelbrot' ? 'border-accent' : ''}`}
          onClick={() => onChange({ mode: 'mandelbrot' })}
        >
          Mandelbrot
        </button>
        <button
          className={`btn ${state.mode === 'julia' ? 'border-accent' : ''}`}
          onClick={() => onChange({ mode: 'julia' })}
        >
          Julia
        </button>
      </div>

      <div>
        <div className="panel-title mb-1">Iterations</div>
        <input
          className="slider"
          type="range"
          min={50}
          max={2000}
          value={state.maxIter}
          onChange={(e) => onChange({ maxIter: Number(e.target.value) })}
        />
        <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          Max Iter: {state.maxIter}
        </div>
      </div>

      {state.mode === 'julia' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="panel-title mb-1">Julia Cx</div>
            <input
              type="number"
              className="w-full bg-transparent border border-[var(--glass-border)] rounded px-2 py-1 text-sm"
              value={state.juliaCx}
              step="0.001"
              onChange={(e) => onChange({ juliaCx: Number(e.target.value) })}
            />
          </div>
          <div>
            <div className="panel-title mb-1">Julia Cy</div>
            <input
              type="number"
              className="w-full bg-transparent border border-[var(--glass-border)] rounded px-2 py-1 text-sm"
              value={state.juliaCy}
              step="0.001"
              onChange={(e) => onChange({ juliaCy: Number(e.target.value) })}
            />
          </div>
        </div>
      )}

      <div>
        <div className="panel-title mb-1">Palette</div>
        <select
          className="w-full bg-transparent border border-[var(--glass-border)] rounded px-2 py-1 text-sm"
          value={state.palette}
          onChange={(e) => onChange({ palette: e.target.value })}
        >
          {paletteNames.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <div className="panel-title mb-1">Color interpolation</div>
        <div className="flex gap-2">
          <button
            className={`btn ${state.interpolation === 'smooth' ? 'shadow-glow' : ''}`}
            onClick={() => onChange({ interpolation: 'smooth' })}
          >
            Smooth
          </button>
          <button
            className={`btn ${state.interpolation === 'escape' ? 'shadow-glow' : ''}`}
            onClick={() => onChange({ interpolation: 'escape' })}
          >
            Escape time
          </button>
          <button
            className={`btn ${state.interpolation === 'orbit' ? 'shadow-glow' : ''}`}
            onClick={() => onChange({ interpolation: 'orbit' })}
          >
            Orbit trap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          className="btn"
          onClick={() => onChange({ centerX: -0.5, centerY: 0.0, scale: 350 })}
        >
          Reset View
        </button>
        <button
          className="btn"
          onClick={() => onChange({ mode: state.mode === 'mandelbrot' ? 'julia' : 'mandelbrot' })}
        >
          Toggle Mode
        </button>
      </div>
    </div>
  );
}
