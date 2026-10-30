import { supabase } from '../supabaseClient';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
const API_URL = rawApiUrl.replace(/\/+$/, '');

// Obtener Perfil
export const getProfile = async () => {
    const res = await fetch(`${API_URL}/profile`);
    if (!res.ok) throw new Error('Error al cargar perfil');
    const json = await res.json();
    return json.data;
};

// Obtener Proyectos
export const getProjects = async () => {
    const res = await fetch(`${API_URL}/projects`);
    if (!res.ok) throw new Error('Error al cargar proyectos');
    const json = await res.json();
    return json.data;
};

// Obtener Experiencia
export const getExperience = async () => {
    const res = await fetch(`${API_URL}/experience`);
    if (!res.ok) throw new Error('Error al cargar experiencia');
    const json = await res.json();
    return json.data;
};

// Obtener Educación
export const getEducation = async () => {
    const res = await fetch(`${API_URL}/education`);
    if (!res.ok) throw new Error('Error al cargar educación');
    const json = await res.json();
    return json.data;
};

// Enviar Mensaje de Contacto
export const sendContactMessage = async ({ name, email, message }) => {
    try {
        const res = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });
        const data = await res.json();
        if (res.ok) return data;
        throw new Error(data.message || 'Error del backend');
    } catch (err) {
        console.warn('Backend de contacto no disponible. Usando canal directo de Supabase y Formspree...', err.message);

        // 1. Guardar en Supabase directamente
        try {
            await supabase.from('mensajes_contacto').insert([
                {
                    nombre: name.trim(),
                    email: email.trim(),
                    mensaje: message.trim(),
                    created_at: new Date().toISOString()
                }
            ]);
        } catch (dbErr) {
            console.warn('No se pudo guardar mensaje en Supabase:', dbErr);
        }

        // 2. Enviar email por Formspree directamente a Daniela
        const formspreeRes = await fetch('https://formspree.io/f/xgojrjpb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                _subject: `✨ Nuevo mensaje de ${name} en tu Portfolio`,
                name,
                email,
                message
            })
        });
        if (!formspreeRes.ok) {
            throw new Error('No se pudo enviar el mensaje. Por favor intenta nuevamente.', { cause: err });
        }
        return { success: true, message: '¡Mensaje enviado con éxito!' };
    }
};

// Notificación directa de Solicitud de CV a Daniela (Vía Formspree)
export const notifyOwnerCvRequest = async ({ name, email, company }) => {
    try {
        await fetch('https://formspree.io/f/xgojrjpb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                _subject: `📄 ¡Alguien solicitó tu CV! (${name})`,
                nombre: name,
                email: email,
                empresa: company || 'No especificada',
                tipo: 'Solicitud de CV en Portfolio',
                fecha: new Date().toLocaleString('es-AR')
            })
        });
    } catch (err) {
        console.warn('Aviso de CV vía Formspree omitido:', err);
    }
};

// Fallback en caso de que el backend local no se haya iniciado o esté offline
const fallbackCvAccess = async ({ name, email, company }) => {
    try {
        const { data, error } = await supabase
            .from('perfil')
            .select('cv_url')
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        if (!data?.cv_url) throw new Error('El currículum aún no ha sido cargado. Puedes subir el archivo PDF desde el Panel de Administración (#admin > Perfil).');

        // 1. Registrar la solicitud en Supabase (tabla 'solicitudes_cv')
        try {
            const { error: insertErr } = await supabase.from('solicitudes_cv').insert([
                {
                    nombre: name.trim(),
                    email: email.trim(),
                    empresa: company ? company.trim() : '',
                    created_at: new Date().toISOString()
                }
            ]);
            if (insertErr) {
                console.warn('Nota Supabase solicitudes_cv:', insertErr.message);
            }
        } catch (dbErr) {
            console.warn('Error en supabase insert solicitudes_cv:', dbErr);
        }

        // 2. Enviar aviso por correo a Daniela
        await notifyOwnerCvRequest({ name, email, company });

        return {
            success: true,
            cvUrl: data.cv_url,
            message: 'Acceso verificado.'
        };
    } catch (err) {
        throw new Error(err.message || 'No se pudo obtener el currículum.', { cause: err });
    }
};

