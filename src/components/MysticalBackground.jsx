import React from 'react';

export default function MysticalBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: -10, background: '#07050A' }}
      aria-hidden="true"
    >

      {/* Fallback para móviles */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(109, 40, 217, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(30, 27, 75, 0.2) 0%, transparent 60%)'
        }}
        aria-hidden="true"
      />

      <svg
        width="0"
        height="0"
        className="hidden motion-reduce:hidden"
        style={{ position: 'absolute', overflow: 'hidden' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="smoke-effect" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="linearRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves="3"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.01; 0.015; 0.01"
                dur="40s"
                repeatCount="indefinite"
              />
            </feTurbulence>

            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 20 -5"
              in="noise"
              result="coloredNoise"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="coloredNoise"
              scale="120"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="hidden md:block absolute rounded-full motion-reduce:animate-none"
        style={{
          width: '65vw',
          height: '65vw',
          maxWidth: '800px',
          maxHeight: '800px',
          bottom: '-10%',
          left: '-10%',
          background: 'radial-gradient(circle at center, rgba(109, 40, 217, 0.10) 0%, rgba(109, 40, 217, 0.04) 40%, transparent 70%)',
          filter: 'url(#smoke-effect) blur(120px)',
          animation: 'mystic-drift-1 28s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      <div
        className="hidden md:block absolute rounded-full motion-reduce:animate-none"
        style={{
          width: '70vw',
          height: '70vw',
          maxWidth: '900px',
          maxHeight: '900px',
          bottom: '-15%',
          right: '-8%',
          background: 'radial-gradient(circle at center, rgba(55, 48, 163, 0.09) 0%, rgba(55, 48, 163, 0.03) 45%, transparent 70%)',
          filter: 'url(#smoke-effect) blur(120px)',
          animation: 'mystic-drift-2 34s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      <div
        className="hidden md:block absolute rounded-full motion-reduce:animate-none"
        style={{
          width: '50vw',
          height: '50vw',
          maxWidth: '650px',
          maxHeight: '650px',
          top: '10%',
          right: '5%',
          background: 'radial-gradient(circle at center, rgba(134, 25, 143, 0.09) 0%, rgba(134, 25, 143, 0.03) 50%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'mystic-drift-3 24s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      <div
        className="hidden md:block absolute rounded-full motion-reduce:animate-none"
        style={{
          width: '80vw',
          height: '80vw',
          maxWidth: '1000px',
          maxHeight: '1000px',
          top: '25%',
          left: '10%',
          background: 'radial-gradient(circle at center, rgba(30, 27, 75, 0.10) 0%, rgba(15, 23, 42, 0.06) 55%, transparent 75%)',
          filter: 'blur(150px)',
          animation: 'mystic-drift-4 40s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -5,
          pointerEvents: 'none',
          opacity: 0.035,
          mixBlendMode: 'soft-light',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
        }}
      />

    </div>
  );
}
