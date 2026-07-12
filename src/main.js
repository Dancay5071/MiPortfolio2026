import { showToast } from './utils/Toast.js';
import { ExperienciaManager } from './managers/ExperienciaManager.js';
import { EducacionManager } from './managers/EducacionManager.js';
import { ProyectoManager } from './managers/ProyectoManager.js';

//Tema 
async function changeTheme(themeName) {
    const palettes = {
        neon: { primary: '0 242 254', secondary: '254 9 121', tertiary: '138 43 226' },
        cyberpunk: { primary: '0 240 255', secondary: '255 0 60', tertiary: '252 238 9' },
        matrix: { primary: '0 255 65', secondary: '0 143 17', tertiary: '0 255 65' }
    };
    const palette = palettes[themeName];
    if (palette) {
        localStorage.setItem('portfolio_theme', themeName);
        localStorage.removeItem('custom_theme');
        const root = document.documentElement;
        root.style.setProperty('--color-primary', palette.primary);
        root.style.setProperty('--color-secondary', palette.secondary);
        root.style.setProperty('--color-tertiary', palette.tertiary);

        try {
            await window.supabaseClient.from('configuracion').delete().eq('id', 'custom_theme');
            await window.supabaseClient.from('configuracion').upsert({ id: 'current_theme', theme: themeName });
        } catch (e) {
            console.error("No se pudo guardar el tema en la BD", e);
        }
    }
}
window.changeTheme = changeTheme;
(async () => {
    
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    if (btnThemeToggle) {
        if (localStorage.getItem('theme') !== 'light') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        btnThemeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            if (document.documentElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Lógica del Botón Login
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    // Lógica del menú móvil 
    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    const iconHamburger = document.getElementById('icon-hamburger');
    const iconClose = document.getElementById('icon-close');

    if (btnMobileMenu && mobileMenu && mobileMenuDrawer) {
        const openMobileMenu = () => {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                mobileMenu.classList.remove('opacity-0');
                mobileMenuDrawer.classList.remove('translate-x-full');
            }, 10);
            iconHamburger.classList.add('hidden');
            iconHamburger.classList.remove('block');
            iconClose.classList.remove('hidden');
            iconClose.classList.add('block');
        };

        const closeMobileMenu = () => {
            mobileMenu.classList.add('opacity-0');
            mobileMenuDrawer.classList.add('translate-x-full');
            iconHamburger.classList.remove('hidden');
            iconHamburger.classList.add('block');
            iconClose.classList.add('hidden');
            iconClose.classList.remove('block');
            setTimeout(() => {
                if (mobileMenu.classList.contains('opacity-0')) {
                    mobileMenu.classList.add('hidden');
                }
            }, 300);
        };

        btnMobileMenu.addEventListener('click', () => {
            if (mobileMenu.classList.contains('hidden')) {
                openMobileMenu();
            } else {
                closeMobileMenu();
            }
        });

        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });

        const mobileNavLinks = mobileMenu.querySelectorAll('.nav-btn');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });
    }

    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.portfolio-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            navBtns.forEach(nav => {
                nav.classList.remove('text-cyan-600', 'text-cyan-700', 'border-cyan-500', 'border-cyan-600', 'dark:text-cyan-400', 'dark:border-cyan-400');
                nav.classList.add('text-gray-600', 'border-transparent', 'dark:text-gray-400');
            });
            btn.classList.remove('text-gray-600', 'border-transparent', 'dark:text-gray-400');
            btn.classList.add('text-cyan-700', 'border-cyan-600', 'dark:text-cyan-400', 'dark:border-cyan-400');

            sections.forEach(sec => {
                if (sec.id === targetId) {
                    sec.classList.remove('hidden');
                    sec.classList.remove('tab-active');
                    void sec.offsetWidth;
                    sec.classList.add('tab-active');
                    const revealElements = sec.querySelectorAll('.reveal');
                    revealElements.forEach((el, idx) => {
                        el.classList.remove('active');
                        setTimeout(() => el.classList.add('active'), 50 + (idx * 50));
                    });
                } else {
                    sec.classList.add('hidden');
                    sec.classList.remove('tab-active');
                }
            });
        });
    });

    let isAdmin = false;
    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        isAdmin = !!session;
    } catch (e) {
        console.warn("Supabase auth check failed", e);
    }

    const expManager = new ExperienciaManager('experience-container', isAdmin);
    const eduManager = new EducacionManager('education-container', isAdmin);
    const projManager = new ProyectoManager('project-grid', isAdmin);

    // Cargar perfil dinámico
    const loadProfile = async () => {
        try {
            const { data } = await window.supabaseClient.from('configuracion').select('*').eq('id', 'perfil_data').single();
            if (data && data.theme) {
                const p = JSON.parse(data.theme);
                if (p.name) document.getElementById('portfolio-name').innerHTML = p.name;
                if (p.title) document.getElementById('portfolio-title').innerHTML = p.title;
                if (p.image || p.url_foto) {
                    const imageSource = p.image || p.url_foto;
                    const timestamp = new Date().getTime();
                    const imageUrl = imageSource.includes('?') ? `${imageSource}&t=${timestamp}` : `${imageSource}?t=${timestamp}`;
                    const imgElem = document.getElementById('foto-perfil');
                    if (imgElem) imgElem.src = imageUrl;
                }
            }
        } catch (e) {
        }
    };

    // Filtros de proyectos
    window.bindFilters = () => {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('bg-slate-800', 'text-white', 'shadow-md', 'dark:bg-white', 'dark:text-black', 'dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]');
                    b.classList.add('bg-white/60', 'text-slate-600', 'dark:bg-white/5', 'dark:text-gray-300');
                });

                newBtn.classList.add('bg-slate-800', 'text-white', 'shadow-md', 'dark:bg-white', 'dark:text-black', 'dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]');
                newBtn.classList.remove('bg-white/60', 'text-slate-600', 'dark:bg-white/5', 'dark:text-gray-300');

                const filterValue = newBtn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');

                    if (filterValue === 'all' || filterValue === category) {
                        card.style.display = 'block';
                        card.animate([
                            { opacity: 0, transform: 'scale(0.95)' },
                            { opacity: 1, transform: 'scale(1)' }
                        ], { duration: 300, easing: 'ease-out' });
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    };

    // Inicializar carga de datos
    loadProfile();
    expManager.fetchAndRender();
    eduManager.fetchAndRender();
    projManager.fetchAndRender();

    try {
        const { data: customData } = await window.supabaseClient.from('configuracion').select('*').eq('id', 'custom_theme').single();
        if (customData && customData.theme) {
            localStorage.setItem('custom_theme', customData.theme);
            const palette = JSON.parse(customData.theme);
            const root = document.documentElement;
            root.style.setProperty('--color-primary', palette.primary);
            root.style.setProperty('--color-secondary', palette.secondary);
            root.style.setProperty('--color-tertiary', palette.tertiary);
        } else {
            const { data: presetData } = await window.supabaseClient.from('configuracion').select('*').eq('id', 'current_theme').single();
            if (presetData && presetData.theme) {
                const localTheme = localStorage.getItem('portfolio_theme');
                if (localTheme !== presetData.theme) {
                    changeTheme(presetData.theme);
                }
            }
        }
    } catch (e) {
    }

    try {
        window.supabaseClient
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'configuracion' },
                () => {
                    loadProfile();
                }
            )
            .subscribe();
    } catch (err) {
    }
})();

