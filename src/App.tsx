import React, { useMemo, useState, useEffect } from 'react';
import FractalCanvas from './components/FractalCanvas';
import ControlPanel from './components/ControlPanel';
import Minimap from './components/Minimap';
import InfoPanel from './components/InfoPanel';
import ThemeSwitcher from './components/ThemeSwitcher';
import { PALETTES } from './lib/palettes';
import { parseState, encodeState } from './lib/urlState';
import type { ViewState } from './types';

const DEFAULT: ViewState = {
  mode: 'mandelbrot',
  centerX: -0.5,
  centerY: 0.0,
  scale: 350, // px per unit
  maxIter: 500,
  juliaCx: -0.7,
  juliaCy: 0.27015,
  palette: 'Aurora',
  theme: 'dark',
  interpolation: 'smooth'
};

export default function App() {
  const restored = parseState();
  const [state, setState] = useState<ViewState>({ ...DEFAULT, ...restored });
  const [fps, setFps] = useState(0);

  useEffect(() => {
    const url = encodeState(state);
    history.replaceState(null, '', url);
  }, [state]);

  const paletteColors = useMemo(() => PALETTES[state.palette as keyof typeof PALETTES], [state.palette]);

  return (
    <div className={`min-h-screen ${`theme-${state.theme}`}`}>
      {/* Canvas */}
      <div className="fixed inset-0">
        <FractalCanvas
          view={state}
          palette={paletteColors}
          onViewChange={(v) => setState((s) => ({ ...s, ...v }))}
          onFPS={(f) => setFps(f)}
        />
      </div>

      {/* Control panel */}
      <div className="absolute top-6 left-6 w-[340px] max-w-[92vw] glass rounded-2xl p-4 shadow-glow">
        <div className="flex items-center justify-between mb-2">
          <div className="panel-title">Fractal controls</div>
          <ThemeSwitcher theme={state.theme} onChange={(theme) => setState((s) => ({ ...s, theme }))} />
        </div>
        <ControlPanel
          state={state}
          onChange={(v) => setState((s) => ({ ...s, ...v }))}
        />
      </div>

      {/* Info panel */}
      <div className="absolute top-6 right-6 glass rounded-2xl p-4 w-[280px] max-w-[92vw]">
        <InfoPanel view={state} fps={fps} />
      </div>

      {/* Minimap */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass rounded-2xl p-2 w-[320px]">
        <Minimap view={state} onJump={(centerX, centerY) => setState((s) => ({ ...s, centerX, centerY }))} />
      </div>

      {/* Share/Export */}
      <div className="absolute bottom-6 right-6 glass rounded-2xl p-4 flex gap-2">
        <button
          className="btn"
          onClick={() => navigator.clipboard.writeText(location.href)}
        >
          Copy link
        </button>
        <button
          className="btn"
          onClick={() => document.dispatchEvent(new CustomEvent('fractal-export', { detail: { resolution: 3840 } }))}
        >
          Export PNG (4K)
        </button>
      </div>
    </div>
  );
}
