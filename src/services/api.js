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
