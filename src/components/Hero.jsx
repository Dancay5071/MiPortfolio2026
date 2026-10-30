import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import NeonCatLoader from './NeonCatLoader';

const STAGE = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.05,
      when: 'beforeChildren',
    },
  },
};

//Estrellas
function PolarStarIcon({ className = "" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2L13 11L22 12L13 13L12 22L11 13L2 12L11 11Z" />
    </svg>
  );
}

// Marco de Avatar
function AvatarFrame({ imgUrl, name }) {
  const [loaded, setLoaded] = useState(false);
  const [prevUrl, setPrevUrl] = useState(imgUrl);

  if (imgUrl !== prevUrl) {
    setPrevUrl(imgUrl);
    setLoaded(false);
  }

  const hasImage = Boolean(imgUrl);

  return (

    <div className="group relative flex items-center justify-center cursor-default">

      <div
        className={[
          'hidden md:block absolute rounded-full pointer-events-none',
          'bg-fuchsia-900/20 blur-3xl',
          'inset-[-20px]',
          'transition-[opacity,inset] duration-[2000ms] ease-in-out',
          'group-hover:inset-[-36px] group-hover:bg-fuchsia-800/28',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* Anillo base - animado en desktop, estático o invisible en móvil */}
      <div
        className="hidden md:block absolute inset-[-6px] rounded-full border border-indigo-300/10 animate-[glow-spin_24s_linear_infinite] motion-reduce:animate-none pointer-events-none transition-[border-color] duration-[2000ms] ease-in-out group-hover:border-indigo-300/28"
        aria-hidden="true"
      />

      {/* Anillo de hover - oculto en móvil */}
      <div
        className={[
          'hidden md:block absolute inset-[-12px] rounded-full pointer-events-none',
          'border border-indigo-400/0',
          'transition-[border-color,transform,box-shadow] duration-[2000ms] ease-in-out motion-reduce:transition-none motion-reduce:transform-none',
          'group-hover:border-indigo-300/16',
          'group-hover:rotate-180',
          'group-hover:shadow-[0_0_20px_rgba(165,180,252,0.10)]',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* Círculo principal*/}
      <div
        className={[
          'relative rounded-full border border-indigo-300/30 overflow-hidden bg-[#0B0914]',
          'w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48',
          'shadow-[0_0_30px_rgba(165,180,252,0.10)]',
          'transition-all duration-[1500ms] ease-in-out motion-reduce:transition-none motion-reduce:transform-none',
          'group-hover:-translate-y-2',
          'group-hover:border-white/90',
          'group-hover:shadow-[0_0_50px_rgba(192,132,252,0.40),0_12px_30px_rgba(0,0,0,0.30),0_0_25px_rgba(255,255,255,0.4),inset_0_0_15px_rgba(255,255,255,0.2)]',
        ].join(' ')}
        id="hero-avatar"
      >
        {(!hasImage || !loaded) && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <NeonCatLoader size="md" />
          </div>
        )}

        {hasImage && (
          <img
            src={imgUrl}
            alt={`Foto de perfil de ${name}`}
            referrerPolicy="no-referrer"
            loading="eager"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            ref={(img) => {
              if (img && img.complete) {
                setLoaded(true);
              }
            }}
            className={[
              'w-full h-full object-cover rounded-full',
              'transition-opacity duration-700',
              loaded ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            draggable="false"
          />
        )}
        <div
          className="hidden md:block absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(160deg, rgba(165,180,252,0.07) 0%, transparent 50%, rgba(139,92,246,0.06) 100%)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}


export default function Hero({ profile, onContactClick, onCvClick }) {
  const name = profile?.name || 'Daniela Cabrera';
  const title = profile?.title || 'Técnica en programación & Desarrolladora de software';
  const imgUrl = profile?.url_foto || '';

  const shouldReduceMotion = useReducedMotion();

  const DYNAMIC_PHASE_AURA = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: shouldReduceMotion ? 0 : 2.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const DYNAMIC_PHASE_AVATAR = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: shouldReduceMotion ? 1 : 0.95 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: shouldReduceMotion ? 0 : 2.2, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const DYNAMIC_PHASE_TEXT = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 2.0, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const DYNAMIC_PHASE_SOCIAL = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 1.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (

    <motion.div
      className="relative w-full"
      variants={STAGE}
      initial="hidden"
      animate="visible"
    >

      <motion.div
        variants={DYNAMIC_PHASE_AURA}
        className="contents"
        aria-hidden="true"
      >
       
      </motion.div>

      {/*Contenedor Principal*/}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 lg:gap-20 py-2 md:py-4 px-4 md:px-8 w-full">

        <motion.div variants={DYNAMIC_PHASE_AVATAR}>
          <AvatarFrame imgUrl={imgUrl} name={name} />
        </motion.div>

        <div
          className={[
            'group',
            'flex flex-col gap-3 md:gap-3.5 items-center md:items-start text-center md:text-left',
            'transition-all duration-[1500ms] ease-in-out',
            'hover:-translate-y-1',
          ].join(' ')}
        >

          <motion.div
            variants={DYNAMIC_PHASE_TEXT}
            className="flex flex-col gap-3 md:gap-3.5 items-center md:items-start w-full"
          >
            <p
              className="flex items-center gap-2 text-[11px] tracking-[0.25em] text-indigo-300/80 uppercase select-none"
              aria-hidden="true"
            >
              <span className="text-amber-200/90 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">◊</span>
              <span>Portfolio</span>
            </p>

            {/* Nombre */}
            <h1
              className={[
                'font-serif font-medium text-4xl sm:text-5xl leading-tight tracking-wide',
                'text-indigo-50',
                'transition-all duration-700 ease-in-out motion-reduce:transition-none',
                'md:group-hover:text-amber-100 md:group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]',
              ].join(' ')}
            >
              {name}
            </h1>

            {/* Línea divisoria */}
            <div
              className="flex items-center gap-3 w-full max-w-xs md:max-w-none"
              aria-hidden="true"
            >
              <span className="text-amber-200/90 text-xs drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">◊</span>
              <div className="flex-1 h-px relative overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-transparent" />
                <motion.div
                  className="absolute top-0 bottom-0 w-1/2"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)',
                    filter: 'blur(1px)'
                  }}
                  animate={{ left: ['-50%', '150%'] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
                />
              </div>
            </div>

            {/* Título profesional con fallback defensivo */}
            <p className="uppercase text-[13px] tracking-[0.22em] text-indigo-200 leading-relaxed">
              {title?.trim() ? title : 'Técnica en Programación & Desarrolladora de Software'}
            </p>
          </motion.div>

          {/* Bloque de Contacto / Redes */}
          <motion.div variants={DYNAMIC_PHASE_SOCIAL} className="mt-5 md:mt-6 w-full flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3.5 flex-wrap">
            {/* Botón Principal Iniciar Contacto */}
            <button
              onClick={onContactClick}
              className={[
                'group relative flex items-center gap-3 px-6 py-3 rounded-xl',
                'bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-violet-900/40',
                'backdrop-blur-md border border-violet-400/35',
                'font-sans-body text-[11px] font-medium tracking-[0.25em] uppercase text-indigo-100',
                'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
                'hover:border-amber-300/60 hover:text-amber-100 hover:shadow-[0_0_30px_rgba(251,191,36,0.25)]',
                'hover:scale-[1.03] active:scale-[0.98]',
                'transition-all duration-400 ease-out cursor-pointer',
              ].join(' ')}
              aria-label="Abrir formulario para iniciar contacto"
            >
              <span className="text-amber-300/80 text-[10px] group-hover:text-amber-200 group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] transition-all duration-400">
                ◊
              </span>
              <span className="relative font-semibold">
                INICIAR CONTACTO
              </span>
            </button>

            {/* Botón ver CV */}
            <button
              type="button"
              onClick={onCvClick}
              className={[
                'group relative flex items-center gap-2.5 px-6 py-3 rounded-xl cursor-pointer',
                'bg-white/5 hover:bg-white/10 backdrop-blur-md',
                'border border-white/15 hover:border-indigo-400/50',
                'font-sans-body text-[11px] font-medium tracking-[0.22em] uppercase text-indigo-100',
                'shadow-[0_0_20px_rgba(99,102,241,0.12)] hover:shadow-[0_0_25px_rgba(165,180,252,0.20)]',
                'hover:scale-[1.03] active:scale-[0.98]',
                'transition-all duration-400 ease-out',
              ].join(' ')}
              title="Solicitar acceso al Currículum Vitae"
              aria-label="Abrir formulario para descargar el Currículum Vitae"
            >
              <span className="relative font-semibold">
                Ver CV
              </span>
              <span className="text-amber-300/80 text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                ↗
              </span>
            </button>

          </motion.div>


        </div>
      </div>

    </motion.div>
  );
}

