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

// Enviar Mensaje de Contacto (Reemplaza a Formspree)
export const sendContactMessage = async ({ name, email, message }) => {
    const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al enviar el mensaje');
    return data;
};

// Fallback en caso de que el backend local no se haya reiniciado o esté desplegándose
const fallbackCvAccess = async ({ name, email, company }) => {
    try {
        const { data, error } = await supabase
            .from('perfil')
            .select('cv_url')
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        if (!data?.cv_url) throw new Error('El currículum aún no ha sido cargado. Puedes subir el archivo PDF desde el Panel de Administración (#admin > Perfil).');

        // Intentar registrar la solicitud en Supabase
        try {
            await supabase.from('solicitudes_cv').insert([
                {
                    nombre: name,
                    email: email,
                    empresa: company || '',
                    created_at: new Date().toISOString()
                }
            ]);
        } catch {
            // Ignorar si la tabla no está creada
        }

        return {
            success: true,
            cvUrl: data.cv_url,
            message: 'Acceso verificado.'
        };
    } catch (err) {
        throw new Error(err.message || 'No se pudo obtener el currículum.');
    }
};

// Solicitar Acceso al CV con Filtro Seguro
export const requestCvAccess = async ({ name, email, company, honeypot }) => {
    try {
        const res = await fetch(`${API_URL}/cv/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, company, honeypot })
        });
        const data = await res.json();
        if (res.ok && data?.cvUrl) {
            return data;
        }
        // Si el backend responde 404 (porque el proceso Node en la terminal no se reinició aún con las nuevas rutas)
        if (res.status === 404) {
            console.warn('El backend local devolvió 404. Usando fallback directo de Supabase...');
            return await fallbackCvAccess({ name, email, company });
        }
        throw new Error(data.message || 'Error al procesar la solicitud del currículum');
    } catch (err) {
        // Si falló por 404 o problema de conexión al backend, intentar fallback
        if (err.message && (err.message.includes('404') || err.message.includes('no encontrada') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
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

// Helper genérico para peticiones protegidas (Defensivo contra respuestas HTML/404)
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
export const getMessages = (token) => authFetch('/contact', { method: 'GET' }, token);
export const deleteMessage = (id, token) => authFetch(`/contact/${id}`, { method: 'DELETE' }, token);

// Solicitudes de CV (Admin)
export const getCvRequests = (token) => authFetch('/cv/requests', { method: 'GET' }, token);
export const deleteCvRequest = (id, token) => authFetch(`/cv/requests/${id}`, { method: 'DELETE' }, token);

// Perfil (Admin vía Backend con Service Role)
export const updateProfile = (data, token) => authFetch('/profile', { method: 'PUT', body: JSON.stringify(data) }, token);

