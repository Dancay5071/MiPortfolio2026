import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function MysticalCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Física de resorte para el Aura
  const springConfig = { stiffness: 100, damping: 25, mass: 0.1 };
  const auraX = useSpring(-100, springConfig);
  const auraY = useSpring(-100, springConfig);

  useEffect(() => {
    // Detectar soporte táctil o pantallas pequeñas
    const checkEnvironment = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouch(isTouchDevice);
      setIsDesktop(window.innerWidth >= 768);
      
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
    };
    
    checkEnvironment();
    window.addEventListener('resize', checkEnvironment);
    window.addEventListener('touchstart', () => setIsTouch(true), { passive: true });

    const handleMouseMove = (e) => {
      if (isTouch) return;
      setMousePos({ x: e.clientX, y: e.clientY });
      auraX.set(e.clientX);
      auraY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      if (isTouch) return;
      const target = e.target;
      const isInteractive = target.closest('a, button, input, textarea, select, details, summary, .group-hover, [role="button"], [tabindex]:not([tabindex="-1"])');
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('resize', checkEnvironment);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [auraX, auraY, isTouch]);

  if (isTouch || !isDesktop || reducedMotion) return null;

  const isVisible = mousePos.x !== -100;

  return (
    <>
      <style>{`
        /* Ocultar el cursor por defecto globalmente en escritorio */
        @media (min-width: 768px) {
          *, *::before, *::after {
            cursor: none !important;
          }
        }
      `}</style>
      
      <div className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block" aria-hidden="true">
        
        {/* El núcleo */}
        <div 
          className="fixed w-1.5 h-1.5 rounded-full bg-indigo-100 shadow-[0_0_10px_rgba(224,231,255,0.8)]"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.15s ease',
            opacity: isVisible ? 1 : 0
          }}
        />

        {/* El Aura */}
        <motion.div
          className="fixed rounded-full backdrop-blur-[1px]"
          style={{
            left: auraX,
            top: auraY,
            translateX: '-50%',
            translateY: '-50%',
            width: '2rem', 
            height: '2rem', 
            border: '1px solid rgba(217, 70, 239, 0.4)',
            backgroundColor: isHovering ? 'rgba(112, 26, 117, 0.05)' : 'rgba(112, 26, 117, 0.1)', // bg-fuchsia-900/10 vs bg-fuchsia-900/5
            opacity: isVisible ? 1 : 0
          }}
          animate={{
            scale: isHovering ? 1.8 : 1,
            borderColor: isHovering ? 'rgba(217, 70, 239, 0.9)' : 'rgba(217, 70, 239, 0.4)',
          }}
          transition={{
            scale: { type: 'spring', stiffness: 300, damping: 20 },
            borderColor: { duration: 0.2 }
          }}
        />
      </div>
    </>
  );
}
