import React from 'react';

interface Props {
  theme: 'dark' | 'amoled' | 'light' | 'gradient';
  onChange: (t: Props['theme']) => void;
}

export default function ThemeSwitcher({ theme, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {(['dark','amoled','light','gradient'] as const).map(t => (
        <button
          key={t}
          aria-label={`Theme ${t}`}
          className={`w-8 h-8 rounded-full border border-[var(--glass-border)] ${theme===t ? 'shadow-glow' : ''}`}
          style={{
            background: t === 'dark' ? '#0b0f19' :
                        t === 'amoled' ? '#000000' :
                        t === 'light' ? '#f8fafc' : 'linear-gradient(135deg,#1a0e2a,#04131f)'
          }}
          onClick={() => onChange(t)}
        />
      ))}
    </div>
  );
}