window.habilitarEdicion = (id) => {
    const viewState = document.getElementById(`view-state-${id}`);
    const editState = document.getElementById(`edit-state-${id}`);
    const btnEdit = document.getElementById(`btn-edit-${id}`);
    const btnSave = document.getElementById(`btn-save-${id}`);
    const btnCancel = document.getElementById(`btn-cancel-${id}`);

    if (viewState) {
        viewState.classList.add('hidden');
        viewState.classList.remove('block');
    }
    if (editState) {
        editState.classList.remove('hidden');
        editState.classList.add('flex');
    }
    if (btnEdit) btnEdit.classList.add('hidden');
    if (btnSave) btnSave.classList.remove('hidden');
    if (btnCancel) btnCancel.classList.remove('hidden');
};

window.cancelarEdicion = (id) => {
    const revert = (inputId, rawId) => {
        const input = document.getElementById(inputId);
        const raw = document.getElementById(rawId);
        if (input && raw) input.value = raw.innerText;
    };

    revert(`input-cargo-${id}`, `raw-cargo-${id}`);
    revert(`input-empresa-${id}`, `raw-empresa-${id}`);
    revert(`input-tech-${id}`, `raw-tech-${id}`);
    revert(`input-titulo-${id}`, `raw-titulo-${id}`);
    revert(`input-institucion-${id}`, `raw-institucion-${id}`);
    revert(`input-title-${id}`, `raw-title-${id}`);

    const viewState = document.getElementById(`view-state-${id}`);
    const editState = document.getElementById(`edit-state-${id}`);
    const btnEdit = document.getElementById(`btn-edit-${id}`);
    const btnSave = document.getElementById(`btn-save-${id}`);
    const btnCancel = document.getElementById(`btn-cancel-${id}`);

    if (editState) {
        editState.classList.add('hidden');
        editState.classList.remove('flex');
    }
    if (viewState) {
        viewState.classList.remove('hidden');
        viewState.classList.add('block');
    }
    if (btnSave) btnSave.classList.add('hidden');
    if (btnCancel) btnCancel.classList.add('hidden');
    if (btnEdit) btnEdit.classList.remove('hidden');
};

window.guardarCambios = async (tabla, id) => {
    const btnSave = document.getElementById(`btn-save-${id}`);
    if (btnSave) {
        btnSave.innerText = 'Guardando...';
        btnSave.disabled = true;
    }

    try {
        let datosActualizados = {};

        if (tabla === 'experiencia') {
            datosActualizados = {
                cargo: document.getElementById(`input-cargo-${id}`)?.value,
                empresa: document.getElementById(`input-empresa-${id}`)?.value,
                fecha: document.getElementById(`input-fecha-${id}`)?.value,
                tecnologias: document.getElementById(`input-tech-${id}`)?.value
            };
        } else if (tabla === 'educacion') {
            datosActualizados = {
                siglas: document.getElementById(`input-siglas-${id}`)?.value,
                titulo: document.getElementById(`input-titulo-${id}`)?.value,
                institucion: document.getElementById(`input-institucion-${id}`)?.value,
                color_badge: document.getElementById(`input-color-${id}`)?.value
            };
        } else if (tabla === 'proyectos') {
            datosActualizados = {
                title: document.getElementById(`input-title-${id}`)?.value,
                category: document.getElementById(`input-category-${id}`)?.value,
                demo_url: document.getElementById(`input-demo-${id}`)?.value,
                github_url: document.getElementById(`input-github-${id}`)?.value,
                tech_stack: document.getElementById(`input-tech-${id}`)?.value
            };
        }

        const { error } = await window.supabaseClient
            .from(tabla)
            .update(datosActualizados)
            .eq('id', id);

        if (error) throw error;

        showToast('Cambios guardados correctamente', 'success');

        setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
        console.error(`Error actualizando ${tabla}:`, error);
        showToast('Hubo un error al guardar los cambios.', 'error');
        if (btnSave) {
            btnSave.innerText = 'Guardar';
            btnSave.disabled = false;
        }
    }
};
