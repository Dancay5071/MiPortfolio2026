import { useState, useEffect, useRef, useMemo } from 'react';
import { useInView } from 'framer-motion';
import TiltedScroll from './TiltedScroll';
import CatHeadLoader from './CatHeadLoader';
import { getProjects } from '../services/api';

//Mapeo de datos
const mapProyecto = (data) => ({
  id: data.id,
  title: data.title || 'Proyecto Sin Nombre',
  category: data.category || 'other',
  description: data.description || 'Sin descripción',
  tech_stack: data.tech_stack
    ? data.tech_stack.split(',').map(t => t.trim()).filter(Boolean)
    : [],
  raw_tech: data.tech_stack || '',
  demo_url: data.demo_url || '',
  github_url: data.github_url || '',
  image_url: data.image_url || '',
});

//Fallback de imagen por categoría
const CATEGORY_FALLBACK = {
  Minijuegos: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600&h=400',
  Android: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=400',
  'Aplicaciones Web': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600&h=400',
  'Aplicaciones de Escritorio': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600&h=400',
  other: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600&h=400',
};

const getImgUrl = (p) =>
  p.image_url || CATEGORY_FALLBACK[p.category] || CATEGORY_FALLBACK.other;

// Íconos de categoría
const CATEGORY_GLYPHS = {
  Minijuegos: '○',
  Android: '◉',
  'Aplicaciones Web': '◊',
  'Aplicaciones de Escritorio': '◈',
  other: '·',
};

