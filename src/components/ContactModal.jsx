import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendContactMessage } from '../services/api';

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  // Cerrar el modal con la tecla 'Escape'
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await sendContactMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal accesible */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0B0914]/95 border border-fuchsia-900/30 rounded-2xl p-6 md:p-8 max-w-lg w-full relative shadow-[0_0_40px_rgba(192,132,252,0.1)] pointer-events-auto"
            >
              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-indigo-300/50 hover:text-white transition-colors p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 cursor-pointer"
                aria-label="Cerrar modal de contacto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <motion.svg
                    width="80"
                    height="80"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-amber-200"
                    style={{ filter: "drop-shadow(0px 0px 8px rgba(251,191,36,0.5))" }}
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
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                    <motion.path
                      d="M17 26 L23 32 L34 19"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                    />
                  </motion.svg>

                  <h3 className="mt-6 font-serif-display text-base uppercase tracking-[0.2em] text-indigo-100">
                    MENSAJE ENVIADO ◊
                  </h3>
                  <p className="mt-2 text-xs text-indigo-200/60 font-sans-body max-w-xs">
                    ¡Gracias por comunicarte! Te responderé a la brevedad.
                  </p>

                  <button
                    onClick={onClose}
                    type="button"
                    className="mt-6 px-6 py-2 border border-indigo-400/30 hover:border-indigo-300 text-[10px] tracking-widest text-indigo-200 hover:text-white transition-all duration-300 uppercase cursor-pointer rounded-lg"
                  >
                    Cerrar
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 id="contact-modal-title" className="font-serif-display text-2xl font-semibold mb-6 text-white tracking-widest text-glow">
                    Contacto
                  </h2>

                  {status === 'error' && (
                    <div role="alert" className="mb-4 text-center text-rose-400 text-xs tracking-wider font-mono p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      Hubo una interferencia al enviar el mensaje. Por favor intenta nuevamente.
                    </div>
                  )}

                  {/* Formulario con Labels Accesibles */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-name" className="text-[10px] font-mono tracking-[0.18em] uppercase text-indigo-300/70">
                        Tu Nombre
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nombre y apellido"
                        required
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-indigo-100 placeholder:text-indigo-300/30 outline-none transition-all duration-300 focus:border-amber-200/50 focus:shadow-[0_0_10px_rgba(251,191,36,0.1)] text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-email" className="text-[10px] font-mono tracking-[0.18em] uppercase text-indigo-300/70">
                        Tu Correo Electrónico
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu-email@ejemplo.com"
                        required
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-indigo-100 placeholder:text-indigo-300/30 outline-none transition-all duration-300 focus:border-amber-200/50 focus:shadow-[0_0_10px_rgba(251,191,36,0.1)] text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-message" className="text-[10px] font-mono tracking-[0.18em] uppercase text-indigo-300/70">
                        Mensaje
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Escribe aquí tu mensaje..."
                        required
                        rows="4"
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-indigo-100 placeholder:text-indigo-300/30 outline-none transition-all duration-300 focus:border-amber-200/50 focus:shadow-[0_0_10px_rgba(251,191,36,0.1)] resize-none text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="mt-4 w-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-amber-200/50 text-xs tracking-[0.2em] text-white py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {status === 'submitting' ? (
                        <>
                          <span>ENVIANDO...</span>
                          <svg className="animate-spin w-4 h-4 text-amber-200/80 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>ENVIAR MENSAJE</span>
                          <span className="text-amber-200/90 text-[10px] drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">◊</span>
                        </>
                      )}
                    </button>
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
