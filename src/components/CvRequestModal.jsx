import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestCvAccess } from '../services/api';

export default function CvRequestModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    b_website: '' // Campo trampa honeypot para bots
  });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cvUrl, setCvUrl] = useState('');

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setStatus('idle');
      setErrorMessage('');
    }, 300);
  }, [onClose]);

  // Cerrar el modal con tecla 'Escape'
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await requestCvAccess({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        honeypot: formData.b_website
      });

      if (response?.cvUrl) {
        setCvUrl(response.cvUrl);
        setStatus('success');
      } else {
        throw new Error('No se pudo recuperar el enlace del currículum.');
      }
    } catch (err) {
      console.error('Error al solicitar CV:', err);
      setErrorMessage(err.message || 'Hubo un error al procesar tu solicitud. Intenta nuevamente.');
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop con desenfoque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal flotante */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cv-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-[#0B0914]/95 border border-fuchsia-900/35 rounded-2xl p-6 md:p-8 max-w-md w-full relative shadow-[0_0_40px_rgba(192,132,252,0.12)] pointer-events-auto"
            >
              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 text-indigo-300/50 hover:text-white transition-colors p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 cursor-pointer"
                aria-label="Cerrar ventana de acceso al currículum"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-6 text-center"
                >
                  {/* Animación del círculo y tilde místico */}
                  <motion.svg
                    width="74"
                    height="74"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-amber-200"
                    style={{ filter: "drop-shadow(0px 0px 10px rgba(251,191,36,0.5))" }}
                    aria-hidden="true"
                  >
                    <motion.circle
                      cx="25"
                      cy="25"
                      r="22"
                      stroke="currentColor"
                      strokeWidth="2"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    />
                    <motion.path
                      d="M16 26 L22 32 L34 18"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.7, ease: "easeInOut", delay: 0.15 }}
                    />
                  </motion.svg>

                  <h3 className="mt-5 font-serif-display text-base uppercase tracking-[0.22em] text-indigo-100 flex items-center gap-1.5">
                    <span>ACCESO CONCEDIDO</span>
                    <span className="text-amber-200/90 text-xs">◊</span>
                  </h3>

                  <p className="mt-2 text-xs md:text-sm text-indigo-100/90 font-sans-body max-w-xs leading-relaxed">
                    ¡Gracias por tu interés, <span className="text-white font-medium">{formData.name}</span>! Se ha habilitado el acceso a mi Currículum Vitae.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 w-full">
                    {/* Botón directo para abrir o descargar */}
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-900/60 via-indigo-900/50 to-violet-900/60 hover:from-violet-800/80 hover:to-indigo-800/70 border border-violet-400/40 hover:border-amber-300/60 text-xs font-semibold tracking-[0.2em] uppercase text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.25)] transition-all duration-300"
                    >
                      <span>ABRIR CV AHORA</span>
                      <span className="text-amber-300 text-sm">↗</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-[10px] tracking-[0.18em] uppercase text-indigo-300/60 hover:text-indigo-200 py-2 transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="mb-5 space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.22em] uppercase text-indigo-300/80">
                      <span className="text-amber-200/90 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">◊</span>
                      <span>DOCUMENTO PROFESIONAL</span>
                    </div>
                    <h2 id="cv-modal-title" className="font-serif-display text-xl sm:text-2xl font-semibold text-white tracking-wide text-glow">
                      Acceso al Currículum
                    </h2>
                    <p className="text-xs md:text-sm text-indigo-100/90 font-sans-body leading-relaxed pt-1">
                      Por favor, indícame tu nombre y correo para acceder al CV completo y datos de contacto directo.
                    </p>
                  </div>

                  {status === 'error' && (
                    <div role="alert" className="mb-4 text-center text-rose-300 text-xs tracking-wider font-mono p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      {errorMessage || 'Ocurrió un error. Por favor intenta nuevamente.'}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                    {/* Campo Trampa Honeypot invisible para humanos */}
                    <div className="absolute opacity-0 pointer-events-none -left-[9999px]" aria-hidden="true">
                      <input
                        type="text"
                        name="b_website"
                        value={formData.b_website}
                        onChange={handleChange}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    {/* Nombre y Apellido */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="cv-name" className="text-[10px] font-mono tracking-[0.18em] uppercase text-indigo-300/70 flex items-center gap-1.5">
                        <span className="text-violet-400/70 text-[8px]">◊</span>
                        <span>Nombre y Apellido *</span>
                      </label>
                      <input
                        id="cv-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nombre Apellido"
                        required
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-indigo-100 placeholder:text-indigo-300/30 outline-none transition-all duration-300 focus:border-amber-200/50 focus:shadow-[0_0_10px_rgba(251,191,36,0.1)] text-sm"
                      />
                    </div>

                    {/* Correo Electrónico */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="cv-email" className="text-[10px] font-mono tracking-[0.18em] uppercase text-indigo-300/70 flex items-center gap-1.5">
                        <span className="text-violet-400/70 text-[8px]">◊</span>
                        <span>Correo Electrónico *</span>
                      </label>
                      <input
                        id="cv-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="correo@empresa.com"
                        required
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-indigo-100 placeholder:text-indigo-300/30 outline-none transition-all duration-300 focus:border-amber-200/50 focus:shadow-[0_0_10px_rgba(251,191,36,0.1)] text-sm"
                      />
                    </div>

                    {/* Empresa  */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="cv-company" className="text-[10px] font-mono tracking-[0.18em] uppercase text-indigo-300/70 flex items-center gap-1.5">
                        <span className="text-violet-400/70 text-[8px]">◊</span>
                        <span>Empresa u Organización <span className="text-indigo-300/40 lowercase text-[9px]">(opcional)</span></span>
                      </label>
                      <input
                        id="cv-company"
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Empresa / Particular"
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-indigo-100 placeholder:text-indigo-300/30 outline-none transition-all duration-300 focus:border-amber-200/50 focus:shadow-[0_0_10px_rgba(251,191,36,0.1)] text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="mt-3 w-full bg-gradient-to-r from-violet-900/50 via-indigo-900/40 to-violet-900/50 hover:from-violet-800/60 hover:to-indigo-800/50 border border-violet-400/35 hover:border-amber-300/60 text-xs tracking-[0.22em] text-white py-3.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_25px_rgba(251,191,36,0.2)] transition-all duration-300 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {status === 'submitting' ? (
                        <>
                          <span>VERIFICANDO ACCESO...</span>
                          <svg className="animate-spin w-4 h-4 text-amber-200/80 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">DESBLOQUEAR CV</span>
                          <span className="text-amber-200/90 text-[10px] drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">◊</span>
                        </>
                      )}
                    </button>

                    <p className="text-[9px] text-center text-indigo-300/40 font-mono tracking-wider pt-1">
                      Tus datos son privados y no serán compartidos con terceros.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

