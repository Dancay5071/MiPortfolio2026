/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./admin.html",
    "./login.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      fontFamily: {
        'serif-display': ['Cinzel', 'Georgia', 'Times New Roman', 'serif'],
        'sans-body':     ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono-hud':      ['"Share Tech Mono"', '"Courier New"', 'monospace'],
      },
      colors: {
        'portfolio-bg':     'var(--color-light)',
        'portfolio-text':   'var(--color-dark)',
        'portfolio-accent': 'var(--color-accent)',
        'mystic': {
          
          'void':       '#0B0914',
          'deep':       '#0E0B1A', 
          'panel':      '#130F22',
          'surface':    '#1A1530',
          'amethyst':   '#A78BFA',
          'moon':       '#C4B5FD',
          'star':       '#E2D9FE',
          'void-light': '#7C3AED',
          'nebula':     '#D8B4FE',
          'aurora':     '#818CF8',
          'border':     'rgba(167,139,250,0.14)',
          'border-glow':'rgba(196,181,253,0.25)',
          'glow':       'rgba(139,92,246,0.20)',
          'glow-soft':  'rgba(165,180,252,0.10)',
          'text-primary':  '#E2D9FE',
          'text-secondary':'#A78BFA',
          'text-muted':    'rgba(196,181,253,0.55)',
        },
      },
      boxShadow: {
        'glow-amethyst': '0 0 20px rgba(139,92,246,0.25), 0 0 60px rgba(109,40,217,0.12)',
        'glow-moon':     '0 0 14px rgba(196,181,253,0.18), 0 0 40px rgba(165,180,252,0.08)',
        'glow-panel':    '0 0 60px rgba(139,92,246,0.07), inset 0 1px 0 rgba(196,181,253,0.10)',
        'card-hover':    '0 12px 40px rgba(0,0,0,0.50), 0 0 20px rgba(165,180,252,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',
        'card-mystic':   '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(196,181,253,0.06)',
      },

    },
  },
  plugins: [],
}