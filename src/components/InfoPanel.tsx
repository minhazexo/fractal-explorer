import React from 'react';
import type { ViewState } from '../types';

interface Props {
  view?: ViewState; // make it optional to be defensive
  fps?: number;
}

export default function InfoPanel({ view, fps = 0 }: Props) {
  if (!view) {
    return (
      <div className="space-y-2">
        <div className="panel-title">Renderer info</div>
        <div className="text-sm">Loading view state…</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="panel-title">Renderer info</div>

      <div className="text-sm">
        <span style={{ color: 'var(--muted)' }}>Mode:</span>{' '}
        {view.mode ? view.mode.toUpperCase() : '—'}
      </div>

      <div className="text-sm">
        <span style={{ color: 'var(--muted)' }}>Center:</span>{' '}
        {view.centerX?.toFixed(6) ?? '—'}, {view.centerY?.toFixed(6) ?? '—'}
      </div>

      <div className="text-sm">
        <span style={{ color: 'var(--muted)' }}>Scale:</span>{' '}
        {view.scale?.toFixed(2) ?? '—'} px/unit
      </div>

      <div className="text-sm">
        <span style={{ color: 'var(--muted)' }}>Iter:</span>{' '}
        {view.maxIter ?? '—'}
      </div>

      <div className="text-sm">
        <span style={{ color: 'var(--muted)' }}>FPS:</span> {fps}
      </div>

      {view.mode === 'julia' && (
        <div className="text-sm">
          <span style={{ color: 'var(--muted)' }}>Julia C:</span>{' '}
          {view.juliaCx?.toFixed(6) ?? '—'}, {view.juliaCy?.toFixed(6) ?? '—'}
        </div>
      )}

      <div className="text-sm">
        <span style={{ color: 'var(--muted)' }}>Palette:</span>{' '}
        {view.palette ?? '—'}
      </div>

      <div className="text-sm">
        <span style={{ color: 'var(--muted)' }}>Theme:</span>{' '}
        {view.theme ?? '—'}
      </div>
    </div>
  );
}
