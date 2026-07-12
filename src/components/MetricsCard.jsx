import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

//Animación de contador
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === null || target === undefined) return;
    if (target === 0) { setCount(0); return; }

    const startTime = performance.now();

    const step = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(progress === 1 ? target : Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

//Componente público
export default function MetricsCard({ isDemo = false }) {
  if (isDemo) return null;
  return <MetricsCardInner />;
}

//Inner
function MetricsCardInner() {
  const [total, setTotal] = useState(null);

  const animatedCount = useCountUp(total ?? 0, 1300);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const { count, error } = await supabase
          .from('analytics')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error("Error fetching analytics count:", error);
        } else {
          console.log("Analytics count fetched:", count);
        }

        if (!cancelled && !error) {
          setTotal(count ?? 0);
        } else if (!cancelled && error) {
          setTotal(0);
        }
      } catch (err) {
        console.error("Catch error fetching count:", err);
        if (!cancelled) setTotal(0);
      }
    }

    fetchCount();
    return () => { cancelled = true; };
  }, []);

  const isLoading = total === null;

  return (
    <div
      className="bg-[#0B0914]/40 backdrop-blur-xl border border-indigo-300/10 rounded-2xl p-6 relative overflow-hidden transition-[border-color,box-shadow] duration-400 hover:border-indigo-300/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]"
      role="region"
      aria-label="Visitas únicas al portfolio"
    >
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-indigo-400/8 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <span className="text-indigo-400/35 text-base mb-3 block" aria-hidden="true">◊</span>

      {/* Título*/}
      <p className="font-serif uppercase tracking-[0.2em] text-xs text-indigo-300 mb-4">
        Visitas Únicas
      </p>

      {/* Número contador animado */}
      {isLoading ? (
        <p
          className="text-3xl font-light text-indigo-300/25 leading-none tracking-tight"
          aria-live="polite"
        >
          ···
        </p>
      ) : (
        <p
          className="text-3xl font-light text-white leading-none tracking-tight"
          style={{ textShadow: '0 0 28px rgba(165,180,252,0.45), 0 0 60px rgba(99,102,241,0.18)' }}
          aria-label={`${animatedCount} visitas únicas`}
        >
          {animatedCount.toLocaleString('es-AR')}
        </p>
      )}

      <div
        className="mt-4 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(165,180,252,0.14),transparent)' }}
        aria-hidden="true"
      />

      {/* Sub-label */}
      <p className="mt-2.5 text-[10px] tracking-wider text-indigo-300/30 uppercase">
        Sesiones únicas registradas
      </p>
    </div>
  );
}
