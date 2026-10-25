const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (netErr) {
    throw new Error(`No se pudo conectar con el backend (${API_URL}). Asegúrate de que esté iniciado.`);
  }

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`El servidor devolvió un error (HTTP ${res.status}): ${text.slice(0, 100)}`);
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