function ProjectPortal({ src, alt, isActive }) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  if (src !== currentSrc) {
    setCurrentSrc(src);
    setLoaded(false);
  }

  const hasSrc = Boolean(src);
  const imgActiveClass = 'opacity-100 scale-[1.03] filter-none';
  const imgDormantClass = 'opacity-90 contrast-105 md:opacity-85 md:hover:opacity-100 transition-all duration-500';

  return (
    <div
      className="relative aspect-video overflow-hidden"
      aria-hidden="true"
    >
      {/* Placeholder*/}
      {(!hasSrc || !loaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B0914]/80 z-10 overflow-hidden">
          <div className="absolute inset-0 bg-indigo-400/5 animate-pulse" />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-300/10 to-transparent animate-pulse"
            style={{ animationDuration: '3s' }}
          />
          <CatHeadLoader size="md" className="opacity-40 relative z-20 drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]" />
        </div>
      )}

      {/* Imagen*/}
      {hasSrc && (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          className={[
            'w-full h-full object-cover transform-gpu',
            'transition-all duration-700 ease-out group-hover:scale-105',
            loaded ? '' : 'opacity-0',
            isActive ? imgActiveClass : imgDormantClass,
          ].filter(Boolean).join(' ')}
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(11,9,20,0.85) 0%, rgba(11,9,20,0.30) 50%, transparent 100%)',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
        <span className="flex items-center gap-1.5 text-[9px] font-mono-hud tracking-[0.22em] uppercase text-violet-300/50">
          <span aria-hidden="true">{CATEGORY_GLYPHS[alt] || '·'}</span>
        </span>

        {/* Icono de enlace externo*/}
        <span
          className={[
            'transition-opacity duration-500',
            isActive ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11" height="11"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            className="text-indigo-300/70"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function ProjectCard({ p, index, selectedTech, onSelectTech }) {
  const imgUrl = getImgUrl(p);
  const actionUrl = p.demo_url || p.github_url || '#';
  const glyph = CATEGORY_GLYPHS[p.category] || '·';
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, {
    amount: 0.5,
    once: false,
  });
  const isActive = isInView;

  return (
    <div
      ref={cardRef}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0914] rounded-none relative"
      style={window.innerWidth < 768 ? { opacity: 1 } : {
        animation: 'fadeInTab 0.45s ease-out forwards',
        animationDelay: `${index * 0.08}s`,
        opacity: 0,
      }}
    >
      <div
        className={[
          'relative flex flex-col h-full overflow-hidden',
          'rounded-none',
          'bg-[#0B0914]/75 md:bg-[#0B0914]/45',
          'md:backdrop-blur-xl transform-gpu',
          'border',
          isActive
            ? 'border-indigo-400/40 shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_30px_rgba(79,70,229,0.25),inset_0_1px_0_rgba(196,181,253,0.09)] -translate-y-1.5'
            : 'border-indigo-300/8  shadow-[0_8px_32px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(196,181,253,0.05)]',

          'hover:border-indigo-400/40',
          'hover:shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_30px_rgba(79,70,229,0.25),inset_0_1px_0_rgba(196,181,253,0.09)]',
          'hover:-translate-y-1.5',
          'transition-all duration-700 ease-out',
          'cursor-pointer',
        ].join(' ')}
      >

        <div
          className="absolute top-0 left-6 right-6 h-px z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(196,181,253,0.10) 30%, rgba(226,217,254,0.18) 50%, rgba(196,181,253,0.10) 70%, transparent)',
          }}
          aria-hidden="true"
        />

        <div
          className={[
            'absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none transition-opacity duration-700 -z-0',
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          ].join(' ')}
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          aria-hidden="true"
        />
        <ProjectPortal src={imgUrl} alt={p.category} isActive={isActive} />

        <div className="flex flex-col flex-1 px-5 py-4 gap-3 relative z-10">

          <span className="w-fit flex items-center gap-1.5 text-[9px] font-mono-hud tracking-[0.22em] uppercase text-indigo-300/80">
            <span aria-hidden="true" className="text-indigo-400/60">{glyph}</span>
            {p.category}
          </span>

          {/* Título */}
          <h3
            className={[
              'font-serif-display',
              'text-lg font-semibold leading-snug',
              'tracking-wide',
              'line-clamp-2',
              'transition-colors duration-500',
              isActive ? 'text-white' : 'text-indigo-50 group-hover:text-white',
            ].join(' ')}
            title={p.title}
          >
            {actionUrl !== '#' ? (
              <a
                href={actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="before:absolute before:inset-0 before:z-10 focus-visible:outline-none"
              >
                {p.title}
              </a>
            ) : (
              p.title
            )}
          </h3>

          {/* Descripción */}
          <p className="text-sm text-indigo-200/60 leading-relaxed line-clamp-2 font-sans-body flex-1">
            {p.description}
          </p>

          {/* Tecnologías clicables */}
          {p.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 relative z-20">
              {p.tech_stack.map((tech, idx) => {
                const isSelected = Boolean(
                  selectedTech && selectedTech.toLowerCase() === tech.toLowerCase()
                );
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onSelectTech?.(tech);
                    }}
                    className={[
                      'px-1.5 py-0.5 cursor-pointer rounded-none',
                      'text-[9px] font-mono-hud tracking-[0.18em] uppercase transition-all duration-300',
                      isSelected
                        ? 'bg-violet-950/80 border border-violet-400 text-amber-200 shadow-[0_0_12px_rgba(139,92,246,0.45)] scale-105'
                        : 'bg-transparent text-fuchsia-200/60 hover:text-white hover:border-fuchsia-400/40 border border-transparent before:content-["["] after:content-["]"] before:text-fuchsia-500/40 after:text-fuchsia-500/40 before:mr-0.5 after:ml-0.5 hover:scale-105',
                    ].join(' ')}
                    title={isSelected ? `Quitar filtro de ${tech}` : `Filtrar proyectos por ${tech}`}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>
          )}

          {/*Footer: links interactivos */}
          <div className="flex items-center gap-4 md:gap-6 pt-4 border-t border-white/5 mt-auto relative z-20">
            {p.github_url && (
              <a
                href={p.github_url}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver repositorio"
                className="group flex items-center gap-2 pb-0.5 border-b border-transparent font-serif uppercase text-[10px] tracking-widest text-indigo-300/70 transition-all duration-500 hover:text-fuchsia-100 hover:border-fuchsia-400/40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:text-fuchsia-300">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                Github
              </a>
            )}
            {p.demo_url && (
              <a
                href={p.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver demo en vivo"
                className="group flex items-center gap-2 pb-0.5 border-b border-transparent font-serif uppercase text-[10px] tracking-widest text-indigo-300/70 transition-all duration-500 hover:text-fuchsia-100 hover:border-fuchsia-400/40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:text-fuchsia-300">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Demo
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full py-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-none overflow-hidden border border-indigo-300/6 bg-[#0B0914]/40 animate-pulse"
          style={{ animationDelay: `${i * 0.08}s` }}
          aria-hidden="true"
        >
          {/* Imagen */}
          <div className="aspect-video bg-white/3" />
          {/* Body */}
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="h-2.5 w-16 bg-violet-500/10 rounded-full" />
            <div className="h-4 w-3/4 bg-white/5 rounded-full" />
            <div className="h-3 w-full bg-white/4 rounded-full" />
            <div className="h-3 w-4/5 bg-white/3 rounded-full" />
            <div className="flex gap-2 pt-1">
              <div className="h-4 w-10 bg-fuchsia-950/30 rounded-full" />
              <div className="h-4 w-12 bg-fuchsia-950/30 rounded-full" />
              <div className="h-4 w-8  bg-fuchsia-950/30 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const FILTERS = [
  { id: 'all', label: 'Todos', glyph: '·' },
  { id: 'Minijuegos', label: 'Juegos', glyph: '○' },
  { id: 'Android', label: 'Android', glyph: '◉' },
  { id: 'Aplicaciones Web', label: 'Web', glyph: '◊' },
  { id: 'Aplicaciones de Escritorio', label: 'Desktop', glyph: '◈' },
];

function FilterBar({
  activeFilter,
  onFilter,
  availableTechs = [],
  selectedTech,
  onSelectTech,
  onClearTech,
}) {
  return (
    <div className="flex flex-col items-center gap-5 mb-10 shrink-0 w-full">
      {/* 1. Categorías Macro */}
      <div
        className="flex flex-wrap justify-center gap-4 md:gap-6"
        role="group"
        aria-label="Filtrar proyectos por categoría"
      >
        {FILTERS.map(f => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilter(f.id)}
              type="button"
              aria-current={isActive ? 'true' : undefined}
              className={[
                'group relative pb-2 px-1 cursor-pointer',
                'text-[10px] font-sans-body font-medium tracking-[0.25em] uppercase',
                'flex items-center gap-2',
                'transition-all duration-500 ease-out',
                isActive
                  ? 'text-indigo-50 drop-shadow-[0_0_8px_rgba(129,140,248,0.7)] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-indigo-400/80 after:to-transparent'
                  : 'text-indigo-300/40 hover:text-indigo-100 after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-indigo-400/50 after:to-transparent hover:after:w-full hover:after:left-0 after:transition-all after:duration-500',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0914]',
              ].join(' ')}
            >
              <span aria-hidden="true" className="text-[10px]">{f.glyph}</span>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 2. Píldoras Interactivas de Tecnologías */}
      {availableTechs.length > 0 && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-2.5 pt-1">
          <div className="flex items-center gap-2 text-[9px] font-mono-hud uppercase tracking-[0.22em] text-indigo-300/45">
            <span className="text-amber-400/60" aria-hidden="true">◊</span>
            <span>Filtrar por tecnología:</span>
            {selectedTech && (
              <button
                type="button"
                onClick={onClearTech}
                className="text-amber-300/90 hover:text-white ml-1.5 cursor-pointer transition-colors underline decoration-dotted"
              >
                [Restablecer]
              </button>
            )}
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 px-2"
            role="toolbar"
            aria-label="Píldoras interactivas de tecnologías"
          >
            {availableTechs.map(({ label, total, categoryCount }) => {
              const isSelected = Boolean(
                selectedTech && selectedTech.toLowerCase() === label.toLowerCase()
              );
              const isDimmed = activeFilter !== 'all' && categoryCount === 0;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSelectTech(label)}
                  aria-pressed={isSelected}
                  className={[
                    'group relative inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono-hud tracking-wider uppercase transition-all duration-300 cursor-pointer rounded-none border',
                    isSelected
                      ? 'bg-gradient-to-r from-violet-950/90 via-indigo-950/90 to-violet-950/90 border-amber-400/90 text-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.35)] scale-105 z-10'
                      : isDimmed
                        ? 'bg-[#0B0914]/40 border-indigo-400/10 text-indigo-300/30 hover:text-indigo-200 hover:border-indigo-400/30'
                        : 'bg-[#0B0914]/65 backdrop-blur-md border-indigo-400/15 text-indigo-200/70 hover:text-white hover:border-fuchsia-400/50 hover:shadow-[0_0_12px_rgba(217,70,239,0.22)] hover:scale-[1.03]',
                  ].join(' ')}
                  title={
                    isSelected
                      ? `Quitar filtro de ${label}`
                      : isDimmed
                        ? `${label} (${total} en total · Clic para ver en todas las categorías)`
                        : `Filtrar proyectos con ${label} (${activeFilter === 'all' ? total : categoryCount})`
                  }
                >
                  <span className={isSelected ? 'font-semibold' : ''}>{label}</span>
                  <span
                    className={[
                      'text-[9px] font-sans-body px-1 py-0.2 rounded-full leading-none transition-colors',
                      isSelected
                        ? 'bg-amber-400/20 text-amber-300 font-semibold'
                        : isDimmed
                          ? 'text-indigo-400/25'
                          : 'text-indigo-400/40 group-hover:text-fuchsia-300/80',
                    ].join(' ')}
                  >
                    {activeFilter === 'all' ? total : categoryCount > 0 ? categoryCount : total}
                  </span>
                  {isSelected && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearTech();
                      }}
                      className="ml-0.5 text-amber-300 hover:text-white transition-colors cursor-pointer"
                      title="Quitar filtro"
                      aria-label="Quitar filtro"
                    >
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectList({ isAdmin = false, onEdit, onDelete }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTech, setSelectedTech] = useState(null);

  const fetchProyectos = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      // Ahora consume tu Backend Node.js
      const resData = await getProjects();

      const mapped = (resData || []).map(mapProyecto);
      setData(mapped);
      setError(null);
    } catch (err) {
      console.error('Error al cargar proyectos desde la API:', err);
      setError('No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyectos(true);
  }, []);

  // Extraer tecnologías disponibles ordenadas por popularidad
  const availableTechs = useMemo(() => {
    const counts = new Map();
    data.forEach((p) => {
      (p.tech_stack || []).forEach((t) => {
        const clean = t.trim();
        if (!clean) return;
        const key = clean.toLowerCase();
        if (!counts.has(key)) {
          counts.set(key, { label: clean, total: 0, categoryCount: 0 });
        }
        const item = counts.get(key);
        item.total += 1;
        if (activeFilter === 'all' || p.category === activeFilter) {
          item.categoryCount += 1;
        }
      });
    });
    return Array.from(counts.values()).sort((a, b) => b.total - a.total);
  }, [data, activeFilter]);

  const handleSelectTech = (tech) => {
    setSelectedTech((prev) => {
      if (prev?.toLowerCase() === tech.toLowerCase()) {
        return null;
      }
      // Si la tecnología elegida no está en la categoría actual, pasar a 'all'
      if (activeFilter !== 'all') {
        const inCategory = data.some(
          (p) =>
            p.category === activeFilter &&
            (p.tech_stack || []).some((t) => t.toLowerCase() === tech.toLowerCase())
        );
        if (!inCategory) {
          setActiveFilter('all');
        }
      }
      return tech;
    });
  };

  const filteredData = data.filter((p) => {
    const matchesCategory = activeFilter === 'all' || p.category === activeFilter;
    const matchesTech = !selectedTech || (p.tech_stack || []).some(t => t.toLowerCase() === selectedTech.toLowerCase());
    return matchesCategory && matchesTech;
  });

  if (loading) return <SkeletonGrid />;

  if (error) return (
    <div className="text-center text-rose-400/60 font-mono-hud text-xs tracking-widest py-10 w-full">
      ☽ {error}
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="flex-1 w-full flex flex-col">
        <FilterBar
          activeFilter={activeFilter}
          onFilter={setActiveFilter}
          availableTechs={availableTechs}
          selectedTech={selectedTech}
          onSelectTech={handleSelectTech}
          onClearTech={() => setSelectedTech(null)}
        />

        {filteredData.length === 0 ? (
          <div className="text-center text-indigo-300/40 font-mono-hud text-xs tracking-[0.22em] uppercase py-14 w-full flex flex-col items-center gap-3">
            <span aria-hidden="true" className="block text-2xl text-indigo-300/20">◊</span>
            <span>Sin proyectos que coincidan con la búsqueda</span>
            {(activeFilter !== 'all' || selectedTech) && (
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedTech(null);
                }}
                className="mt-2 text-[10px] uppercase tracking-widest text-amber-200 hover:text-white border border-amber-400/40 px-4 py-1.5 bg-violet-950/60 transition-all duration-300 hover:shadow-[0_0_12px_rgba(251,191,36,0.25)] cursor-pointer"
              >
                Restablecer todos los filtros ✕
              </button>
            )}
          </div>
        ) : (
          <TiltedScroll>
            {filteredData.map((p, index) => (
              <ProjectCard
                key={p.id}
                p={p}
                index={index}
                selectedTech={selectedTech}
                onSelectTech={handleSelectTech}
              />
            ))}
          </TiltedScroll>
        )}
      </div>
    );
  }

  //Vista admin CRUD
  return (
    <div className="divide-y divide-indigo-500/10">
      {data.map(p => (
        <div
          key={p.id}
          className="px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-indigo-500/5 transition-colors gap-3"
        >
          <div className="min-w-0">
            <h3 className="font-semibold text-indigo-100 text-sm flex items-center gap-2 flex-wrap">
              {p.title}
              <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-indigo-300/60 font-light before:content-['['] after:content-[']'] before:text-indigo-500/30 after:text-indigo-500/30 before:mr-1 after:ml-1">
                {CATEGORY_GLYPHS[p.category] || '·'} {p.category}
              </span>
            </h3>
            <p className="text-xs text-indigo-300/50 mt-1 truncate max-w-md tracking-wide">
              <span className="text-indigo-400/30 mr-1.5" aria-hidden="true">◊</span>
              {p.description && (
                <span>{p.description.substring(0, 55)}…</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              className="px-3 py-1.5 text-[10px] font-sans-body tracking-[0.15em] uppercase text-indigo-200/90 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-400/25 hover:border-indigo-300/60 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]"
              onClick={() => onEdit(p)}
              type="button"
            >
              Editar ◊
            </button>
            <button
              className="px-3 py-1.5 text-[10px] font-sans-body tracking-[0.15em] uppercase text-rose-300/80 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-400/50 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(244,63,94,0.15)]"
              onClick={() => onDelete(p.id)}
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
