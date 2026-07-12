import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setStatus('submitting');

    try {
      const response = await fetch('https://formspree.io/f/xgojrjpb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0B0914]/95 border border-fuchsia-900/30 rounded-2xl p-6 md:p-8 max-w-lg w-full relative shadow-[0_0_40px_rgba(192,132,252,0.1)] pointer-events-auto"
            >
              {/*Botón Cerrar */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-indigo-300/50 hover:text-white transition-colors p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
                aria-label="Cerrar modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <motion.svg
                    width="80"
                    height="80"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-amber-200"
                    style={{ filter: "drop-shadow(0px 0px 8px rgba(251,191,36,0.5))" }}
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

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 font-serif text-xs uppercase tracking-[0.2em] text-indigo-100"
                  >
                    MENSAJE ENVIADO  ◊
                  </motion.p>

                  <button
                    onClick={onClose}
                    type="button"
                    className="mt-8 text-[10px] tracking-widest text-indigo-300/50 hover:text-white transition-colors focus-visible:outline-none uppercase"
                  >
                    Cerrar
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 className="font-serif-display text-2xl font-semibold mb-6 text-white tracking-widest text-glow">
                    Contacto
                  </h2>

                  {status === 'error' && (
                    <div className="mb-4 text-center text-rose-400 text-sm tracking-widest font-mono p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      Hubo una interferencia. Intenta nuevamente.
                    </div>
                  )}

                  {/* Formulario */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu Nombre"
                      required
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-indigo-100 placeholder:text-indigo-300/30 outline-none transition-all duration-500 focus:border-amber-200/50 focus:shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Tu Correo Electrónico"
                      required
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-indigo-100 placeholder:text-indigo-300/30 outline-none transition-all duration-500 focus:border-amber-200/50 focus:shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                    />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tu Mensaje..."
                      required
                      rows="4"
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-indigo-100 placeholder:text-indigo-300/30 outline-none transition-all duration-500 focus:border-amber-200/50 focus:shadow-[0_0_10px_rgba(251,191,36,0.1)] resize-none"
                    />

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="mt-6 w-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-amber-200/50 text-xs tracking-[0.2em] text-white py-4 rounded-lg transition-all duration-500 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:border-white/20 disabled:hover:bg-white/10"
                    >
                      {status === 'submitting' ? (
                        <>
                          ENVIANDO...
                          <svg className="animate-spin w-4 h-4 text-amber-200/80 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          ENVIAR MENSAJE
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
