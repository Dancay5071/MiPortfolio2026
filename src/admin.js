document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificación Inmediata de Token (Bloqueante asíncrono)
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) {
        window.location.replace('login.html');
        return;
    }

    // -- Lógica de Autorización Base --
    const body = document.getElementById('admin-body');
    if (body) {
        body.classList.remove('opacity-0');
        body.classList.add('opacity-100');
    }

    const userDisplay = document.getElementById('user-email-display');
    if (userDisplay) {
        userDisplay.textContent = session.user.email;
    }

    const handleLogout = async (e) => {
        e.preventDefault();
        await window.supabaseClient.auth.signOut();
        window.location.replace('login.html');
    };

    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('logout-btn-mobile')?.addEventListener('click', handleLogout);

    // -- Lógica de Pestañas (Tabs) --
    const navs = ['profile', 'experience', 'education', 'projects', 'styles'];
    const switchTab = (tab) => {
        navs.forEach(t => {
            const n = document.getElementById(`nav-${t}`);
            const v = document.getElementById(`view-${t}`);
            if (t === tab) {
                if (n) n.classList.add('active');
                if (v) v.classList.add('active');
            } else {
                if (n) n.classList.remove('active');
                if (v) v.classList.remove('active');
            }
        });
    };
    navs.forEach(t => {
        const n = document.getElementById(`nav-${t}`);
        if (n) n.addEventListener('click', () => switchTab(t));
    });

    // -- CONFIGURADOR DE ESTILOS --
    const root = document.documentElement;
    const colorPrimaryInput = document.getElementById('color-primary');
    const colorSecondaryInput = document.getElementById('color-secondary');
    const colorTertiaryInput = document.getElementById('color-tertiary');
    const btnResetColors = document.getElementById('btn-reset-colors');

    // Convert RGB string "r g b" to Hex for input[type="color"]
    const rgbToHex = (rgbStr) => {
        if (!rgbStr) return '#000000';
        const parts = rgbStr.split(' ').map(Number);
        if (parts.length !== 3) return '#000000';
        return '#' + parts.map(x => x.toString(16).padStart(2, '0')).join('');
    };

    // Convert Hex to RGB string "r g b"
    const hexToRgb = (hex) => {
        let r = 0, g = 0, b = 0;
        if (hex.length == 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `${r} ${g} ${b}`;
    };

    // Initialize inputs
    if (colorPrimaryInput) colorPrimaryInput.value = rgbToHex(getComputedStyle(root).getPropertyValue('--color-primary').trim() || '0 242 254');
    if (colorSecondaryInput) colorSecondaryInput.value = rgbToHex(getComputedStyle(root).getPropertyValue('--color-secondary').trim() || '254 9 121');
    if (colorTertiaryInput) colorTertiaryInput.value = rgbToHex(getComputedStyle(root).getPropertyValue('--color-tertiary').trim() || '138 43 226');

    const saveAndApplyColor = async (variable, hexValue) => {
        const rgbValue = hexToRgb(hexValue);
        root.style.setProperty(variable, rgbValue);

        // Save to local cache for instant load
        const currentSettings = JSON.parse(localStorage.getItem('custom_theme') || '{}');
        if (variable === '--color-primary') currentSettings.primary = rgbValue;
        if (variable === '--color-secondary') currentSettings.secondary = rgbValue;
        if (variable === '--color-tertiary') currentSettings.tertiary = rgbValue;
        localStorage.setItem('custom_theme', JSON.stringify(currentSettings));

        // Save to Supabase
        const { error } = await window.supabaseClient
            .from('configuracion')
            .upsert({ id: 'custom_theme', theme: JSON.stringify(currentSettings) });

        if (error) console.error("Error saving theme to DB:", error);
    };

    colorPrimaryInput?.addEventListener('change', (e) => saveAndApplyColor('--color-primary', e.target.value));
    colorSecondaryInput?.addEventListener('change', (e) => saveAndApplyColor('--color-secondary', e.target.value));
    colorTertiaryInput?.addEventListener('change', (e) => saveAndApplyColor('--color-tertiary', e.target.value));

    btnResetColors?.addEventListener('click', async () => {
        localStorage.removeItem('custom_theme');
        localStorage.removeItem('portfolio_theme');
        await window.supabaseClient.from('configuracion').delete().eq('id', 'custom_theme');
        window.location.reload();
    });

    // -- GESTOR CRUD DE PROYECTOS --
    let projects = [];

    const projectsList = document.getElementById('projects-list');
    const btnAddProject = document.getElementById('btn-add-project');
    const projectFormContainer = document.getElementById('project-form-container');
    const projectForm = document.getElementById('project-form');
    const btnCancelProject = document.getElementById('btn-cancel-project');
    const formTitle = document.getElementById('form-title');

    // Referencias del form
    const fId = document.getElementById('project-id');
    const fTitle = document.getElementById('project-title');
    const fCategory = document.getElementById('project-category');
    const fDesc = document.getElementById('project-desc');
    const fGithub = document.getElementById('project-github');
    const fDemo = document.getElementById('project-demo');
    const fTech = document.getElementById('project-tech');

    const fetchProjects = async () => {
        projectsList.innerHTML = '<div class="p-6 text-center text-muted text-sm">Cargando proyectos...</div>';
        const { data, error } = await window.supabaseClient.from('proyectos').select('*').order('created_at', { ascending: false });
        if (error) {
            projectsList.innerHTML = '<div class="p-6 text-center text-red-500 text-sm">Error al cargar proyectos.</div>';
            return;
        }
        projects = data || [];
        renderProjects();
    };

    const renderProjects = () => {
        projectsList.innerHTML = '';
        if (projects.length === 0) {
            projectsList.innerHTML = '<div class="p-6 text-center text-muted text-sm">No hay proyectos. Añade uno nuevo.</div>';
            return;
        }

        projects.forEach(p => {
            const el = document.createElement('div');
            el.className = 'p-6 flex items-center justify-between hover:bg-gray-50 transition-colors';
            el.innerHTML = `
                <div>
                    <h4 class="font-bold text-dark flex items-center gap-2">
                        ${p.title}
                        <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-600">${p.category}</span>
                    </h4>
                    <p class="text-sm text-muted mt-1 truncate max-w-md">${p.description}</p>
                </div>
                <div class="flex items-center gap-3">
                    <button class="text-sm font-medium text-blue-600 hover:text-blue-800" onclick="window.editProject('${p.id}')">Editar</button>
                    <button class="text-sm font-medium text-red-600 hover:text-red-800" onclick="window.deleteProject('${p.id}')">Eliminar</button>
                </div>
            `;
            projectsList.appendChild(el);
        });
    };

    const toggleForm = (show = false) => {
        if (show) {
            projectFormContainer.classList.remove('hidden');
            btnAddProject.classList.add('hidden');
        } else {
            projectFormContainer.classList.add('hidden');
            btnAddProject.classList.remove('hidden');
            projectForm.reset();
            fId.value = '';
        }
    };

    btnAddProject?.addEventListener('click', () => {
        formTitle.textContent = 'Añadir Nuevo Proyecto';
        toggleForm(true);
    });

    btnCancelProject?.addEventListener('click', () => {
        toggleForm(false);
    });

    projectForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = projectForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        const projectData = {
            title: fTitle.value,
            category: fCategory.value,
            description: fDesc.value,
            github_url: fGithub.value,
            demo_url: fDemo.value,
            tech_stack: fTech.value
        };

        if (fId.value) {
            // Editar
            await window.supabaseClient.from('proyectos').update(projectData).eq('id', fId.value);
        } else {
            // Añadir
            await window.supabaseClient.from('proyectos').insert([projectData]);
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Proyecto';

        toggleForm(false);
        await fetchProjects();
    });

    // Funciones globales para botones en línea
    window.editProject = (id) => {
        const p = projects.find(x => x.id === id);
        if (p) {
            formTitle.textContent = 'Editar Proyecto';
            fId.value = p.id;
            fTitle.value = p.title;
            fCategory.value = p.category;
            fDesc.value = p.description;
            fGithub.value = p.github_url;
            fDemo.value = p.demo_url || '';
            fTech.value = p.tech_stack;
            toggleForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.deleteProject = async (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
            await window.supabaseClient.from('proyectos').delete().eq('id', id);
            await fetchProjects();
        }
    };

    // -- GESTOR DE PERFIL --
    const profileForm = document.getElementById('profile-form');
    const fProfileName = document.getElementById('profile-name');
    const fProfileTitle = document.getElementById('profile-title');
    const fProfileBtn = document.getElementById('profile-btn-text');
    const fProfileImageFile = document.getElementById('profile-image-file');
    const fProfileImageUrl = document.getElementById('profile-image-url');
    const fProfileImagePreview = document.getElementById('profile-image-preview');

    const fetchProfile = async () => {
        const { data } = await window.supabaseClient.from('configuracion').select('*').eq('id', 'perfil_data').single();
        if (data && data.theme) {
            const p = JSON.parse(data.theme);
            if (fProfileName) fProfileName.value = p.name || '';
            if (fProfileTitle) fProfileTitle.value = p.title || '';
            if (fProfileBtn) fProfileBtn.value = p.btnText || '';
            if (p.image) {
                if (fProfileImageUrl) fProfileImageUrl.value = p.image;
                if (fProfileImagePreview) fProfileImagePreview.src = p.image;
            }
        }
    };

    fProfileImageFile?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (fProfileImagePreview) fProfileImagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Función Global de Subida de Imagen solicitada
    window.uploadImage = async (file) => {
        // Generar nombre único con timestamp
        const fileExt = file.name.split('.').pop();
        const fileName = `profile_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

        // Subir al bucket especificado
        const { error: uploadError } = await window.supabaseClient.storage
            .from('imagenes-portfolio')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data } = window.supabaseClient.storage.from('IMAGENES-PORTFOLIO').getPublicUrl(fileName);
        const publicUrl = data.publicUrl;

        // Actualizar en la tabla configuracion (se hace un upsert para asegurar que exista)
        await window.supabaseClient.from('configuracion').upsert({ id: 'url_foto', theme: publicUrl });

        // Actualizar el DOM inmediatamente como se solicitó
        const imgElem = document.getElementById('foto-perfil');
        if (imgElem) {
            const timestamp = new Date().getTime();
            imgElem.src = `${publicUrl}?t=${timestamp}`;
        }

        return publicUrl;
    };

    profileForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-profile');
        if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

        let finalImageUrl = fProfileImageUrl ? fProfileImageUrl.value : '';
        const file = fProfileImageFile ? fProfileImageFile.files[0] : null;

        if (file) {
            if (btn) btn.textContent = 'Subiendo imagen...';
            try {
                finalImageUrl = await window.uploadImage(file);
                if (fProfileImageUrl) fProfileImageUrl.value = finalImageUrl;
            } catch (uploadError) {
                alert('Error al subir la imagen. Asegúrate de tener un Storage Bucket llamado "IMAGENES-PORTFOLIO" configurado como público en Supabase. Error: ' + uploadError.message);
                if (btn) { btn.disabled = false; btn.textContent = 'Guardar Foto y Datos'; }
                return;
            }
        }

        const profileData = {
            name: fProfileName.value,
            title: fProfileTitle.value,
            btnText: fProfileBtn.value,
            image: finalImageUrl
        };

        if (btn) btn.textContent = 'Guardando datos...';
        await window.supabaseClient.from('configuracion').upsert({ id: 'perfil_data', theme: JSON.stringify(profileData) });

        // Actualización directa del DOM como se solicitó
        const domName = document.getElementById('portfolio-name');
        if (domName) domName.innerHTML = profileData.name;
        
        const domTitle = document.getElementById('portfolio-title');
        if (domTitle) domTitle.innerHTML = profileData.title;
        
        const domBtn = document.getElementById('portfolio-btn');
        if (domBtn) domBtn.innerHTML = profileData.btnText;

        if (btn) { btn.disabled = false; btn.textContent = 'Guardar Foto y Datos'; }
        alert('Perfil guardado exitosamente.');
    });

    // -- GESTOR DE EXPERIENCIA --
    let experiences = [];
    const expList = document.getElementById('experience-list');
    const btnAddExp = document.getElementById('btn-add-experience');
    const expFormContainer = document.getElementById('experience-form-container');
    const expForm = document.getElementById('experience-form');
    const btnCancelExp = document.getElementById('btn-cancel-experience');

    const fExpId = document.getElementById('exp-id');
    const fExpCompany = document.getElementById('exp-company');
    const fExpRole = document.getElementById('exp-role');
    const fExpDate = document.getElementById('exp-date');
    const fExpTech = document.getElementById('exp-tech');

    const fetchExperience = async () => {
        if (!expList) return;
        expList.innerHTML = '<div class="p-6 text-center text-muted text-sm">Cargando...</div>';
        const { data, error } = await window.supabaseClient.from('experiencia').select('*').order('created_at', { ascending: false });
        if (error) {
            expList.innerHTML = '<div class="p-6 text-center text-red-500 text-sm">Aún no existe la tabla de experiencia. Por favor ejecuta el SQL en Supabase.</div>';
            return;
        }
        experiences = data || [];
        renderExperience();
    };

    const renderExperience = () => {
        expList.innerHTML = '';
        if (experiences.length === 0) {
            expList.innerHTML = '<div class="p-6 text-center text-muted text-sm">No hay experiencias.</div>';
            return;
        }
        experiences.forEach(e => {
            const el = document.createElement('div');
            el.className = 'p-6 flex items-center justify-between hover:bg-gray-50 transition-colors';
            el.innerHTML = `
                <div>
                    <h4 class="font-bold text-dark">${e.cargo} en ${e.empresa}</h4>
                    <p class="text-sm text-muted mt-1">${e.fecha} | ${e.tecnologias}</p>
                </div>
                <div class="flex items-center gap-3">
                    <button class="text-sm font-medium text-blue-600 hover:text-blue-800" onclick="window.editExperience('${e.id}')">Editar</button>
                    <button class="text-sm font-medium text-red-600 hover:text-red-800" onclick="window.deleteExperience('${e.id}')">Eliminar</button>
                </div>
            `;
            expList.appendChild(el);
        });
    };

    const toggleExpForm = (show = false) => {
        if (show) {
            expFormContainer.classList.remove('hidden');
            btnAddExp.classList.add('hidden');
        } else {
            expFormContainer.classList.add('hidden');
            btnAddExp.classList.remove('hidden');
            expForm.reset();
            fExpId.value = '';
        }
    };

    btnAddExp?.addEventListener('click', () => {
        document.getElementById('form-exp-title').textContent = 'Añadir Experiencia';
        toggleExpForm(true);
    });
    btnCancelExp?.addEventListener('click', () => toggleExpForm(false));

    expForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = expForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true; submitBtn.textContent = 'Guardando...';

        const data = {
            empresa: fExpCompany.value,
            cargo: fExpRole.value,
            fecha: fExpDate.value,
            tecnologias: fExpTech.value
        };

        if (fExpId.value) {
            await window.supabaseClient.from('experiencia').update(data).eq('id', fExpId.value);
        } else {
            await window.supabaseClient.from('experiencia').insert([data]);
        }

        submitBtn.disabled = false; submitBtn.textContent = 'Guardar';
        toggleExpForm(false);
        await fetchExperience();
    });

    window.editExperience = (id) => {
        const e = experiences.find(x => x.id === id);
        if (e) {
            document.getElementById('form-exp-title').textContent = 'Editar Experiencia';
            fExpId.value = e.id;
            fExpCompany.value = e.empresa;
            fExpRole.value = e.cargo;
            fExpDate.value = e.fecha;
            fExpTech.value = e.tecnologias;
            toggleExpForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.deleteExperience = async (id) => {
        if (confirm('¿Eliminar esta experiencia?')) {
            await window.supabaseClient.from('experiencia').delete().eq('id', id);
            await fetchExperience();
        }
    };

    // -- GESTOR DE EDUCACIÓN --
    let educations = [];
    const eduList = document.getElementById('education-list');
    const btnAddEdu = document.getElementById('btn-add-education');
    const eduFormContainer = document.getElementById('education-form-container');
    const eduForm = document.getElementById('education-form');
    const btnCancelEdu = document.getElementById('btn-cancel-education');

    const fEduId = document.getElementById('edu-id');
    const fEduInst = document.getElementById('edu-institution');
    const fEduDegree = document.getElementById('edu-degree');
    const fEduSiglas = document.getElementById('edu-siglas');
    const fEduColor = document.getElementById('edu-color');

    const fetchEducation = async () => {
        if (!eduList) return;
        eduList.innerHTML = '<div class="p-6 text-center text-muted text-sm">Cargando...</div>';
        const { data, error } = await window.supabaseClient.from('educacion').select('*').order('created_at', { ascending: false });
        if (error) {
            eduList.innerHTML = '<div class="p-6 text-center text-red-500 text-sm">Aún no existe la tabla de educacion. Por favor ejecuta el SQL en Supabase.</div>';
            return;
        }
        educations = data || [];
        renderEducation();
    };

    const renderEducation = () => {
        eduList.innerHTML = '';
        if (educations.length === 0) {
            eduList.innerHTML = '<div class="p-6 text-center text-muted text-sm">No hay títulos de educación.</div>';
            return;
        }
        educations.forEach(e => {
            const el = document.createElement('div');
            el.className = 'p-6 flex items-center justify-between hover:bg-gray-50 transition-colors';
            el.innerHTML = `
                <div>
                    <h4 class="font-bold text-dark">${e.titulo}</h4>
                    <p class="text-sm text-muted mt-1">${e.institucion} | Color: ${e.color_badge}</p>
                </div>
                <div class="flex items-center gap-3">
                    <button class="text-sm font-medium text-blue-600 hover:text-blue-800" onclick="window.editEducation('${e.id}')">Editar</button>
                    <button class="text-sm font-medium text-red-600 hover:text-red-800" onclick="window.deleteEducation('${e.id}')">Eliminar</button>
                </div>
            `;
            eduList.appendChild(el);
        });
    };

    const toggleEduForm = (show = false) => {
        if (show) {
            eduFormContainer.classList.remove('hidden');
            btnAddEdu.classList.add('hidden');
        } else {
            eduFormContainer.classList.add('hidden');
            btnAddEdu.classList.remove('hidden');
            eduForm.reset();
            fEduId.value = '';
        }
    };

    btnAddEdu?.addEventListener('click', () => {
        document.getElementById('form-edu-title').textContent = 'Añadir Educación';
        toggleEduForm(true);
    });
    btnCancelEdu?.addEventListener('click', () => toggleEduForm(false));

    eduForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = eduForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true; submitBtn.textContent = 'Guardando...';

        const data = {
            institucion: fEduInst.value,
            titulo: fEduDegree.value,
            siglas: fEduSiglas.value,
            color_badge: fEduColor.value
        };

        if (fEduId.value) {
            await window.supabaseClient.from('educacion').update(data).eq('id', fEduId.value);
        } else {
            await window.supabaseClient.from('educacion').insert([data]);
        }

        submitBtn.disabled = false; submitBtn.textContent = 'Guardar';
        toggleEduForm(false);
        await fetchEducation();
    });

    window.editEducation = (id) => {
        const e = educations.find(x => x.id === id);
        if (e) {
            document.getElementById('form-edu-title').textContent = 'Editar Educación';
            fEduId.value = e.id;
            fEduInst.value = e.institucion;
            fEduDegree.value = e.titulo;
            fEduSiglas.value = e.siglas;
            fEduColor.value = e.color_badge;
            toggleEduForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.deleteEducation = async (id) => {
        if (confirm('¿Eliminar este título?')) {
            await window.supabaseClient.from('educacion').delete().eq('id', id);
            await fetchEducation();
        }
    };

    // Render Inicial General
    fetchProfile();
    fetchExperience();
    fetchEducation();
    fetchProjects();
});
