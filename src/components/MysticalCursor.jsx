import { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function MysticalCursor() {
  const dotRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTextElement, setIsTextElement] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    return !prefersReducedMotion && hasFinePointer;
  });

  // Física de resorte para el aura
  const springConfig = { stiffness: 180, damping: 22, mass: 0.1 };
  const auraX = useSpring(-100, springConfig);
  const auraY = useSpring(-100, springConfig);

  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;

      // Actualización directa del punto por GPU
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
      }

      auraX.set(clientX);
      auraY.set(clientY);

      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      
      // Detectar si el usuario está sobre un campo de texto o editable
      const isInput = !!target.closest('input, textarea, select, [contenteditable="true"], .cursor-text');
      setIsTextElement(isInput);

      // Detectar elementos interactivos para expandir el aura
      const isInteractive = !!target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], label.cursor-pointer');
      setIsHovering(isInteractive);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [auraX, auraY, isVisible, isEnabled]);

  if (!isEnabled) return null;

  return (
    <>
      <style>{`
        /*  Oculta el cursor del sistema SOLO en dispositivos con mouse real */
        @media (pointer: fine) and (hover: hover) {
          body, a, button, [role="button"] {
            cursor: none !important;
          }
          /* Libera SIEMPRE los campos de texto para permitir seleccionar y editar normalmente */
          input, textarea, select, [contenteditable="true"], .cursor-text {
            cursor: text !important;
          }
        }
      `}</style>

      <div 
        className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden transition-opacity duration-200"
        style={{ opacity: isVisible && !isTextElement ? 1 : 0 }}
        aria-hidden="true"
      >
        {/* Punto central con alta visibilidad y contraste */}
        <div
          ref={dotRef}
          className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9),0_0_15px_rgba(167,139,250,0.8)] will-change-transform"
        />

        {/* Aura magnética exterior */}
        <motion.div
          className="fixed top-0 left-0 rounded-full pointer-events-none will-change-transform"
          style={{
            x: auraX,
            y: auraY,
            translateX: '-50%',
            translateY: '-50%',
            width: '2.2rem',
            height: '2.2rem',
            border: '1px solid rgba(192, 132, 252, 0.45)',
            backgroundColor: isHovering ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.04)',
            backdropFilter: 'blur(1px)',
          }}
          animate={{
            scale: isHovering ? 1.7 : 1,
            borderColor: isHovering ? 'rgba(216, 180, 254, 0.85)' : 'rgba(192, 132, 252, 0.45)',
            boxShadow: isHovering ? '0 0 20px rgba(168, 85, 247, 0.25)' : 'none',
          }}
          transition={{
            scale: { type: 'spring', stiffness: 260, damping: 20 },
            borderColor: { duration: 0.2 }
          }}
        />
      </div>
    </>
  );
}

