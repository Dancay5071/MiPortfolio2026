import { useState, useEffect, useRef, useCallback } from 'react';

const GLOW_SIZE = 520;   
const CORE_SIZE = 200;   
const LERP      = 0.09; 

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const handler = (e) => setIsTouch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isTouch;
}

export default function MouseGlowLayout({ children, className = '' }) {
  const isTouch = useIsTouchDevice();

  
  const targetRef  = useRef({ x: -1000, y: -1000 });
  const currentRef = useRef({ x: -1000, y: -1000 });

  const glowRef = useRef(null);
  const coreRef = useRef(null);

  const rafRef = useRef(null);

  const [visible, setVisible] = useState(false);

  //Listener del mouse
  const handleMouseMove = useCallback((e) => {
    targetRef.current = { x: e.clientX, y: e.clientY };
    if (!visible) setVisible(true);
  }, [visible]);

  useEffect(() => {
    
    if (isTouch) {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      return;
    }

    const animate = () => {
      const t = targetRef.current;
      const c = currentRef.current;

      c.x += (t.x - c.x) * LERP;
      c.y += (t.y - c.y) * LERP;

      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate(${c.x - GLOW_SIZE / 2}px, ${c.y - GLOW_SIZE / 2}px)`;
      }
      if (coreRef.current) {
        coreRef.current.style.transform =
          `translate(${c.x - CORE_SIZE / 2}px, ${c.y - CORE_SIZE / 2}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch, handleMouseMove]);

  const baseStyle = {
    position:     'fixed',
    top:          0,
    left:         0,
    borderRadius: '9999px',
    pointerEvents:'none',
    willChange:   'transform',
    transition:   'opacity 0.8s ease',
  };

  return (
    <div className={`relative ${className}`}>

      {!isTouch && (
        <>
          {/* Halo principal */}
          <div
            ref={glowRef}
            aria-hidden="true"
            style={{
              ...baseStyle,
              zIndex:     -10,
              width:      `${GLOW_SIZE}px`,
              height:     `${GLOW_SIZE}px`,
              background: 'radial-gradient(circle, rgba(109,40,217,0.13) 0%, rgba(139,92,246,0.07) 35%, rgba(165,180,252,0.04) 60%, transparent 75%)',
              filter:     'blur(72px)',
              opacity:    visible ? 1 : 0,
            }}
          />

          {/* Corona secundaria */}
          <div
            ref={coreRef}
            aria-hidden="true"
            style={{
              ...baseStyle,
              zIndex:     -9,
              width:      `${CORE_SIZE}px`,
              height:     `${CORE_SIZE}px`,
              background: 'radial-gradient(circle, rgba(196,181,253,0.10) 0%, rgba(165,180,252,0.05) 45%, transparent 75%)',
              filter:     'blur(32px)',
              opacity:    visible ? 1 : 0,
            }}
          />
        </>
      )}

      {isTouch && (
        <>
          <div
            aria-hidden="true"
            className="mystic-breathing-orb mystic-breathing-orb--primary"
          />

          <div
            aria-hidden="true"
            className="mystic-breathing-orb mystic-breathing-orb--secondary"
          />
        </>
      )}

      {children}
    </div>
  );
}
