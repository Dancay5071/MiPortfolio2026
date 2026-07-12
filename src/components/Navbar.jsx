import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MagneticButton from './MagneticButton';

const VEIL_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn', delay: 0.1 },
  },
};

// Contenedor de links
const NAV_LIST_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

// Item individual
const NAV_ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 22,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.50, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(3px)',
    transition: { duration: 0.20, ease: 'easeIn' },
  },
};

function SealButton({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={isOpen}
      aria-controls="mystical-mobile-nav"
      className={[
        'lg:hidden relative z-[60] rounded-md',
        'w-9 h-9 flex flex-col items-end justify-center gap-[5px]',
        'cursor-pointer',
        'transition-opacity duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0914]',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className="block h-px bg-indigo-200 rounded-full origin-right transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: '2rem',
          transform: isOpen
            ? 'rotate(-40deg) translateY(1px) scaleX(0.85)'
            : 'rotate(0deg) translateY(0) scaleX(1)',
          opacity: isOpen ? 0.85 : 1,
        }}
      />
      <span
        aria-hidden="true"
        className="block h-px bg-indigo-300/70 rounded-full transition-all duration-400 ease-out"
        style={{
          width: '1.5rem',
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scaleX(0)' : 'scaleX(1)',
        }}
      />
      <span
        aria-hidden="true"
        className="block h-px bg-indigo-200 rounded-full origin-right transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: '1rem',
          transform: isOpen
            ? 'rotate(40deg) translateY(-1px) scaleX(2.15)'
            : 'rotate(0deg) translateY(0) scaleX(1)',
          opacity: isOpen ? 0.85 : 1,
        }}
      />
    </button>
  );
}

