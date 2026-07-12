import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ExperienciaList from './components/ExperienciaList';
import EducacionList from './components/EducacionList';
import ProjectList from './components/ProjectList';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';
import MysticalBackground from './components/MysticalBackground';
import LoaderGlobal from './components/LoaderGlobal';
import MouseGlowLayout from './components/MouseGlowLayout';
import MysticalCursor from './components/MysticalCursor';
import ContactModal from './components/ContactModal';
import { DEMO_EMAIL } from './hooks/useDemoGuard';

const GLOW_VARIANTS = {
  proyectos: [
    { cls: 'ambient-orb ambient-orb--violet-main', style: { top: '-80px', left: '20%' } },
    { cls: 'ambient-orb ambient-orb--fuchsia', style: { bottom: '-60px', right: '15%' } },
    { cls: 'ambient-orb ambient-orb--violet-soft', style: { top: '40%', left: '-60px' } },
  ],
  educacion: [
    { cls: 'ambient-orb ambient-orb--violet-main', style: { top: '-60px', right: '25%' } },
    { cls: 'ambient-orb ambient-orb--cyan', style: { bottom: '-80px', left: '20%' } },
  ],
  experiencia: [
    { cls: 'ambient-orb ambient-orb--violet-soft', style: { top: '-50px', left: '35%' } },
    { cls: 'ambient-orb ambient-orb--fuchsia-soft', style: { bottom: '-70px', right: '20%' } },
  ],
  inicio: [
    { cls: 'ambient-orb ambient-orb--violet-main', style: { top: '-100px', left: '15%' } },
    { cls: 'ambient-orb ambient-orb--fuchsia', style: { bottom: '-80px', right: '10%' } },
  ],
  admin: [
    { cls: 'ambient-orb ambient-orb--violet-soft', style: { top: '-60px', left: '30%' } },
  ],
};

function AmbientGlow({ variant = 'proyectos' }) {
  const orbs = GLOW_VARIANTS[variant] ?? GLOW_VARIANTS.proyectos;
  return (
    <>
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`${orb.cls} hidden md:block`}
          style={orb.style}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

function TabPanel({ children, maxWidth = 'max-w-4xl', className = '', glow = null }) {
  return (
    <div
      className={[
        'relative overflow-hidden w-full mx-auto',
        'rounded-2xl',
        'p-6 md:p-10',
        maxWidth,
        className,
      ].join(' ')}
    >
      {glow && <AmbientGlow variant={glow} />}

      <div className="neon-orbit-line" aria-hidden="true" />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}



//App 
const SECTIONS = ['inicio', 'experiencia', 'educacion', 'proyectos', 'admin'];

const swipeVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
    scale: 0.98,
  }),
};

