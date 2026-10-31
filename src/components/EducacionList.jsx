import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEducation } from '../services/api';

const MESES = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };

// Parser robusto de fechas
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

// Temas cromáticos por categoría
const TIPO_THEME = {
  Carrera: {
    accent: 'violet',
    badgeBorder: 'border-violet-400/50',
    badgeText: 'text-violet-200',
    cardBorder: 'border-violet-500/25 hover:border-violet-400/50',
    cardGlow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.18)]',
    iconBorder: 'border-violet-300/50',
    iconGlow: '0 0 16px rgba(139,92,246,0.4), 0 0 4px rgba(192,132,252,0.3)',
    siglasClass: 'font-serif text-violet-100',
    adminBadge: 'text-violet-300 border-violet-500/30',
  },
  'Formación Prof.': {
    accent: 'fuchsia',
    badgeBorder: 'border-fuchsia-400/40',
    badgeText: 'text-fuchsia-200',
    cardBorder: 'border-fuchsia-500/20 hover:border-fuchsia-400/40',
    cardGlow: 'hover:shadow-[0_0_24px_rgba(217,70,239,0.14)]',
    iconBorder: 'border-fuchsia-300/40',
    iconGlow: '0 0 14px rgba(217,70,239,0.3)',
    siglasClass: 'font-serif text-fuchsia-100',
    adminBadge: 'text-fuchsia-300 border-fuchsia-500/30',
  },
  Curso: {
    accent: 'indigo',
    badgeBorder: 'border-indigo-400/30',
    badgeText: 'text-indigo-200',
    cardBorder: 'border-indigo-500/15 hover:border-indigo-400/30',
    cardGlow: 'hover:shadow-[0_0_18px_rgba(165,180,252,0.10)]',
    iconBorder: 'border-indigo-300/30',
    iconGlow: '0 0 10px rgba(165,180,252,0.20)',
    siglasClass: 'font-serif text-indigo-100',
    adminBadge: 'text-indigo-300 border-indigo-500/30',
  },
};

const getTheme = (tipo) => TIPO_THEME[tipo] || TIPO_THEME['Curso'];

