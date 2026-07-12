const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-12 h-12',
  lg: 'w-24 h-24',
};

export default function NeonCatLoader({ size = 'md', className = '' }) {
  const sizeClass = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <svg
      className={`${sizeClass} ${className} neon-cat-loader`}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cargando…"
      role="img"
    >
      <defs>
        <filter id="neon-cat-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Gato */}
      <g filter="url(#neon-cat-glow)" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

        {/* Cabeza */}
        <ellipse cx="32" cy="22" rx="13" ry="11" />

        {/* Orejas */}
        <polyline points="21,14 18,7 25,13" />
        <polyline points="43,14 46,7 39,13" />

        {/* Nariz */}
        <polygon points="32,25 30.5,27 33.5,27" />

        {/* Bigotes izquierda */}
        <line x1="19" y1="26" x2="29" y2="27" />
        <line x1="19" y1="29" x2="29" y2="28.5" />

        {/* Bigotes derecha */}
        <line x1="45" y1="26" x2="35" y2="27" />
        <line x1="45" y1="29" x2="35" y2="28.5" />

      </g>
    </svg>
  );
}