function App() {
  const initialTab = () => {
    const hash = window.location.hash.replace('#', '');
    return SECTIONS.includes(hash) ? hash : 'inicio';
  };

  const [activeTab, setActiveTab] = useState(initialTab);
  const [direction, setDirection] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [fakeSession, setFakeSession] = useState(null);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSwiped, setHasSwiped] = useState(false);

  const toastTimerRef = useRef(null);
  const effectiveSession = session || fakeSession;

  const [profile, setProfile] = useState({
    name: 'Daniela Cabrera',
    title: 'Técnica en programación & Desarrolladora de software',
    url_foto: '',
  });

  const addToast = useCallback((message, type = 'info') => {

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (SECTIONS.includes(hash)) {
        const newIndex = SECTIONS.indexOf(hash);
        const currentIndex = SECTIONS.indexOf(activeTab);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  const handleTabChange = useCallback((newTab) => {
    if (newTab === activeTab) return;
    const currentIndex = SECTIONS.indexOf(activeTab);
    const newIndex = SECTIONS.indexOf(newTab);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
    window.history.replaceState(null, null, `#${newTab}`);
  }, [activeTab]);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const currentIndex = SECTIONS.indexOf(activeTab);

    if (distance > minSwipeDistance && currentIndex < SECTIONS.length - 1) {
      setHasSwiped(true);
      const newTab = SECTIONS[currentIndex + 1];
      setDirection(1);
      setActiveTab(newTab);
      window.history.replaceState(null, null, `#${newTab}`);
    } else if (distance < -minSwipeDistance && currentIndex > 0) {
      setHasSwiped(true);
      const newTab = SECTIONS[currentIndex - 1];
      setDirection(-1);
      setActiveTab(newTab);
      window.history.replaceState(null, null, `#${newTab}`);
    }
  };

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const STORAGE_KEY = 'codaDot_visited';
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Detectar tipo de dispositivo
    const getDeviceType = () => {
      const ua = navigator.userAgent || '';
      if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
      if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return 'mobile';
      return 'desktop';
    };

    (async () => {
      try {
        console.log("Attempting to insert new visit into analytics table...");
        const { error } = await supabase
          .from('analytics')
          .insert([{ device_type: getDeviceType() }]);

        if (error) {
          console.error("Error inserting visit:", error);
        } else {
          console.log("Visit inserted successfully!");
          localStorage.setItem(STORAGE_KEY, 'true');
        }
      } catch (err) {
        console.error("Catch error inserting visit:", err);
      }
    })();
  }, []);


  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('configuracion')
          .select('*')
          .eq('id', 'perfil_data')
          .single();

        if (error) throw error;

        if (data && data.theme) {
          const parsed = JSON.parse(data.theme);
          setProfile({
            name: parsed.name || 'Daniela Cabrera',
            title: parsed.title || 'Técnica en programación & Desarrolladora de software',
            url_foto: parsed.image || parsed.url_foto,
          });
        }
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);


  const handleGuestAccess = () => {
    setFakeSession({ user: { email: DEMO_EMAIL, id: 'demo-guest-local' } });
    setActiveTab('admin');
    addToast('[ Invitado ]', 'demo');
  };

  const handleDemoLogout = () => {
    setFakeSession(null);
    setActiveTab('inicio');
    addToast('Modo Demo cerrado.', 'info');
  };

  if (isLoading) return <LoaderGlobal />;

  return (
    <MouseGlowLayout className="w-full min-h-screen">
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <MysticalCursor />
      <div className="relative w-full min-h-screen flex flex-col font-sans overflow-x-hidden bg-[var(--color-light)] text-[var(--color-dark)]">

        <MysticalBackground />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-2 md:px-8 flex flex-col min-h-screen bg-transparent">

          <Navbar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            session={effectiveSession}
            onContactClick={() => setIsContactOpen(true)}
          />

          <main className="flex-1 flex flex-col items-center justify-center pt-4 md:pt-6 pb-10">
            <div className="w-full">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeTab}
                  custom={direction}
                  variants={typeof window !== 'undefined' && window.innerWidth < 768 ? {} : swipeVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="w-full"
                >
                  <div
                    className="w-full touch-pan-y"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                  {activeTab === 'inicio' && (
                    <TabPanel key="inicio" maxWidth="max-w-6xl" className="py-12 md:py-16 px-4 md:px-8" glow="inicio">
                      <Hero
                        profile={profile}
                        onContactClick={() => setIsContactOpen(true)}
                      />
                    </TabPanel>
                  )}

                  {activeTab === 'experiencia' && (
                    <TabPanel key="experiencia" glow="experiencia">
                      <h2 className="font-serif-display text-2xl md:text-3xl font-semibold mb-8 text-center text-glow text-white tracking-widest">
                        Experiencia Laboral
                      </h2>
                      <ExperienciaList isAdmin={false} />
                    </TabPanel>
                  )}

                  {activeTab === 'educacion' && (
                    <TabPanel key="educacion" glow="educacion">
                      <h2 className="font-serif-display text-2xl md:text-3xl font-semibold mb-8 text-center text-glow text-white tracking-widest">
                        Educación y Títulos
                      </h2>
                      <EducacionList isAdmin={false} />
                    </TabPanel>
                  )}

                  {activeTab === 'proyectos' && (
                    <TabPanel key="proyectos" maxWidth="max-w-5xl" glow="proyectos">
                      <h2 className="font-serif-display text-2xl md:text-3xl font-semibold mb-8 text-center text-glow text-white tracking-widest">
                        Mis Proyectos
                      </h2>
                      <ProjectList isAdmin={false} />
                    </TabPanel>
                  )}

                  {activeTab === 'admin' && (
                    <TabPanel key="admin" glow="admin">
                      <AdminPanel
                        session={effectiveSession}
                        addToast={addToast}
                        onGuestLogin={handleGuestAccess}
                        onDemoLogout={handleDemoLogout}
                      />
                    </TabPanel>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            </div>
          </main>

          <AnimatePresence>
            {!hasSwiped && activeTab === 'inicio' && (
              <motion.div
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:hidden pointer-events-none"
                exit={{ opacity: 0, transition: { duration: 1 } }}
              >
                <motion.div
                  className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-indigo-200/50"
                  animate={{ x: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <span>Deslizar</span>
                  <span className="text-[8px] drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] text-amber-200/90">◊</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer
            className="mt-auto px-6 md:px-10 py-5 border-t border-indigo-400/8 glass-panel-blur"
            style={{ background: 'rgba(11,9,20,0.85)' }}
            role="contentinfo"
          >
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

              <div className="flex items-center gap-2 text-indigo-300 text-xs tracking-widest">
                <span className="text-indigo-400/70" aria-hidden="true">◊</span>
                <span>Frecuencia Estable</span>
              </div>

              <p className="text-[11px] tracking-wider text-indigo-200/40 text-center">
                © {new Date().getFullYear()}&nbsp;
                <span className="text-indigo-300/60">Daniela Cabrera</span>
              </p>

              {/* Stack */}
              <div className="flex items-center gap-3" aria-label="Stack tecnológico">
                {['React', 'Supabase', 'Vite'].map((tech, i) => (
                  <span key={tech} className="flex items-center gap-3 text-[9px] text-indigo-200/40 tracking-[0.2em] uppercase">
                    {tech}
                    {i < 2 && <span className="text-indigo-400/30" aria-hidden="true">·</span>}
                  </span>
                ))}
              </div>

            </div>
          </footer>
        </div>

        {toast && (
          <div className="mystic-toast-container" role="status" aria-live="polite" aria-atomic="true">
            <Toast message={toast.message} type={toast.type} />
          </div>
        )}

        {isContactOpen && (
          <ContactModal onClose={() => setIsContactOpen(false)} />
        )}
      </div>
    </MouseGlowLayout>
  );
}

export default App;
