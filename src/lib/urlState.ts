import type { ViewState } from '../types';

export function encodeState(s: Partial<ViewState>): string {
  const p = new URLSearchParams();

  if (s.mode) p.set('mode', s.mode);
  if (s.juliaCx !== undefined) p.set('cx', String(s.juliaCx));
  if (s.juliaCy !== undefined) p.set('cy', String(s.juliaCy));
  if (s.centerX !== undefined) p.set('x', String(s.centerX));
  if (s.centerY !== undefined) p.set('y', String(s.centerY));
  if (s.scale !== undefined) p.set('scale', String(s.scale));
  if (s.maxIter !== undefined) p.set('iter', String(s.maxIter));
  if (s.palette) p.set('palette', s.palette);
  if (s.theme) p.set('theme', s.theme);
  if (s.interpolation) p.set('interp', s.interpolation);

  return `?${p.toString()}`;
}

export function parseState(): Partial<ViewState> {
  const p = new URLSearchParams(location.search);
  const num = (k: string) => {
    const v = p.get(k);
    if (v === null) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    mode: (p.get('mode') as ViewState['mode']) || undefined,
    juliaCx: num('cx'),
    juliaCy: num('cy'),
    centerX: num('x'),
    centerY: num('y'),
    scale: num('scale'),
    maxIter: num('iter'),
    palette: p.get('palette') || undefined,
    theme: (p.get('theme') as ViewState['theme']) || undefined,
    interpolation: (p.get('interp') as ViewState['interpolation']) || undefined
  };
}
