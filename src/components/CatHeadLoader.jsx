//Constelación Felina 

const SIZE_MAP = {
  sm: { w: 20,  h: 16  },
  md: { w: 56,  h: 45  },
  lg: { w: 112, h: 90  },
};

const STELLAR_NODES = [
  //estrellas grandes
  { cx: 12,  cy: 6,   r: 1.6, delay: '0s',    label: 'ear-left'    },
  { cx: 68,  cy: 6,   r: 1.6, delay: '0.8s',  label: 'ear-right'   },
  { cx: 40,  cy: 47,  r: 1.4, delay: '1.6s',  label: 'chin'        },
  //estrellas medianas
  { cx: 22,  cy: 20,  r: 0.9, delay: '0.3s',  label: 'ear-base-l'  },
  { cx: 58,  cy: 20,  r: 0.9, delay: '1.1s',  label: 'ear-base-r'  },
  { cx: 40,  cy: 33,  r: 0.8, delay: '0.6s',  label: 'nose'        },
  //estrellas pequeñas
  { cx: 10,  cy: 37,  r: 0.7, delay: '1.3s',  label: 'whisker-ll'  },
  { cx: 22,  cy: 38,  r: 0.5, delay: '1.5s',  label: 'whisker-lm'  },
  { cx: 70,  cy: 37,  r: 0.7, delay: '0.4s',  label: 'whisker-rr'  },
  { cx: 58,  cy: 38,  r: 0.5, delay: '0.2s',  label: 'whisker-rm'  },
];

export default function CatHeadLoader({ size = 'md', className = '' }) {
  const { w, h } = SIZE_MAP[size] ?? SIZE_MAP.md;

  const filterId  = `mystic-cat-glow-${size}`;
  const glowStarId = `mystic-star-glow-${size}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 80 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mystic-cat-loader mystic-cat-loader--${size}${className ? ` ${className}` : ''}`}
      aria-label="Cargando…"
      role="img"
      overflow="visible"
    >
      <defs>
        <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={glowStarId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx="40" cy="28" r="34"
        stroke="rgba(196,181,253,0.22)"
        strokeWidth="0.6"
        strokeDasharray="2 5"
        filter={`url(#${filterId})`}
        className="mystic-cat-halo"
      />

      <circle
        cx="40" cy="28" r="29"
        stroke="rgba(165,180,252,0.12)"
        strokeWidth="0.4"
        strokeDasharray="1 8"
        filter={`url(#${filterId})`}
        className="mystic-cat-halo mystic-cat-halo--inner"
      />

      <g
        filter={`url(#${filterId})`}
        stroke="rgba(196,181,253,0.75)"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mystic-cat-silhouette"
      >
        {/* Cabeza */}
        <ellipse cx="40" cy="30" rx="18" ry="14" />

        {/* Oreja izquierda */}
        <polyline points="22,20 12,6 28,18" />

        {/* Oreja derecha */}
        <polyline points="58,20 68,6 52,18" />

        {/* Nariz */}
        <polygon
          points="40,33 38.2,35.2 41.8,35.2"
          stroke="rgba(216,180,254,0.60)"
          strokeWidth="0.6"
        />

        {/* Bigotes izquierda */}
        <line x1="10" y1="37" x2="26" y2="38" strokeOpacity="0.55" />
        <line x1="12" y1="41" x2="26" y2="40" strokeOpacity="0.40" />

        {/* Bigotes derecha */}
        <line x1="70" y1="37" x2="54" y2="38" strokeOpacity="0.55" />
        <line x1="68" y1="41" x2="54" y2="40" strokeOpacity="0.40" />

        {/* Línea de conexión sutil entre bases de orejas */}
        <path
          d="M 22,20 Q 40,15 58,20"
          strokeWidth="0.4"
          strokeDasharray="1.5 3"
          strokeOpacity="0.35"
        />
      </g>

      <g filter={`url(#${glowStarId})`}>
        {STELLAR_NODES.map(({ cx, cy, r, delay, label }) => (
          <circle
            key={label}
            cx={cx}
            cy={cy}
            r={r}
            fill="rgba(226,217,254,0.90)"
            stroke="rgba(196,181,253,0.50)"
            strokeWidth="0.4"
            className="mystic-cat-star"
            style={{ animationDelay: delay }}
          />
        ))}
      </g>

      <circle
        cx="40" cy="34.1" r="0.8"
        fill="rgba(216,180,254,0.80)"
        className="mystic-cat-star mystic-cat-star--pulse"
        style={{ animationDelay: '0.9s' }}
        filter={`url(#${glowStarId})`}
      />
    </svg>
  );
}
