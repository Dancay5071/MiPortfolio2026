function changeTheme(themeName) {
    const palettes = {
        default: { dark: '#171717', light: '#fafafa', accent: '#2563eb', muted: '#737373' },
        dark: { dark: '#fafafa', light: '#171717', accent: '#3b82f6', muted: '#a3a3a3' },
        emerald: { dark: '#064e3b', light: '#f0fdf4', accent: '#10b981', muted: '#6ee7b7' }
    };

    if (!palettes[themeName]) return;

    const palette = palettes[themeName];
    const root = document.documentElement;

    root.style.setProperty('--color-dark', palette.dark);
    root.style.setProperty('--color-light', palette.light);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-muted', palette.muted);
    root.setAttribute('data-theme', themeName);

    try {
        localStorage.setItem('portfolio_theme', themeName);
    } catch (e) {
        console.error('No se pudo guardar el tema en localStorage', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const themeButtons = document.querySelectorAll('[data-theme-btn]');
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.currentTarget.getAttribute('data-theme-btn');
            changeTheme(theme);
        });
    });
});