// Solicitar Acceso al CV con Filtro Seguro
export const requestCvAccess = async ({ name, email, company, honeypot }) => {
    if (honeypot) {
        return { success: true, cvUrl: '', message: 'Acceso verificado.' };
    }

    try {
        const res = await fetch(`${API_URL}/cv/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, company, honeypot })
        });
        const data = await res.json();
        if (res.ok && data?.cvUrl) {
            // Enviar aviso también para asegurar recepción inmediata en bandeja
            notifyOwnerCvRequest({ name, email, company });
            return data;
        }
        if (res.status === 404) {
            console.warn('El backend local devolvió 404. Usando canal directo de Supabase...');
            return await fallbackCvAccess({ name, email, company });
        }
        throw new Error(data.message || 'Error al procesar la solicitud del currículum');
    } catch (err) {
        if (err.message && (err.message.includes('404') || err.message.includes('no encontrada') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('conectar con el servidor'))) {
            return await fallbackCvAccess({ name, email, company });
        }
        throw err;
    }
};

// Registrar Visita
export const recordVisit = async () => {
    try {
        await fetch(`${API_URL}/visits`, { method: 'POST' });
    } catch (error) {
        console.warn('No se pudo registrar la visita:', error.message);
    }
};

// Obtener Total de Visitas
export const getVisitStats = async () => {
    try {
        const res = await fetch(`${API_URL}/visits/stats`);
        if (!res.ok) throw new Error('Error al cargar visitas');
        const json = await res.json();
        return json.totalVisits ?? 0;
    } catch (error) {
        console.warn('No se pudo obtener estadísticas de visitas:', error.message);
        return null;
    }
};

// Helper genérico para peticiones protegidas
const authFetch = async (endpoint, options = {}, token) => {
    let res;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    try {
        res = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });
    } catch (netErr) {
        throw new Error(`No se pudo conectar con el backend (${API_URL}). Asegúrate de que esté iniciado.`, { cause: netErr });
    }

    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch {
        const stripped = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (res.status === 404) {
            throw new Error(`Ruta ${path} no encontrada (HTTP 404). Verifica que el backend en Render esté actualizado con el último despliegue.`);
        }
        throw new Error(`El servidor devolvió un error (HTTP ${res.status}): ${stripped.slice(0, 100)}`);
    }

    if (!res.ok) throw new Error(json.message || `Error del servidor (${res.status})`);
    return json.data;
};

// Proyectos
export const createProject = (data, token) => authFetch('/projects', { method: 'POST', body: JSON.stringify(data) }, token);
export const updateProject = (id, data, token) => authFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);
export const deleteProject = (id, token) => authFetch(`/projects/${id}`, { method: 'DELETE' }, token);

// Experiencia
export const createExperience = (data, token) => authFetch('/experience', { method: 'POST', body: JSON.stringify(data) }, token);
export const updateExperience = (id, data, token) => authFetch(`/experience/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);
export const deleteExperience = (id, token) => authFetch(`/experience/${id}`, { method: 'DELETE' }, token);

// Educación
export const createEducation = (data, token) => authFetch('/education', { method: 'POST', body: JSON.stringify(data) }, token);
export const updateEducation = (id, data, token) => authFetch(`/education/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);
export const deleteEducation = (id, token) => authFetch(`/education/${id}`, { method: 'DELETE' }, token);

// Mensajes de contacto
export const getMessages = async (token) => {
    try {
        return await authFetch('/contact', { method: 'GET' }, token);
    } catch {
        const { data, error } = await supabase
            .from('mensajes_contacto')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }
};

export const deleteMessage = async (id, token) => {
    try {
        return await authFetch(`/contact/${id}`, { method: 'DELETE' }, token);
    } catch {
        const { error } = await supabase.from('mensajes_contacto').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    }
};

// Solicitudes de CV (Admin)
export const getCvRequests = async (token) => {
    try {
        return await authFetch('/cv/requests', { method: 'GET' }, token);
    } catch {
        const { data, error } = await supabase
            .from('solicitudes_cv')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }
};

export const deleteCvRequest = async (id, token) => {
    try {
        return await authFetch(`/cv/requests/${id}`, { method: 'DELETE' }, token);
    } catch {
        const { error } = await supabase.from('solicitudes_cv').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    }
};

// Perfil (Admin vía Backend con Service Role)
export const updateProfile = (data, token) => authFetch('/profile', { method: 'PUT', body: JSON.stringify(data) }, token);

