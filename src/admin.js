import { showToast } from './utils/Toast.js';
import { ExperienciaManager } from './managers/ExperienciaManager.js';
import { EducacionManager } from './managers/EducacionManager.js';
import { ProyectoManager } from './managers/ProyectoManager.js';

(async () => {

    // Lógica de Pestañas
    const navs = ['profile', 'experience', 'education', 'projects'];
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

    // Verificación de Token
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) {
        window.location.replace('login.html');
        return;
    }

    // Instanciar managers ADMIN
    const expManager = new ExperienciaManager('experience-list', true);
    const eduManager = new EducacionManager('education-list', true);
    const projManager = new ProyectoManager('projects-list', true);


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

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);


    // GESTOR CRUD DE PERFIL 
    const profileForm = document.getElementById('profile-form');
    const fProfileName = document.getElementById('profile-name');
    const fProfileTitle = document.getElementById('profile-title');
    const fProfileBtn = document.getElementById('profile-btn-text');
    const fProfileImageFile = document.getElementById('profile-image-file');
    const fProfileImageUrl = document.getElementById('profile-image-url');
    const fProfileImagePreview = document.getElementById('profile-image-preview');

    const fetchProfile = async () => {
        try {
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
        } catch (err) {
        }
    };

    if (fProfileImageFile) {
        fProfileImageFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (fProfileImagePreview) fProfileImagePreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    window.uploadImage = async (file) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `profile_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
                .from('imagenes-portfolio')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = window.supabaseClient.storage.from('imagenes-portfolio').getPublicUrl(fileName);
            const publicUrl = data.publicUrl;

            await window.supabaseClient.from('configuracion').upsert({ id: 'url_foto', theme: publicUrl });

            return publicUrl;
        } catch (error) {
            showToast("Hubo un problema al subir la imagen.", 'error');
            throw error;
        }
    };

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-save-profile');
            setBtnLoading(btn);

            let finalImageUrl = fProfileImageUrl ? fProfileImageUrl.value : '';
            const file = fProfileImageFile ? fProfileImageFile.files[0] : null;

            if (file) {
                try {
                    finalImageUrl = await window.uploadImage(file);
                    if (fProfileImageUrl) fProfileImageUrl.value = finalImageUrl;
                    if (fProfileImagePreview) fProfileImagePreview.src = finalImageUrl;
                } catch (error) {
                    setBtnReady(btn);
                    return;
                }
            }

            const profileData = {
                name: fProfileName.value,
                title: fProfileTitle.value,
                btnText: fProfileBtn.value,
                image: finalImageUrl
            };

            try {
                await window.supabaseClient.from('configuracion').upsert({ id: 'perfil_data', theme: JSON.stringify(profileData) });
                showToast('Perfil guardado exitosamente.', 'success');
            } catch (error) {
                showToast('Error guardando perfil.', 'error');
            }
            setBtnReady(btn);
        });
    }

    // EXPERIENCIA CRUD
    const expFormContainer = document.getElementById('experience-form-container');
    const expForm = document.getElementById('experience-form');
    const btnAddExp = document.getElementById('btn-add-experience');
    const btnCancelExp = document.getElementById('btn-cancel-experience');

    const fExpId = document.getElementById('exp-id');
    const fExpCompany = document.getElementById('exp-company');
    const fExpRole = document.getElementById('exp-role');
    const fExpDate = document.getElementById('exp-date');
    const fExpTech = document.getElementById('exp-tech');

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

    if (btnAddExp) btnAddExp.addEventListener('click', () => { document.getElementById('form-exp-title').textContent = 'Añadir Experiencia'; toggleExpForm(true); });
    if (btnCancelExp) btnCancelExp.addEventListener('click', () => toggleExpForm(false));

    if (expForm) {
        expForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('btn-save-experience');
            setBtnLoading(submitBtn);

            const data = {
                empresa: fExpCompany.value,
                cargo: fExpRole.value,
                fecha_inicio: fExpDate.value,
                tecnologias: fExpTech.value,
                descripcion: ''
            };

            try {
                if (fExpId.value) {
                    await window.supabaseClient.from('experiencia').update(data).eq('id', fExpId.value);
                } else {
                    await window.supabaseClient.from('experiencia').insert([data]);
                }
                showToast('Experiencia guardada exitosamente', 'success');
                toggleExpForm(false);
                await expManager.fetchAndRender();
            } catch (error) {
                showToast(`Error: ${error.message}`, 'error');
            } finally {
                setBtnReady(submitBtn);
            }
        });
    }

    window.editExperience = (id) => {
        const e = expManager.data.find(x => x.id === id);
        if (e) {
            document.getElementById('form-exp-title').textContent = 'Editar Experiencia';
            fExpId.value = e.id;
            fExpCompany.value = e.empresa;
            fExpRole.value = e.cargo;
            fExpDate.value = e.fecha_inicio;
            fExpTech.value = e.raw_tech;
            toggleExpForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.deleteExperience = async (id) => {
        if (confirm('¿Eliminar esta experiencia?')) {
            try {
                await window.supabaseClient.from('experiencia').delete().eq('id', id);
                showToast('Experiencia eliminada', 'success');
                await expManager.fetchAndRender();
            } catch (error) {
                showToast('Error al eliminar', 'error');
            }
        }
    };

    // EDUCACION CRUD 
    const eduFormContainer = document.getElementById('education-form-container');
    const eduForm = document.getElementById('education-form');
    const btnAddEdu = document.getElementById('btn-add-education');
    const btnCancelEdu = document.getElementById('btn-cancel-education');

    const fEduId = document.getElementById('edu-id');
    const fEduInst = document.getElementById('edu-institution');
    const fEduDegree = document.getElementById('edu-degree');
    const fEduSiglas = document.getElementById('edu-siglas');
    const fEduColor = document.getElementById('edu-color');

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

    if (btnAddEdu) btnAddEdu.addEventListener('click', () => { document.getElementById('form-edu-title').textContent = 'Añadir Educación'; toggleEduForm(true); });
    if (btnCancelEdu) btnCancelEdu.addEventListener('click', () => toggleEduForm(false));

    if (eduForm) {
        eduForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('btn-save-education');
            setBtnLoading(submitBtn);

            const data = {
                institucion: fEduInst.value,
                titulo: fEduDegree.value,
                siglas: fEduSiglas ? fEduSiglas.value : fEduDegree.value.substring(0, 2).toUpperCase(),
                color_badge: fEduColor ? fEduColor.value : 'cyan'
            };

            try {
                if (fEduId.value) {
                    await window.supabaseClient.from('educacion').update(data).eq('id', fEduId.value);
                } else {
                    await window.supabaseClient.from('educacion').insert([data]);
                }
                showToast('Educación guardada exitosamente', 'success');
                toggleEduForm(false);
                await eduManager.fetchAndRender();
            } catch (error) {
                showToast(`Error: ${error.message}`, 'error');
            } finally {
                setBtnReady(submitBtn);
            }
        });
    }

    window.editEducation = (id) => {
        const e = eduManager.data.find(x => x.id === id);
        if (e) {
            document.getElementById('form-edu-title').textContent = 'Editar Educación';
            fEduId.value = e.id;
            fEduInst.value = e.institucion;
            fEduDegree.value = e.titulo;
            if (fEduSiglas) fEduSiglas.value = e.siglas;
            if (fEduColor) fEduColor.value = e.color_badge;
            toggleEduForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.deleteEducation = async (id) => {
        if (confirm('¿Eliminar este título?')) {
            try {
                await window.supabaseClient.from('educacion').delete().eq('id', id);
                showToast('Título eliminado', 'success');
                await eduManager.fetchAndRender();
            } catch (error) {
                showToast('Error al eliminar', 'error');
            }
        }
    };

    // PROYECTOS CRUD
    const projectFormContainer = document.getElementById('project-form-container');
    const projectForm = document.getElementById('project-form');
    const btnAddProject = document.getElementById('btn-add-project');
    const btnCancelProject = document.getElementById('btn-cancel-project');

    const fProjId = document.getElementById('project-id');
    const fProjTitle = document.getElementById('project-title');
    const fProjCategory = document.getElementById('project-category');
    const fProjDesc = document.getElementById('project-desc');
    const fProjGithub = document.getElementById('project-github');
    const fProjDemo = document.getElementById('project-demo');
    const fProjTech = document.getElementById('project-tech');

    const fProjImageFile = document.getElementById('project-image-file');
    const fProjImagePreview = document.getElementById('project-image-preview');
    const fProjImageUrl = document.getElementById('project-image-url');

    const toggleProjForm = (show = false) => {
        if (show) {
            projectFormContainer.classList.remove('hidden');
            btnAddProject.classList.add('hidden');
        } else {
            projectFormContainer.classList.add('hidden');
            btnAddProject.classList.remove('hidden');
            projectForm.reset();
            fProjId.value = '';
            if (fProjImagePreview) fProjImagePreview.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=200&h=200';
            if (fProjImageUrl) fProjImageUrl.value = '';
        }
    };

    if (btnAddProject) btnAddProject.addEventListener('click', () => { document.getElementById('form-title').textContent = 'Añadir Nuevo Proyecto'; toggleProjForm(true); });
    if (btnCancelProject) btnCancelProject.addEventListener('click', () => toggleProjForm(false));

    if (fProjImageFile) {
        fProjImageFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && fProjImagePreview) {
                const reader = new FileReader();
                reader.onload = (ev) => fProjImagePreview.src = ev.target.result;
                reader.readAsDataURL(file);
            }
        });
    }

    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('btn-save-project');
            setBtnLoading(submitBtn);

            let finalImageUrl = fProjImageUrl ? fProjImageUrl.value : '';
            const file = fProjImageFile ? fProjImageFile.files[0] : null;

            if (file) {
                try {
                    finalImageUrl = await window.uploadImage(file);
                } catch (error) {
                    setBtnReady(submitBtn);
                    return;
                }
            }

            const data = {
                title: fProjTitle.value ? fProjTitle.value.trim() : 'Proyecto Sin Nombre',
                category: fProjCategory.value || 'Aplicaciones Web',
                description: fProjDesc.value ? fProjDesc.value.trim() : 'Sin descripción',
                github_url: fProjGithub.value ? fProjGithub.value.trim() : '',
                demo_url: fProjDemo.value ? fProjDemo.value.trim() : '',
                tech_stack: fProjTech.value ? fProjTech.value.trim() : 'JS',
                image_url: finalImageUrl || ''
            };

            try {
                if (fProjId.value) {
                    await window.supabaseClient.from('proyectos').update(data).eq('id', fProjId.value);
                } else {
                    await window.supabaseClient.from('proyectos').insert([data]);
                }
                showToast('Proyecto guardado exitosamente', 'success');
                toggleProjForm(false);
                await projManager.fetchAndRender();
            } catch (error) {
                showToast(`Error al guardar el proyecto: ${error.message}`, 'error');
            } finally {
                setBtnReady(submitBtn);
            }
        });
    }

    window.editProject = (id) => {
        const p = projManager.data.find(x => x.id === id);
        if (p) {
            document.getElementById('form-title').textContent = 'Editar Proyecto';
            fProjId.value = p.id;
            fProjTitle.value = p.title;
            fProjCategory.value = p.category;
            fProjDesc.value = p.description;
            fProjGithub.value = p.github_url;
            fProjDemo.value = p.demo_url;
            fProjTech.value = p.raw_tech;
            if (fProjImageUrl) fProjImageUrl.value = p.image_url;
            if (fProjImagePreview && p.image_url) fProjImagePreview.src = p.image_url;
            toggleProjForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.deleteProject = async (id) => {
        if (confirm('¿Eliminar este proyecto?')) {
            try {
                await window.supabaseClient.from('proyectos').delete().eq('id', id);
                showToast('Proyecto eliminado', 'success');
                await projManager.fetchAndRender();
            } catch (error) {
                showToast('Error al eliminar proyecto', 'error');
            }
        }
    };
    fetchProfile();
    expManager.fetchAndRender();
    eduManager.fetchAndRender();
    projManager.fetchAndRender();
})();
