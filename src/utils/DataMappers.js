export const mapExperiencia = (data) => {
    return {
        id: data.id,
        empresa: data.empresa || 'Empresa Desconocida',
        cargo: data.cargo || 'Cargo Desconocido',
        fecha_inicio: data.fecha_inicio || data.fecha || 'Fecha No Especificada',
        descripcion: data.descripcion || 'Sin descripción detallada.',
        tecnologias: data.tecnologias ? data.tecnologias.split(',').map(t => t.trim()).filter(Boolean) : [],
        raw_tech: data.tecnologias || ''
    };
};

export const mapEducacion = (data) => {
    return {
        id: data.id,
        institucion: data.institucion || 'Institución Desconocida',
        titulo: data.titulo || 'Título Desconocido',
        fecha: data.fecha || 'Sin fecha',
        siglas: data.siglas || data.titulo?.substring(0, 2).toUpperCase() || 'ED',
        color_badge: data.color_badge || 'cyan'
    };
};

export const mapProyecto = (data) => {
    return {
        id: data.id,
        title: data.title || 'Proyecto Sin Nombre',
        category: data.category || 'other',
        description: data.description || 'Sin descripción',
        tech_stack: data.tech_stack ? data.tech_stack.split(',').map(t => t.trim()).filter(Boolean) : [],
        raw_tech: data.tech_stack || '',
        demo_url: data.demo_url || '',
        github_url: data.github_url || '',
        image_url: data.image_url || ''
    };
};
