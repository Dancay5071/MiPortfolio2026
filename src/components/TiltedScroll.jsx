import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useVelocity, useSpring, AnimatePresence } from 'framer-motion';

export default function TiltedScroll({ children, className = '' }) {
  const containerRef = useRef(null);

  const { scrollY } = useScroll({ container: containerRef });

  const scrollVelocity = useVelocity(scrollY);

  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 250,
    mass: 0.8
  });

  const rotateX = useTransform(smoothVelocity, [-1500, 1500], [12, -12]);
  const skewY = useTransform(smoothVelocity, [-1500, 1500], [3, -3]);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto hide-scrollbar flex-1 content-start max-h-[50vh] ${className}`}
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 pb-8"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <AnimatePresence mode="popLayout">
          {React.Children.map(children, (child) => {
            if (!child) return null;
            return (
              <motion.div
                key={child.key}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{
                  rotateX,
                  skewY,
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center'
                }}
                className="w-full"
              >
                {child}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
