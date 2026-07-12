import { mapProyecto } from '../utils/DataMappers.js';
import { showToast } from '../utils/Toast.js';

export class ProyectoManager {
    constructor(containerId, isAdmin = false) {
        this.container = document.getElementById(containerId);
        this.isAdmin = isAdmin;
        this.data = [];
    }

    async fetchAndRender() {
        if (!this.container) return;
        this.container.innerHTML = '<div class="col-span-full text-center text-slate-500 text-sm py-10">Cargando proyectos...</div>';
        
        try {
            const { data, error } = await window.supabaseClient
                .from('proyectos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            this.data = (data || []).map(mapProyecto);
            this.render();
        } catch (error) {
            console.error("Error al cargar proyectos:", error);
            showToast('No se pudieron cargar los proyectos.', 'error');
            this.container.innerHTML = `<div class="col-span-full text-center text-red-400 text-sm py-10">Error de red al cargar proyectos.</div>`;
        }
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';

        if (this.data.length === 0) {
            this.container.innerHTML = '<div class="col-span-full text-center text-gray-400 text-sm py-10">No hay proyectos para mostrar aún.</div>';
            return;
        }

        if (!this.isAdmin) {
            this.data.forEach((p, index) => {
                const techStack = p.tech_stack.slice(0, 3); 

                const card = document.createElement('div');
                card.className = 'project-card reveal glass-panel !bg-white/80 dark:!bg-white/5 !border-white/60 dark:!border-white/10 rounded-2xl overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:border-cyan-300 dark:hover:border-themePrimary/50 shadow-md';
                card.setAttribute('data-category', p.category);

                let imgUrl = p.image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600&h=400';
                if (!p.image_url) {
                    if (p.category === 'game') imgUrl = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600&h=400';
                    if (p.category === 'backend') imgUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=400';
                }

                const actionUrl = p.demo_url || p.github_url || '#';

                card.innerHTML = `
                    <a href="${actionUrl}" target="_blank" class="block h-full relative cursor-pointer">
                        <div class="h-40 md:h-48 overflow-hidden relative">
                            <img src="${imgUrl}" alt="${p.title}" class="w-full h-full object-cover opacity-90 dark:opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                            <div class="absolute bottom-2 left-2 flex gap-2">
                                <span class="bg-white/80 dark:bg-black/50 backdrop-blur-md p-1.5 rounded-md text-slate-800 dark:text-white shadow-sm dark:shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </span>
                            </div>
                        </div>
                        <div class="p-5 flex flex-col justify-between flex-1 relative z-10">
                            <span class="text-sm font-bold truncate text-slate-900 dark:text-white" title="${p.title}">${p.title}</span>
                            <p class="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-2 leading-snug">${p.description}</p>
                            <div class="flex gap-1.5 mt-3 flex-wrap">
                                ${techStack.map(tech => `
                                    <span class="rounded-full bg-cyan-100/60 dark:bg-cyan-500/10 border border-cyan-200/50 dark:border-cyan-500/20 flex items-center justify-center text-[9px] font-bold text-cyan-800 dark:text-cyan-300 px-2 py-0.5 truncate">${tech}</span>
                                `).join('')}
                            </div>
                        </div>
                    </a>
                `;
                this.container.appendChild(card);
            });
            
            if (window.bindFilters) window.bindFilters();
        } 
        else {
            this.data.forEach(p => {
                const el = document.createElement('div');
                el.className = 'p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors gap-4 rounded-2xl';
                el.innerHTML = `
                    <div>
                        <h4 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            ${p.title}
                            <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${p.category}</span>
                        </h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate max-w-md">${p.description}</p>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <button class="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300" onclick="window.editProject('${p.id}')">Editar</button>
                        <button class="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" onclick="window.deleteProject('${p.id}')">Eliminar</button>
                    </div>
                `;
                this.container.appendChild(el);
            });
        }
    }
}
