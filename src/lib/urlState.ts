import type { ViewState } from '../types';

export function encodeState(s: ViewState): string {
  const p = new URLSearchParams();
  p.set('mode', s.mode);
  p.set('cx', s.juliaCx.toString());
  p.set('cy', s.juliaCy.toString());
  p.set('x', s.centerX.toString());
  p.set('y', s.centerY.toString());
  p.set('scale', s.scale.toString());
  p.set('iter', s.maxIter.toString());
  p.set('palette', s.palette);
  p.set('theme', s.theme);
  p.set('interp', s.interpolation);
  return `?${p.toString()}`;
}

export function parseState(): Partial<ViewState> {
  const p = new URLSearchParams(location.search);
  const num = (k: string, def: number) => {
    const v = p.get(k);
    if (!v) return def;
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };
  return {
    mode: (p.get('mode') as ViewState['mode']) || undefined,
    juliaCx: num('cx', undefined as any),
    juliaCy: num('cy', undefined as any),
    centerX: num('x', undefined as any),
    centerY: num('y', undefined as any),
    scale: num('scale', undefined as any),
    maxIter: num('iter', undefined as any),
    palette: p.get('palette') || undefined,
    theme: (p.get('theme') as ViewState['theme']) || undefined,
    interpolation: (p.get('interp') as ViewState['interpolation']) || undefined
  };
}
