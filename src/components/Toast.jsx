import React from 'react';

const VARIANTS = {
  success: {
    border:      'border-emerald-500/22',
    glow:        '0 0 24px rgba(16,185,129,0.12), 0 10px 40px -10px rgba(0,0,0,0.55)',
    icon:        '◊',
    iconClass:   'text-emerald-400/90 animate-pulse text-[10px]',
    dot:         'bg-emerald-500/18',
    textClass:   'text-emerald-100/90',
    label:       'ÉXITO',
    labelClass:  'text-emerald-500/40',
  },
  error: {
    border:      'border-rose-500/22',
    glow:        '0 0 24px rgba(244,63,94,0.10), 0 10px 40px -10px rgba(0,0,0,0.55)',
    icon:        '☽',
    iconClass:   'text-rose-400/80 text-sm leading-none',
    dot:         'bg-rose-500/15',
    textClass:   'text-rose-200/90',
    label:       'ERROR',
    labelClass:  'text-rose-500/40',
  },
  info: {
    border:      'border-indigo-400/20',
    glow:        '0 0 20px rgba(99,102,241,0.10), 0 10px 40px -10px rgba(0,0,0,0.55)',
    icon:        '·',
    iconClass:   'text-indigo-300/70 text-xl leading-none -mt-0.5',
    dot:         'bg-indigo-500/15',
    textClass:   'text-indigo-100/85',
    label:       'INFO',
    labelClass:  'text-indigo-400/40',
  },
  demo: {
    border:      'border-violet-400/30',
    glow:        '0 0 28px rgba(139,92,246,0.18), 0 10px 40px -10px rgba(0,0,0,0.55)',
    icon:        '◈',
    iconClass:   'text-violet-300/90 text-xs animate-pulse',
    dot:         'bg-violet-500/20',
    textClass:   'text-violet-100/90',
    label:       'DEMO',
    labelClass:  'text-violet-400/50',
  },
};

export default function Toast({ message, type = 'info' }) {
  const v = VARIANTS[type] ?? VARIANTS.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'relative overflow-hidden',
        'rounded-none',
        'px-5 py-3',
        'bg-[#0B0914]/82',
        'backdrop-blur-xl',
        `border ${v.border}`,
        'flex items-center gap-3',
        'max-w-[420px] min-w-[200px]',
        'pointer-events-auto',
        'mystic-toast-enter',
      ].join(' ')}
      style={{
        boxShadow: v.glow,
      }}
    >

      <div
        className="absolute top-0 left-8 right-8 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(226,217,254,0.12) 30%, rgba(226,217,254,0.20) 50%, rgba(226,217,254,0.12) 70%, transparent)',
        }}
        aria-hidden="true"
      />
      <span
        className={`relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${v.dot}`}
        aria-hidden="true"
      >
        <span className={v.iconClass}>{v.icon}</span>
      </span>

      {/* Cuerpo del mensaje */}
      <div className="flex-1 min-w-0">
        <p className={`text-[9px] font-mono-hud tracking-[0.25em] uppercase leading-none mb-0.5 ${v.labelClass}`}>
          {v.label}
        </p>
        {/* Mensaje principal */}
        <p className={`text-sm font-sans-body tracking-wide leading-snug truncate ${v.textClass}`}>
          {message}
        </p>
      </div>
      {type === 'demo' && (
        <span
          className="flex-shrink-0 text-[8px] font-mono-hud tracking-widest text-violet-400/35 uppercase border-l border-violet-500/20 pl-3"
          aria-hidden="true"
        >
          Solo<br />lectura
        </span>
      )}

    </div>
  );
}
