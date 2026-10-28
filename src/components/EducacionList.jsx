import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { getEducation } from '../services/api';

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.80,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const MESES = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };

// Parser robusto
const parseFechaEducacion = (fechaStr) => {
  if (!fechaStr) return new Date(0);
  const s = String(fechaStr).toLowerCase().trim();

  if (s.includes('actual') || s.includes('presente') || s.includes('curso')) {
    return new Date(9999, 0, 1);
  }

  // Formato "Mes AAAA" 
  const matchMesAno = s.match(/([a-z]{3})[a-z]*[\s/-]+(\d{4})/i);
  if (matchMesAno) {
    const mes = MESES[matchMesAno[1].slice(0, 3)] ?? 0;
    const ano = parseInt(matchMesAno[2], 10);
    return new Date(ano, mes, 1);
  }

  // Formato solo año 
  const matchAno = s.match(/(\d{4})/);
  if (matchAno) {
    const ano = parseInt(matchAno[1], 10);
    return new Date(ano, 0, 1);
  }

  return new Date(0);
};

// Obtiene la fecha representativa
const getFechaRelevante = (item) => {
  if (item.fecha_fin && item.fecha_fin.trim() !== '') {
    return parseFechaEducacion(item.fecha_fin);
  }
  return parseFechaEducacion(item.fecha_inicio);
};

const formatRango = (fechaInicio, fechaFin) => {
  const inicio = fechaInicio ? String(fechaInicio).trim() : '';
  const fin = fechaFin ? String(fechaFin).trim() : '';
  if (!inicio && !fin) return 'S/F';
  if (!inicio) return fin;
  if (!fin) return `${inicio} – Actualidad`;
  if (inicio === fin) return inicio;
  return `${inicio} – ${fin}`;
};

const mapEducacion = (data) => {
  const titulo = data.titulo || 'Título Desconocido';
  const validTipos = ['Carrera', 'Formación Prof.', 'Curso'];
  return {
    id: data.id,
    institucion: data.institucion || 'Institución Desconocida',
    titulo,
    fecha_inicio: data.fecha_inicio || '',
    fecha_fin: data.fecha_fin || '',
    rango: formatRango(data.fecha_inicio, data.fecha_fin),
    siglas: data.siglas || titulo.substring(0, 2).toUpperCase(),
    color_badge: data.color_badge || 'indigo',
    tipo: validTipos.includes(data.color_badge) ? data.color_badge : 'Curso',
    descripcion: data.descripcion || '',
  };
};

