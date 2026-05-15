/**
 * Función para cambiar la paleta de colores del portafolio.
 * Aplica los colores mediante variables CSS y guarda la selección en localStorage.
 * 
 * @param {string} themeName - El nombre de la paleta a aplicar (ej. 'default', 'dark', 'emerald').
 */
function changeTheme(themeName) {
    const palettes = {
        default: { dark: '#171717', light: '#fafafa', accent: '#2563eb', muted: '#737373' },
        dark: { dark: '#fafafa', light: '#171717', accent: '#3b82f6', muted: '#a3a3a3' },
        emerald: { dark: '#064e3b', light: '#f0fdf4', accent: '#10b981', muted: '#6ee7b7' }
    };

    if (!palettes[themeName]) return;

    const palette = palettes[themeName];
    const root = document.documentElement;

    // Aplicar las variables CSS al documento
    root.style.setProperty('--color-dark', palette.dark);
    root.style.setProperty('--color-light', palette.light);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-muted', palette.muted);
    
    // Atributo útil para estilos específicos por tema (opcional)
    root.setAttribute('data-theme', themeName);

    // Guardar la selección de forma persistente
    try {
        localStorage.setItem('portfolio_theme', themeName);
    } catch (e) {
        console.error('No se pudo guardar el tema en localStorage', e);
    }
}

// Inicializar event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Buscar todos los botones que tengan el atributo data-theme-btn
    const themeButtons = document.querySelectorAll('[data-theme-btn]');
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.currentTarget.getAttribute('data-theme-btn');
            changeTheme(theme);
        });
    });
});
