import React from 'react';
import CatHeadLoader from './CatHeadLoader';

export default function LoaderGlobal() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center w-screen h-screen"
      style={{ background: '#0B0914' }}
      aria-label="Cargando aplicación…"
      role="status"
    >
      <div
        className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(109,40,217,0.10) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(165,180,252,0.07) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Constelación Felina centrada */}
      <div className="relative flex items-center justify-center">
        <CatHeadLoader size="lg" />
      </div>
      <p
        className="mt-10 font-serif-display text-[10px] tracking-[0.45em] uppercase"
        style={{ color: 'rgba(196,181,253,0.45)' }}
      >
        Iniciando ◊
      </p>
    </div>
  );
}

