import { mapExperiencia } from '../utils/DataMappers.js';
import { showToast } from '../utils/Toast.js';

export class ExperienciaManager {
    constructor(containerId, isAdmin = false) {
        this.container = document.getElementById(containerId);
        this.isAdmin = isAdmin;
        this.data = [];
    }

    async fetchAndRender() {
        if (!this.container) return;
        this.container.innerHTML = '<div class="text-center text-slate-500 text-sm py-10 w-full">Cargando experiencia...</div>';
        try {
            const { data, error } = await window.supabaseClient
                .from('experiencia')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            this.data = (data || []).map(mapExperiencia);
            this.render();
        } catch (error) {
            console.error("Error al cargar experiencia:", error);
            showToast('No se pudo cargar la experiencia.', 'error');
            this.container.innerHTML = `<div class="text-center text-red-400 text-sm py-10 w-full">Error de red al cargar experiencia.</div>`;
        }
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';

        if (this.data.length === 0) {
            this.container.innerHTML = '<div class="text-center text-gray-400 text-sm py-10 w-full">No hay experiencia cargada aún.</div>';
            return;
        }

        // portfolio
        if (!this.isAdmin) {
            this.data.forEach((exp, index) => {
                const isFirst = index === 0;
                
                const el = document.createElement('div');
                el.className = 'relative reveal';
                el.innerHTML = `
                    <div class="absolute -left-[31px] top-1.5 z-10 w-${isFirst ? '3.5' : '2.5'} h-${isFirst ? '3.5' : '2.5'} rounded-full ${isFirst ? 'bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_10px_#00f2fe]' : 'border border-slate-300 dark:border-gray-500 bg-slate-100 dark:bg-[#030712]'}"></div>
                    <div class="glass-panel !bg-white/60 dark:!bg-white/5 p-4 lg:p-5 !border-white/60 dark:!border-white/10 ml-2 sm:ml-4 ${isFirst ? '' : 'opacity-80 dark:opacity-60 hover:opacity-100 transition-opacity'}" id="card-${exp.id}">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <h4 class="font-bold text-sm lg:text-base text-slate-900 dark:text-white">${exp.empresa} - ${exp.cargo}</h4>
                            <span class="text-xs ${isFirst ? 'text-cyan-700 dark:text-cyan-400 font-medium' : 'text-slate-500 dark:text-gray-400'} whitespace-nowrap">${exp.fecha_inicio}</span>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-gray-300 mb-3">${exp.descripcion}</p>
                        <div class="flex flex-wrap gap-2 mt-3">
                            ${exp.tecnologias.map(t => `
                                <span class="text-[11px] bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-2.5 py-1 rounded-md text-slate-700 dark:text-gray-300 flex items-center gap-1.5 font-medium">
                                    <span class="w-2 h-2 rounded-full bg-cyan-500 dark:bg-white/20 inline-block"></span> ${t}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
                this.container.appendChild(el);
            });
        } 
        //  Admin Panel
        else {
            this.data.forEach(e => {
                const el = document.createElement('div');
                el.className = 'p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors gap-4 rounded-2xl';
                el.innerHTML = `
                    <div>
                        <h4 class="font-bold text-slate-900 dark:text-white">${e.cargo} en ${e.empresa}</h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">${e.fecha_inicio} | ${e.descripcion.substring(0, 60)}...</p>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <button class="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300" onclick="window.editExperience('${e.id}')">Editar</button>
                        <button class="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" onclick="window.deleteExperience('${e.id}')">Eliminar</button>
                    </div>
                `;
                this.container.appendChild(el);
            });
        }
    }
}
