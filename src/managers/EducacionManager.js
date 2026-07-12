import { mapEducacion } from '../utils/DataMappers.js';
import { showToast } from '../utils/Toast.js';

export class EducacionManager {
    constructor(containerId, isAdmin = false) {
        this.container = document.getElementById(containerId);
        this.isAdmin = isAdmin;
        this.data = [];
    }

    async fetchAndRender() {
        if (!this.container) return;
        this.container.innerHTML = '<div class="text-center text-slate-500 text-sm py-10 w-full">Cargando educación...</div>';
        
        try {
            const { data, error } = await window.supabaseClient
                .from('educacion')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            this.data = (data || []).map(mapEducacion);
            this.render();
        } catch (error) {
            console.error("Error al cargar educación:", error);
            showToast('No se pudo cargar la educación.', 'error');
            this.container.innerHTML = `<div class="text-center text-red-400 text-sm py-10 w-full">Error de red al cargar educación.</div>`;
        }
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';

        if (this.data.length === 0) {
            this.container.innerHTML = '<div class="text-center text-gray-400 text-sm py-10 w-full">No hay educación cargada aún.</div>';
            return;
        }

        if (!this.isAdmin) {
            this.data.forEach((edu) => {
                const colors = {
                    red: {
                        text: 'text-red-700 dark:text-red-400',
                        bg: 'bg-red-50 dark:bg-red-500/10',
                        border: 'border-red-200 dark:border-red-500/20',
                        hoverBorder: 'hover:border-red-300 dark:hover:border-red-400/50'
                    },
                    yellow: {
                        text: 'text-yellow-700 dark:text-yellow-400',
                        bg: 'bg-yellow-50 dark:bg-yellow-500/10',
                        border: 'border-yellow-200 dark:border-yellow-500/20',
                        hoverBorder: 'hover:border-yellow-300 dark:hover:border-yellow-400/50'
                    },
                    cyan: {
                        text: 'text-cyan-700 dark:text-cyan-400',
                        bg: 'bg-cyan-50 dark:bg-cyan-500/10',
                        border: 'border-cyan-200 dark:border-cyan-500/20',
                        hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-400/50'
                    },
                    pink: {
                        text: 'text-pink-700 dark:text-pink-400',
                        bg: 'bg-pink-50 dark:bg-pink-500/10',
                        border: 'border-pink-200 dark:border-pink-500/20',
                        hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-400/50'
                    },
                    purple: {
                        text: 'text-purple-700 dark:text-purple-400',
                        bg: 'bg-purple-50 dark:bg-purple-500/10',
                        border: 'border-purple-200 dark:border-purple-500/20',
                        hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-400/50'
                    }
                };
                
                const c = colors[edu.color_badge] || colors.cyan;

                const el = document.createElement('div');
                el.className = 'flex flex-col items-center gap-4 relative reveal';
                el.innerHTML = `
                    <div class="flex flex-col items-center gap-4 w-full">
                        <div class="relative w-24 h-24 lg:w-28 lg:h-28 flex items-center justify-center rounded-full border border-white dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md group ${c.hoverBorder} transition-colors shadow-sm dark:shadow-lg">
                            <div class="absolute inset-0 border border-slate-100 dark:border-white/5 rounded-full scale-[1.15]"></div>
                            <div class="absolute inset-0 border border-slate-50 dark:border-white/5 rounded-full scale-[1.3] opacity-50"></div>
                            <div class="w-12 h-12 lg:w-14 lg:h-14 rounded-full ${c.bg} border ${c.border} flex items-center justify-center shadow-sm dark:shadow-none">
                                <span class="${c.text} text-xl lg:text-2xl font-bold">${edu.siglas}</span>
                            </div>
                        </div>
                        <p class="text-[11px] lg:text-xs text-center text-slate-500 dark:text-gray-400 max-w-[140px] leading-tight mt-1 font-medium">
                            <strong class="block text-slate-900 dark:text-white font-bold mb-1">${edu.titulo}</strong>
                            <span>en ${edu.institucion}</span>
                        </p>
                    </div>
                `;
                this.container.appendChild(el);
            });
        } 
        else {
            this.data.forEach(e => {
                const el = document.createElement('div');
                el.className = 'p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors gap-4 rounded-2xl';
                el.innerHTML = `
                    <div>
                        <h4 class="font-bold text-slate-900 dark:text-white">${e.titulo}</h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">${e.institucion} | ${e.fecha}</p>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <button class="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300" onclick="window.editEducation('${e.id}')">Editar</button>
                        <button class="text-sm font-medium text-fuchsia-500 dark:text-fuchsia-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-300 transition-colors" onclick="window.deleteEducation('${e.id}')">Eliminar</button>
                    </div>
                `;
                this.container.appendChild(el);
            });
        }
    }
}
