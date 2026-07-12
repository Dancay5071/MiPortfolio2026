import React, { useEffect, useRef } from 'react';

export default function Hyperspeed({
  speed      = 4.5,
  lineCount  = 45,
  colors     = [
    'rgba(167, 139, 250, 0.6)',
    'rgba(139, 92, 246,  0.55)',
    'rgba(192, 132, 252, 0.6)',
    'rgba(221, 214, 254, 0.4)',
  ],
  opacity = 0.4,   
  fov     = 150,
  maxZ    = 600,
}) {
  const canvasRef    = useRef(null);
  const mouseVelRef  = useRef(1.0);
  const pausedRef    = useRef(false);  

  useEffect(() => {
    let lastX = 0, lastY = 0, lastT = 0;
    let decayTimer = null;

    const onMouseMove = (e) => {
      const now = performance.now();
      const dx  = e.clientX - lastX;
      const dy  = e.clientY - lastY;
      const dt  = Math.max(now - lastT, 1);
      const vel = Math.sqrt(dx * dx + dy * dy) / dt; // px/ms

      mouseVelRef.current = Math.min(1.2, 1.0 + vel * 0.4);

      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;

      clearTimeout(decayTimer);
      decayTimer = setTimeout(() => {
        mouseVelRef.current = 1.0;
      }, 300);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      clearTimeout(decayTimer);
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    const getSize = () => ({
      w: canvas.offsetWidth  || window.innerWidth,
      h: canvas.offsetHeight || window.innerHeight,
    });

    let { w: width, h: height } = getSize();
    canvas.width  = width;
    canvas.height = height;
    let centerX = width  / 2;
    let centerY = height / 2;

    const LINE_WIDTH_MULT = 4.0;
    const LINE_WIDTH_BASE = 1.5;

    // Partículas 
    const count = Math.round(lineCount * 1.2);
    const particles = Array.from({ length: count }, () => ({
      x:               (Math.random() - 0.5) * width  * 2.5,
      y:               (Math.random() - 0.5) * height * 2.5,
      z:               Math.random() * maxZ,
      color:           colors[Math.floor(Math.random() * colors.length)],
      speedMultiplier: 0.75 + Math.random() * 0.5,
    }));


    const handleResize = () => {
      const { w, h } = getSize();
      if (w === 0 || h === 0) return; 
      width  = w;
      height = h;
      canvas.width  = width;
      canvas.height = height;
      centerX = width  / 2;
      centerY = height / 2;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (pausedRef.current) return;

      ctx.clearRect(0, 0, width, height);

      const velBoost    = mouseVelRef.current ?? 1.0;
      const currentSpeed = speed * velBoost;

      particles.forEach((p) => {
        const prevZ = p.z;
        p.z -= currentSpeed * p.speedMultiplier;

        if (p.z <= 0) {
          p.z    = maxZ;
          p.x    = (Math.random() - 0.5) * width  * 2.5;
          p.y    = (Math.random() - 0.5) * height * 2.5;
          p.color = colors[Math.floor(Math.random() * colors.length)];
          return;
        }

        const x1 = (p.x / prevZ) * fov + centerX;
        const y1 = (p.y / prevZ) * fov + centerY;
        const x2 = (p.x / p.z)  * fov + centerX;
        const y2 = (p.y / p.z)  * fov + centerY;

        if (x2 < 0 || x2 > width || y2 < 0 || y2 > height) return;

        const distancePercent = 1 - p.z / maxZ;
        const alphaFade       = Math.sin(distancePercent * Math.PI);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth   = distancePercent * LINE_WIDTH_MULT + LINE_WIDTH_BASE;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = opacity * alphaFade;
        ctx.stroke();
      });

      ctx.globalAlpha = 1.0;
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [speed, lineCount, colors, opacity, fov, maxZ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none block z-0 bg-transparent"
      style={{
        mixBlendMode: 'add',
      }}
    />
  );
}