//Descripción
function DescripcionBlock({ text }) {
  if (!text) return null;

  const items = text
    .split(/\s*-\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (items.length > 1) {
    return (
      <ul className="relative z-10 space-y-2 pl-1 mt-3" role="list">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 leading-relaxed text-sm text-indigo-200/60">
            <span className="text-indigo-300/50 shrink-0 mt-0.5 text-xs" aria-hidden="true">◊</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="relative z-10 leading-relaxed text-indigo-200/60 text-sm mt-3">
      {text}
    </p>
  );
}

//Tema por tipos
const TIPO_THEME = {
  Carrera: {
    badgeBorder: 'border-violet-400/40',
    badgeText: 'text-violet-200',
    iconBorder: 'border-violet-300/40',
    iconGlow: '0 0 14px rgba(139,92,246,0.35), 0 0 4px rgba(192,132,252,0.2)',
    siglasClass: 'font-serif text-violet-200 text-[10px]',
    adminBadge: 'text-violet-300 border-violet-500/30',
  },
  'Formación Prof.': {
    badgeBorder: 'border-fuchsia-400/30',
    badgeText: 'text-fuchsia-200',
    iconBorder: 'border-fuchsia-300/30',
    iconGlow: '0 0 12px rgba(217,70,239,0.25)',
    siglasClass: 'font-serif text-fuchsia-200 text-[10px]',
    adminBadge: 'text-fuchsia-300 border-fuchsia-500/30',
  },
  Curso: {
    badgeBorder: 'border-indigo-400/30',
    badgeText: 'text-indigo-200',
    iconBorder: 'border-indigo-300/25',
    iconGlow: '0 0 10px rgba(165,180,252,0.20)',
    siglasClass: 'font-serif text-indigo-200 text-[10px]',
    adminBadge: 'text-indigo-300 border-indigo-500/30',
  },
};

const getTheme = (tipo) => TIPO_THEME[tipo] || TIPO_THEME['Curso'];

//Tarjeta
function EduCard({ edu }) {
  const theme = getTheme(edu.tipo);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="grimoire-card group"
      variants={window.innerWidth < 768 ? {} : cardVariants}
    >
      <div
        className={`grimoire-badge border ${theme.iconBorder}`}
        style={{ boxShadow: theme.iconGlow }}
        aria-hidden="true"
      >
        <span className={`grimoire-siglas ${theme.siglasClass}`}>
          {edu.siglas}
        </span>
      </div>

      <div className="grimoire-body relative z-10">

        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span
            className={`text-xs tracking-widest uppercase ${theme.badgeText} before:content-['['] after:content-[']'] before:mr-1 after:ml-1 before:opacity-50 after:opacity-50`}
          >
            {edu.tipo}
          </span>

          {/* fecha */}
          {edu.rango && edu.rango !== 'S/F' && (
            <span
              className={[
                'text-xs tracking-wider',
                edu.rango.includes('Actualidad')
                  ? 'text-amber-200/90 before:content-["["] after:content-["]"] before:text-amber-500/40 after:text-amber-500/40 before:mr-1 after:ml-1'
                  : 'text-indigo-200/50 before:content-["["] after:content-["]"] before:text-indigo-500/30 after:text-indigo-500/30 before:mr-1 after:ml-1'
              ].join(' ')}
            >
              {edu.rango}
            </span>
          )}
        </div>

        {/* Título */}
        <h3 className="font-serif text-base text-indigo-50 leading-snug mb-1">
          {edu.titulo}
        </h3>

        {/* Institución */}
        <p className="flex items-center gap-1.5 text-sm text-indigo-300/80 leading-snug">
          <span className="text-indigo-400/60 text-xs shrink-0" aria-hidden="true">◊</span>
          {edu.institucion}
        </p>

        {edu.descripcion && (
          <>
            {/* Botón Sello de Apertura (Mobile) */}
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
              <DescripcionBlock text={edu.descripcion} />
            </div>

            {/* Descripción (Mobile animado) */}
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
                    <DescripcionBlock text={edu.descripcion} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function GrimoireGrid({ data }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px -80px 0px' });

  return (
    <motion.div
      ref={ref}
      className="grimoire-grid"
      variants={gridContainerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {data.map((edu) => (
        <EduCard key={edu.id} edu={edu} />
      ))}
    </motion.div>
  );
}

//Componente principal
export default function EducacionList({ isAdmin = false, onEdit, onDelete }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEducacion = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const resData = await getEducation();
      const mapped = (resData || []).map(mapEducacion);

      // Orden cronológico: lo más reciente / en curso primero
      const sorted = mapped.sort((a, b) => {
        const fechaB = getFechaRelevante(b).getTime();
        const fechaA = getFechaRelevante(a).getTime();
        if (fechaB !== fechaA) return fechaB - fechaA;
        // Si empatan, desempata por fecha de inicio
        const inicioB = parseFechaEducacion(b.fecha_inicio).getTime();
        const inicioA = parseFechaEducacion(a.fecha_inicio).getTime();
        return inicioB - inicioA;
      });

      setData(sorted);
      setError(null);
    } catch (err) {
      console.error('Error al cargar educación desde la API:', err);
      setError('No se pudo cargar la educación.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducacion(true);
  }, []);

  if (loading) {
    return (
      <div className="grimoire-grid py-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grimoire-card animate-pulse"
            style={{ animationDelay: `${i * 0.08}s` }}
            aria-hidden="true"
          >
            <div className="w-11 h-11 rotate-45 border border-indigo-300/15 bg-indigo-950/20 shrink-0 rounded-sm" />
            <div className="grimoire-body flex flex-col gap-2.5 flex-1">
              <div className="h-4 w-14 bg-indigo-500/10 rounded-full" />
              <div className="h-3.5 w-36 bg-white/5 rounded-full" />
              <div className="h-3 w-28 bg-white/4 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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

  if (!isAdmin) return <GrimoireGrid data={data} />;

  return (
    <div className="divide-y divide-indigo-500/10">
      {data.map(edu => {
        const theme = getTheme(edu?.tipo);
        return (
          <div
            key={edu.id}
            className="px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-indigo-500/5 transition-colors gap-3"
          >
            <div className="min-w-0">
              <h4 className="font-semibold text-indigo-100 text-sm flex items-center gap-2 flex-wrap">
                {edu?.titulo || 'Sin título'}
                <span className={`px-2 py-0.5 rounded-none border text-xs ${theme.adminBadge}`}>
                  {edu?.tipo || 'Curso'}
                </span>
              </h4>
              <p className="text-xs text-indigo-300/50 mt-1 truncate max-w-md tracking-wide">
                <span className="text-indigo-400/30 mr-1.5" aria-hidden="true">◊</span>
                {edu?.institucion || '—'}
                {edu?.rango && edu.rango !== 'S/F' && (
                  <span className="text-indigo-400/30"> · {edu.rango}</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                className="px-3 py-1.5 text-[10px] font-sans-body tracking-[0.15em] uppercase text-indigo-200/90 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-400/25 hover:border-indigo-300/60 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                onClick={() => onEdit(edu)}
                type="button"
              >
                Editar ◊
              </button>
              <button
                className="px-3 py-1.5 text-[10px] font-sans-body tracking-[0.15em] uppercase text-rose-300/80 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-400/50 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                onClick={() => onDelete(edu?.id)}
                type="button"
              >
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