// ─── COMPONENTE: NIVEL 1 · CARRERA HERO CARD (MAYOR JERARQUÍA) ───
function CarreraHeroCard({ edu }) {
  const theme = getTheme(edu.tipo);
  const [isExpanded, setIsExpanded] = useState(false);
  const isEnCurso = edu.rango.toLowerCase().includes('actualidad') || edu.rango.toLowerCase().includes('curso');

  // Separar materias o núcleos si vienen separados por guión
  const materias = useMemo(() => {
    if (!edu.descripcion) return [];
    return edu.descripcion
      .split(/\s*-\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [edu.descripcion]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative w-full overflow-hidden bg-[#0c0918]/85 backdrop-blur-xl border ${theme.cardBorder} ${theme.cardGlow} transition-all duration-300 p-6 md:p-8 rounded-none shadow-[0_8px_32px_rgba(0,0,0,0.45)]`}
    >
      {/* Sello decorativo de fondo */}
      <div
        className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-violet-600/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-5 md:gap-7">
        {/* Emblema Rúnico Diamante (Grande) */}
        <div className="shrink-0 self-start">
          <div
            className={`w-14 h-14 md:w-16 md:h-16 rotate-45 border ${theme.iconBorder} flex items-center justify-center bg-[#0e0a1f]/90 transition-transform duration-300 group-hover:scale-105`}
            style={{ boxShadow: theme.iconGlow }}
            aria-hidden="true"
          >
            <span className={`-rotate-45 text-xs md:text-sm tracking-wider font-semibold ${theme.siglasClass}`}>
              {edu.siglas}
            </span>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 min-w-0">
          {/* Header de Metadatos */}
          {edu.rango && edu.rango !== 'S/F' && (
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-mono-hud tracking-wider px-2.5 py-0.5 border ${isEnCurso
                    ? 'text-amber-200 bg-amber-500/10 border-amber-500/30 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                    : 'text-violet-200/80 bg-violet-950/30 border-violet-500/20'
                  }`}
              >
                {isEnCurso && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                )}
                <span>{edu.rango}</span>
              </span>
            </div>
          )}

          {/* Título de la Carrera */}
          <h3 className="font-serif text-xl md:text-2xl text-white font-medium leading-snug tracking-wide">
            {edu.titulo}
          </h3>

          {/* Institución */}
          <p className="flex items-center gap-2 text-sm md:text-base text-violet-200/80 mt-1 font-sans-body">
            <span className="text-violet-400 text-xs shrink-0" aria-hidden="true">◊</span>
            <span className="font-medium">{edu.institucion}</span>
          </p>

          {/* Resumen o Botón de Revelar Núcleos Temáticos */}
          {edu.descripcion && (
            <div className="mt-4 pt-4 border-t border-violet-500/15">
              {/* Botón de Despliegue con estilo Grimorio */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2.5 text-xs font-mono-hud tracking-[0.2em] uppercase text-violet-300 hover:text-white transition-all cursor-pointer group/btn"
                aria-expanded={isExpanded}
              >
                <span
                  className={`text-amber-300 text-xs drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'group-hover/btn:rotate-45'
                    }`}
                  aria-hidden="true"
                >
                  ◊
                </span>
                <span>
                  {isExpanded ? 'Ocultar núcleos y competencias' : 'Revelar materias clave & núcleos temáticos'}
                </span>
                <span className="text-violet-400/60 text-[11px] font-sans">
                  [{isExpanded ? '−' : '+'}]
                </span>
              </button>

              {/* Panel Desplegable Animado */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-3 space-y-3">
                      {materias.length > 1 ? (
                        <div>
                          <p className="text-[11px] font-mono-hud tracking-[0.2em] text-violet-300/70 uppercase mb-3">
                            ◊ Competencias y Ejes Troncales Destacados:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {materias.map((materia, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5 bg-violet-950/25 border border-violet-500/20 px-3 py-2 transition-colors hover:border-violet-400/35"
                              >
                                <span className="text-amber-200/80 text-xs shrink-0 mt-0.5" aria-hidden="true">
                                  ◊
                                </span>
                                <span className="text-xs text-indigo-100/85 leading-relaxed font-sans-body">
                                  {materia}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-indigo-200/75 leading-relaxed font-sans-body bg-violet-950/20 border border-violet-500/15 p-3">
                          {edu.descripcion}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── COMPONENTE: NIVEL 2 · FORMACIÓN PROFESIONAL (TAMAÑO MEDIANO) ───
function FormacionCard({ edu }) {
  const theme = getTheme(edu.tipo);
  const [isExpanded, setIsExpanded] = useState(false);

  const items = useMemo(() => {
    if (!edu.descripcion) return [];
    return edu.descripcion
      .split(/\s*-\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [edu.descripcion]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative flex flex-col justify-between overflow-hidden bg-[#0c0918]/80 backdrop-blur-xl border ${theme.cardBorder} ${theme.cardGlow} transition-all duration-300 p-5 md:p-6 rounded-none shadow-[0_6px_24px_rgba(0,0,0,0.4)]`}
    >
      <div>
        <div className="flex items-start gap-4">
          {/* Insignia Fucsia */}
          <div
            className={`w-11 h-11 shrink-0 rotate-45 border ${theme.iconBorder} flex items-center justify-center bg-[#0d091a]/90 mt-1`}
            style={{ boxShadow: theme.iconGlow }}
            aria-hidden="true"
          >
            <span className={`-rotate-45 text-[10px] tracking-wider font-semibold ${theme.siglasClass}`}>
              {edu.siglas}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Metadatos */}
            {edu.rango && edu.rango !== 'S/F' && (
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[11px] font-mono-hud text-fuchsia-200/70 tracking-wider">
                  [{edu.rango}]
                </span>
              </div>
            )}

            {/* Título */}
            <h4 className="font-serif text-lg text-white font-medium leading-snug">
              {edu.titulo}
            </h4>

            {/* Institución */}
            <p className="flex items-center gap-1.5 text-xs md:text-sm text-fuchsia-200/75 mt-0.5">
              <span className="text-fuchsia-400 text-xs shrink-0" aria-hidden="true">◊</span>
              <span>{edu.institucion}</span>
            </p>
          </div>
        </div>

        {/* Descripción / Contenidos */}
        {edu.descripcion && (
          <div className="mt-4 pt-3 border-t border-fuchsia-500/15">
            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-2 text-xs font-mono-hud tracking-wider text-fuchsia-300 hover:text-white transition-colors cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <span className="text-amber-300 text-xs" aria-hidden="true">◊</span>
                  <span>{isExpanded ? 'Ocultar detalles' : 'Ver competencias clave'}</span>
                  <span className="text-fuchsia-400/50">[{isExpanded ? '−' : '+'}]</span>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden mt-3 space-y-1.5 pl-1"
                    >
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-indigo-200/70 leading-relaxed">
                          <span className="text-fuchsia-400/60 shrink-0 text-[10px] mt-0.5">◊</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <p className="text-xs text-indigo-200/70 leading-relaxed">
                {edu.descripcion}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}

// ─── COMPONENTE: NIVEL 3 ───
function CursoCompactCard({ edu }) {
  const theme = getTheme(edu.tipo);

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4 }}
      className={`relative flex items-center gap-3.5 p-3.5 bg-[#0b0916]/70 backdrop-blur-md border ${theme.cardBorder} ${theme.cardGlow} transition-all duration-200 hover:-translate-y-0.5 rounded-none`}
    >
      {/* Insignia Compacta */}
      <div
        className={`w-9 h-9 shrink-0 rotate-45 border ${theme.iconBorder} flex items-center justify-center bg-[#0d091a]/80`}
        aria-hidden="true"
      >
        <span className={`-rotate-45 text-[9px] font-mono-hud font-bold ${theme.siglasClass}`}>
          {edu.siglas}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="font-sans-body text-xs md:text-sm font-medium text-indigo-100 truncate leading-snug">
          {edu.titulo}
        </h5>
        <div className="flex items-center gap-2 text-[11px] text-indigo-300/60 mt-0.5 truncate font-mono-hud">
          <span className="truncate">{edu.institucion}</span>
          {edu.rango && edu.rango !== 'S/F' && (
            <>
              <span className="text-indigo-500/40" aria-hidden="true">·</span>
              <span className="shrink-0 text-indigo-400/70">{edu.rango}</span>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── COMPONENTE PRINCIPAL DE EDUCACIÓN ───
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

  // Segmentación por jerarquía académica
  const carreras = useMemo(() => data.filter((d) => d.tipo === 'Carrera'), [data]);
  const formacion = useMemo(() => data.filter((d) => d.tipo === 'Formación Prof.'), [data]);
  const cursos = useMemo(
    () => data.filter((d) => d.tipo !== 'Carrera' && d.tipo !== 'Formación Prof.'),
    [data]
  );

  // Skeletons de Carga Jerárquicos
  if (loading) {
    return (
      <div className="w-full space-y-8 py-6">
        {/* Skeleton Carrera */}
        <div className="w-full p-6 border border-violet-500/20 bg-violet-950/10 animate-pulse flex flex-col md:flex-row gap-6">
          <div className="w-14 h-14 rotate-45 border border-violet-400/20 bg-violet-950/30 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-28 bg-violet-500/20 rounded" />
            <div className="h-6 w-3/4 bg-white/10 rounded" />
            <div className="h-4 w-1/2 bg-white/5 rounded" />
          </div>
        </div>

        {/* Skeleton Formación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-5 border border-fuchsia-500/15 bg-fuchsia-950/10 animate-pulse flex gap-4">
              <div className="w-11 h-11 rotate-45 border border-fuchsia-400/20 bg-fuchsia-950/20 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-fuchsia-500/20 rounded" />
                <div className="h-4 w-40 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-indigo-400/50 text-sm py-10 tracking-widest font-mono-hud">
        ◊ {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-indigo-400/30 text-sm py-10 tracking-widest font-mono-hud">
        ◊ Sin registros de educación
      </div>
    );
  }

  // ─── MODO ADMINISTRADOR ───
  if (isAdmin) {
    return (
      <div className="divide-y divide-indigo-500/10">
        {data.map((edu) => {
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

  // ─── MODO PÚBLICO ───
  return (
    <div className="w-full space-y-12">
      {/* ─── SECCIÓN 1: CARRERAS TRONCALES ─── */}
      {carreras.length > 0 && (
        <section aria-labelledby="heading-carreras" className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-violet-400 text-base drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" aria-hidden="true">
              ◊
            </span>
            <div>
              <h3
                id="heading-carreras"
                className="font-serif text-lg md:text-xl text-white font-semibold tracking-wide uppercase"
              >
                Carreras
              </h3>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-violet-500/30 to-transparent ml-2" />
          </div>

          <div className="grid grid-cols-1 gap-5">
            {carreras.map((carrera) => (
              <CarreraHeroCard key={carrera.id} edu={carrera} />
            ))}
          </div>
        </section>
      )}

      {/* ─── SECCIÓN 2: FORMACIÓN PROFESIONAL ─── */}
      {formacion.length > 0 && (
        <section aria-labelledby="heading-formacion" className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-fuchsia-400 text-base drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" aria-hidden="true">
              ◊
            </span>
            <div>
              <h3
                id="heading-formacion"
                className="font-serif text-lg md:text-xl text-white font-semibold tracking-wide uppercase"
              >
                Formación Profesional
              </h3>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-fuchsia-500/30 to-transparent ml-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formacion.map((fp) => (
              <FormacionCard key={fp.id} edu={fp} />
            ))}
          </div>
        </section>
      )}

      {/* ─── SECCIÓN 3: CURSOS Y CERTIFICACIONES─── */}
      {cursos.length > 0 && (
        <section aria-labelledby="heading-cursos" className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-indigo-400 text-base drop-shadow-[0_0_8px_rgba(165,180,252,0.4)]" aria-hidden="true">
              ◊
            </span>
            <div>
              <h3
                id="heading-cursos"
                className="font-serif text-lg md:text-xl text-white font-semibold tracking-wide uppercase"
              >
                Cursos & Certificaciones Continuas
              </h3>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/30 to-transparent ml-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cursos.map((curso) => (
              <CursoCompactCard key={curso.id} edu={curso} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
