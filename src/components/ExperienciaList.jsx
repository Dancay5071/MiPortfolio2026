import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const pathVariants = {
  hidden:  { scaleY: 0, opacity: 0 },
  visible: {
    scaleY:  1,
    opacity: 1,
    transition: { duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y:       0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};


const formatRango = (inicio, fin) => {
  const i = inicio ? String(inicio).trim() : '';
  const f = fin    ? String(fin).trim()    : '';
  if (!i && !f) return 'S/F';
  if (!i)       return f;
  if (!f)       return `${i} · Actualidad`;
  return `${i} · ${f}`;
};

const mapExperiencia = (data) => ({
  id:           data.id,
  empresa:      data.empresa      || 'Empresa Desconocida',
  cargo:        data.cargo        || 'Cargo Desconocido',
  fecha_inicio: data.fecha_inicio || data.fecha || '',
  fecha_fin:    data.fecha_fin    || null,
  rango:        formatRango(data.fecha_inicio || data.fecha, data.fecha_fin),
  descripcion:  data.descripcion  || '',
  tecnologias:  data.tecnologias
    ? data.tecnologias.split(',').map(t => t.trim()).filter(Boolean)
    : [],
  raw_tech: data.tecnologias || '',
});

//Descripción
function DescripcionBlock({ text }) {
  if (!text) return null;

  const items = text
    .split(/-/)
    .map(s => s.trim())
    .filter(Boolean);

  if (items.length > 1) {
    return (
      <ul className="relative z-10 space-y-2 pl-1 mt-3" role="list">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 leading-relaxed text-[13px] text-indigo-200/80">
            <span className="text-amber-200/70 shrink-0 mt-0.5 text-xs drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" aria-hidden="true">◊</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="relative z-10 leading-relaxed text-indigo-200/80 text-[13px] mt-3">
      {text}
    </p>
  );
}

function SkeletonTimeline() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="relative pl-10 flex flex-col gap-8">
        <div className="stellar-path" aria-hidden="true" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative animate-pulse ml-3"
            style={{ animationDelay: `${i * 0.12}s` }}
            aria-hidden="true"
          >
            <div className="stellar-node" />
            <div className="stellar-card">
              <div className="flex justify-between mb-4 gap-4">
                <div className="flex flex-col gap-2.5">
                  <div className="h-4 w-40 bg-indigo-300/8 rounded-full" />
                  <div className="h-3 w-28 bg-white/5 rounded-full" />
                </div>
                <div className="h-5 w-28 bg-indigo-900/30 rounded-full shrink-0" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/4 rounded-full" />
                <div className="h-3 w-4/5 bg-white/4 rounded-full" />
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-5 w-14 bg-indigo-500/8 rounded-full" />
                <div className="h-5 w-18 bg-indigo-500/8 rounded-full" />
                <div className="h-5 w-12 bg-indigo-500/8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ exp, isLatest }) {
  const ref  = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px 0px -100px 0px' });
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="relative group"
      variants={window.innerWidth < 768 ? {} : itemVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {/* círculo */}
      <div
        className={`stellar-node${isLatest ? ' stellar-node--active' : ''}`}
        style={exp.rango.includes('Actualidad') && isLatest ? {
          borderColor: 'rgba(251, 191, 36, 0.6)', 
          boxShadow: '0 0 15px rgba(217, 119, 6, 0.4)'
        } : undefined}
        aria-hidden="true"
      >
        {isLatest && <span className="stellar-node-aura" style={exp.rango.includes('Actualidad') ? { borderColor: 'rgba(251, 191, 36, 0.4)' } : undefined} />}
      </div>

      {/* Tarjeta */}
      <div className="stellar-card">

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div className="flex flex-col gap-1">

            {/* Cargo */}
            <h3 className="font-serif text-xl text-indigo-50 leading-tight tracking-wide">
              {exp.cargo}
            </h3>

            {/* Empresa */}
            <p className="flex items-center gap-1.5 text-sm text-indigo-300/80">
              <span className="text-indigo-400/60 text-xs" aria-hidden="true">◊</span>
              {exp.empresa}
            </p>
          </div>

          {/* fecha*/}
          <span
            className={[
              'self-start sm:self-auto shrink-0 text-[11px] tracking-wider whitespace-nowrap',
              exp.rango.includes('Actualidad')
                ? 'text-amber-200/90 before:content-["["] after:content-["]"] before:text-amber-500/40 after:text-amber-500/40 before:mr-1 after:ml-1'
                : 'text-indigo-200/70 before:content-["["] after:content-["]"] before:text-indigo-500/40 after:text-indigo-500/40 before:mr-1 after:ml-1'
            ].join(' ')}
            aria-label={`Período: ${exp.rango}`}
          >
            {exp.rango}
          </span>
        </div>

        {/* Botón Sello de Apertura (Mobile Only) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden mt-4 text-xs tracking-widest uppercase text-indigo-300/70 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0914] rounded-sm transition-colors hover:text-indigo-200"
          aria-expanded={isExpanded}
        >
          <span className="text-amber-200/90 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" aria-hidden="true">◊</span>
          {isExpanded ? 'Ocultar' : 'Revelar detalles'}
        </button>

        {/* Descripción (Desktop siempre visible) */}
        <div className="hidden md:block">
          <DescripcionBlock text={exp.descripcion} />
        </div>

        {/* Descripción (Mobile) */}
        <div className="block md:hidden">
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <DescripcionBlock text={exp.descripcion} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tecnologías */}
        {exp.tecnologias.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5">
            {exp.tecnologias.map((tech, idx) => (
              <span key={idx} className="mystic-tag">{tech}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TimelineView({ data }) {

  const pathRef   = useRef(null);
  const pathInView = useInView(pathRef, { once: true, margin: '-60px 0px 0px 0px' });

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4">
      <div className="relative pl-9 sm:pl-11" ref={pathRef}>

        <motion.div
          className="stellar-path"
          style={{ transformOrigin: 'top' }}
          variants={pathVariants}
          initial="hidden"
          animate={pathInView ? 'visible' : 'hidden'}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-7">
          {data.map((exp, index) => (
            <TimelineItem
              key={exp.id}
              exp={exp}
              isLatest={index === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

//Componente principal
export default function ExperienciaList({ isAdmin = false, onEdit, onDelete }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchExperiencia = async () => {
    setLoading(true);
    try {
      const { data: resData, error: resError } = await supabase
        .from('experiencia')
        .select('*')
        .order('fecha_fin', { ascending: false, nullsFirst: true })
        .order('fecha_inicio', { ascending: false });

      if (resError) throw resError;
      setData((resData || []).map(mapExperiencia));
      setError(null);
    } catch (err) {
      console.error('Error al cargar experiencia:', err);
      setError('No se pudo cargar la experiencia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiencia();
    const channel = supabase
      .channel('realtime-experiencia')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experiencia' }, fetchExperiencia)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) return <SkeletonTimeline />;

  if (error) return (
    <div className="text-center text-indigo-400/50 text-sm py-10 tracking-widest">
      ◊ {error}
    </div>
  );

  if (data.length === 0) return (
    <div className="text-center text-indigo-400/30 text-sm py-10 tracking-widest">
      ◊ Sin registros
    </div>
  );

  if (!isAdmin) return <TimelineView data={data} />;

  return (
    <div className="divide-y divide-indigo-500/10">
      {data.map(exp => (
        <div
          key={exp.id}
          className="px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-indigo-500/5 transition-colors gap-3"
        >
          <div className="min-w-0">
            <h3 className="font-semibold text-indigo-100 text-sm">
              {exp.cargo}
              <span className="text-indigo-400/50 mx-1.5 font-light">en</span>
              {exp.empresa}
            </h3>
            <p className="text-xs text-indigo-300/50 mt-1 truncate max-w-md tracking-wide">
              <span className="text-indigo-400/30 mr-1.5" aria-hidden="true">◊</span>
              {exp.rango}
              {exp.descripcion && (
                <span className="text-indigo-400/30"> · {exp.descripcion.substring(0, 55)}…</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              className="text-[11px] tracking-widest text-indigo-400 hover:text-indigo-200 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0914] rounded-sm px-1"
              onClick={() => onEdit(exp)}
              type="button"
            >
              Editar
            </button>
            <button
              className="text-[11px] tracking-widest text-fuchsia-400/60 hover:text-fuchsia-300 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0914] rounded-sm px-1"
              onClick={() => onDelete(exp.id)}
              type="button"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