function MysticalMobileMenu({ isOpen, onClose, navItems, activeTab, setActiveTab, session }) {
  const menuRef = React.useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const focusable = menuRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable && focusable.length > 0) {
      setTimeout(() => focusable[0].focus(), 100);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        const focusableElements = menuRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusableElements || focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleNav = (id) => {
    onClose();
    // Esperar a que cierre el menú antes de montar la pestaña (fluidez móvil)
    setTimeout(() => {
      setActiveTab(id);
    }, 150);
  };

  // Todos los items
  const allItems = [
    ...navItems,
    ...(session ? [{ id: 'admin', label: 'Admin' }] : [{ id: 'admin', label: 'Login' }]),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mystical-mobile-nav"
          key="mystical-veil"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className="fixed inset-0 z-50 lg:hidden"
          variants={VEIL_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          ref={menuRef}
        >

          {/*Superficie de cristal oscuro*/}
          <div
            className="absolute inset-0 mobile-menu-glass"
            style={{
              background: 'rgba(11, 9, 20, 0.98)',
            }}
            onClick={onClose}
          />

          {/*Orbe de profundidad central */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            aria-hidden="true"
          />

          <div
            className="absolute -top-24 -right-24 w-80 h-80 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 65%)',
              filter: 'blur(50px)',
            }}
            aria-hidden="true"
          />

          <div
            className="absolute top-0 left-1/4 right-1/4 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(196,181,253,0.20) 30%, rgba(226,217,254,0.35) 50%, rgba(196,181,253,0.20) 70%, transparent)',
            }}
            aria-hidden="true"
          />
          <div
            className="relative z-10 h-full flex flex-col items-center justify-center gap-2"
            onClick={e => e.stopPropagation()}
          >

            {/* Ornamento superior */}
            <motion.div
              variants={NAV_ITEM_VARIANTS}
              className="mb-6 text-center"
            >
              <span
                className="font-mono-hud text-[9px] tracking-[0.35em] uppercase text-indigo-300/30"
                aria-hidden="true"
              >
                ◊ · · · ◊
              </span>
            </motion.div>

            {/* Lista de Senderos */}
            <motion.nav
              variants={NAV_LIST_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-label="Menú de navegación principal"
              className="flex flex-col items-center gap-1"
            >
              {allItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    variants={typeof window !== 'undefined' && window.innerWidth < 768 ? {} : NAV_ITEM_VARIANTS}
                    onClick={() => handleNav(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className="group relative flex items-center gap-3 py-3 px-6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0914] rounded-xl"
                  >
                    {/* Estrella lateral: aparece cuando el item es activo */}
                    <span
                      className={[
                        'text-fuchsia-300/70 text-xs',
                        'transition-all duration-500',
                        isActive
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-2',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      ◊
                    </span>

                    <span
                      className={[
                        'font-serif-display text-4xl font-semibold tracking-[0.12em]',
                        'transition-all duration-500',
                        isActive
                          ? 'text-white'
                          : 'text-indigo-200/90 group-hover:text-indigo-100/90',
                      ].join(' ')}
                      style={isActive ? {
                        textShadow: '0 0 30px rgba(192,132,252,0.45), 0 0 60px rgba(139,92,246,0.25)',
                      } : {
                        textShadow: 'none',
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Estrella lateral derecha: en hover del item inactivo */}
                    <span
                      className={[
                        'text-indigo-300/40 text-xs',
                        'transition-all duration-500',
                        !isActive
                          ? 'opacity-0 translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'
                          : 'opacity-0',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      ·
                    </span>
                  </motion.button>
                );
              })}
            </motion.nav>

            {/* Ornamento inferior */}
            <motion.div
              variants={NAV_ITEM_VARIANTS}
              className="mt-8 text-center space-y-1"
            >
              <div
                className="w-px h-12 bg-gradient-to-b from-indigo-400/20 to-transparent mx-auto"
                aria-hidden="true"
              />
              <span
                className="block font-mono-hud text-[8px] tracking-[0.30em] uppercase text-indigo-300/20"
                aria-hidden="true"
              >
                Misticismo Digital
              </span>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

//SocialIcon
function SocialIcon({ href, children, title, hoverColor, hoverBorder, hoverShadow, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      target={onClick ? undefined : "_blank"}
      rel={onClick ? undefined : "noopener noreferrer"}
      title={title}
      aria-label={title}
      className={[
        'relative border border-transparent p-1.5 cursor-pointer rounded-md',
        'text-indigo-200/40',
        'transition-[color,border-color,box-shadow,transform] duration-300',
        'hover:scale-110 flex items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0914]',
        hoverColor, hoverBorder, hoverShadow,
      ].join(' ')}
    >
      {children}
    </a>
  );
}

//Desktop nav links
function navBtnClass(isActive) {
  return [
    'relative pb-4 rounded-sm flex flex-col items-center justify-center',
    'font-sans-body text-[11px] font-medium tracking-[0.20em] uppercase',
    'transition-all duration-500',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0B0914]',
    isActive
      ? "text-white after:content-[''] after:block after:w-1 after:h-1 after:bg-amber-200 after:rounded-full after:mx-auto after:mt-1 after:shadow-[0_0_5px_rgba(251,191,36,0.8)]"
      : 'text-indigo-200/40 hover:text-indigo-100',
  ].join(' ');
}

//Navbar principal
export default function Navbar({ activeTab, setActiveTab, session, onContactClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen]);

  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'experiencia', label: 'Experiencia' },
    { id: 'educacion', label: 'Educación' },
    { id: 'proyectos', label: 'Proyectos' },
  ];

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/*HEADER*/}
      <header
        className={[
          'w-full px-6 md:px-10 relative z-40',
          'border-b border-indigo-300/10',
          'transition-[padding,box-shadow,border-color,backdrop-filter] duration-500 ease-out',
          'nav-glass-blur',
          scrolled ? 'py-2 scrolled' : 'py-4',
        ].join(' ')}
        style={{
          background: scrolled ? 'rgba(11,9,20,0.70)' : 'transparent',
          boxShadow: scrolled
            ? '0 2px 24px rgba(99,102,241,0.10)'
            : 'none',
        }}
      >
        <div className="w-full flex justify-between items-center max-w-6xl mx-auto">

          <div className="flex items-center gap-5">

            {/* GitHub */}
            <SocialIcon
              href="https://github.com/Dancay5071"
              title="GitHub"
              hoverColor="hover:text-violet-300"
              hoverBorder="hover:border-violet-400/30"
              hoverShadow="hover:shadow-[0_0_10px_rgba(139,92,246,0.25)]"
            >
              <svg aria-hidden="true" className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </SocialIcon>

            {/* LinkedIn */}
            <SocialIcon
              href="https://www.linkedin.com/in/daniela-cabrera5071/"
              title="LinkedIn"
              hoverColor="hover:text-indigo-300"
              hoverBorder="hover:border-indigo-400/30"
              hoverShadow="hover:shadow-[0_0_10px_rgba(99,102,241,0.30)]"
            >
              <svg aria-hidden="true" className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </SocialIcon>

            {/* Email */}
            <SocialIcon
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onContactClick) onContactClick();
              }}
              title="Email"
              hoverColor="hover:text-fuchsia-300"
              hoverBorder="hover:border-fuchsia-400/30"
              hoverShadow="hover:shadow-[0_0_10px_rgba(217,70,239,0.30)]"
            >
              <svg aria-hidden="true" className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </SocialIcon>
          </div>

          {/* Desktop nav*/}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={navBtnClass(isActive)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Admin desktop */}
            {session && (
              <button
                onClick={() => setActiveTab('admin')}
                className={navBtnClass(activeTab === 'admin')}
                aria-current={activeTab === 'admin' ? 'page' : undefined}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Login + Sello hamburguesa*/}
          <div className="flex items-center gap-3">

            {/* Login / Admin button */}
            <MagneticButton strength={0.2}>
              <button
                onClick={() => setActiveTab('admin')}
                aria-label={session ? 'Panel de administración' : 'Iniciar sesión'}
                className={[
                  'group flex items-center gap-2 cursor-pointer',
                  'font-mono-hud text-[10px] tracking-[0.25em] uppercase',
                  'px-2 py-1',
                  'transition-all duration-400 ease-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0914]',
                  activeTab === 'admin'
                    ? 'text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-indigo-300/40 hover:text-indigo-200 hover:drop-shadow-[0_0_8px_rgba(165,180,252,0.4)]',
                ].join(' ')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" className="transition-transform duration-400 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="hidden sm:inline">
                  {session ? 'Admin' : 'Login'}
                </span>
              </button>
            </MagneticButton>

            {/*Sello de Apertura */}
            <SealButton
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
            />
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <MysticalMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobile}
        navItems={navItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        session={session}
      />
    </>
  );
}
