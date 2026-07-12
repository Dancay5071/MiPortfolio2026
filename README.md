# Portfolio Web

> Interfaz de portfolio personal con navegación fluida, micro-interacciones inmersivas y un panel de administración autogestionable.


## Tabla de contenidos

- [Descripción](#-descripción)
- [Tech Stack](#-tech-stack)
- [Características principales](#-características-principales)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Contacto](#-contacto)


## Descripción

Portfolio web personal de **Daniela Cabrera** con micro-interacciones fluidas y tipografías contrastantes (Mono/Serif) para crear una experiencia inmersiva y  elegante. Cuenta con una arquitectura robusta que incluye un panel de control integrado que permite **gestionar todo el contenido en tiempo real**, sin necesidad de tocar una sola línea de código, protegido por autenticación real.

## Tech Stack

### Frontend & UI
- **React 19** - Componentes funcionales, Hooks y gestión de estado.
- **Vite 8** - Bundler y servidor de desarrollo ultrarrápido.
- **Tailwind CSS 4** - Sistema de diseño utilitario (implementación intensiva de `backdrop-blur`, transparencias y sombras resplandecientes).
- **Framer Motion** - Animaciones declarativas de alto rendimiento (físicas de resorte/spring, layout animations, swipe drag, dibujo de SVGs).

### Backend & servicios
- **Supabase** - Base de datos PostgreSQL, autenticación segura y suscripciones en tiempo real .
- **Supabase Storage** - Almacenamiento optimizado de imágenes de perfil y portadas de proyectos.
- **Formspree** - Recepción de correos desde el Portal de Contacto vía Fetch API asíncrono.


## Características principales

### Experiencia de Usuario (UI/UX)
- **Diseño Glassmorphism:** Paneles de cristal oscuro con fondos ultra translúcidos, bordes sutiles y resplandores en "Oro Alquímico".
- **Scroll Inclinado (Tilted Scroll):** Galería de proyectos tridimensional que reacciona a la posición del scroll.
- **Navegación Móvil por Swipe:** Interfaz táctil tipo app nativa que permite deslizar entre vistas de manera fluida, acompañada de un "Onboarding Invisible" que guía al usuario.
- **Contacto:** Un modal asíncrono con feedback visual místico, incluyendo una animación de renderizado SVG majestuosa al enviar el mensaje con éxito.
- **Cursor:** Cursor personalizado que emite un sutil resplandor, mejorando la inmersión en dispositivos de escritorio.

### El Panel de administración
- **Acceso protegido:** Login seguro manejado nativamente por Supabase Auth.
- **CRUD Completo y en tiempo real:** Gestión absoluta del Perfil, Experiencia, Educación y Proyectos. Los cambios impactan el portfolio en tiempo real gracias a WebSockets (Supabase Realtime).
- **Modo Invitado:** Un *Demo Guard* invisible permite a invitados explorar el 100% de la interfaz de administración sin permisos de escritura reales en la base de datos.
- **Diseño Cohesivo:** El panel de administración no descuida el diseño; los formularios y botones mantienen la estética de cristal oscuro e interacciones fluidas del sitio principal.


## Estructura del proyecto

```text
mi-portfolio/
├── public/                  # Activos estáticos, Favicon y Meta imágenes
├── src/
│   ├── components/
│   │   ├── AdminPanel.jsx   # Auth y CRUD completo
│   │   ├── ContactModal.jsx # Portal de comunicación asíncrono (Formspree)
│   │   ├── Hero.jsx         # Componente principal de presentación
│   │   ├── Navbar.jsx       # Navegación y enlaces sociales
│   │   ├── ProjectList.jsx  # Galería con filtros y Tilted Scroll
│   │   ├── ExperienciaList.jsx
│   │   ├── EducacionList.jsx
│   │   └── ui/              # Componentes interactivos
│   ├── hooks/
│   │   └── useDemoGuard.js  # Interceptor de escritura para modo demo
│   ├── managers/            # Controladores de lógica de negocio separados
│   ├── index.css            # Clases utilitarias y variables globales
│   ├── supabaseClient.js    # Inicialización del cliente Supabase
│   └── App.jsx              # Componente raíz, orquestador de Swipe y Router
├── .env.example
├── tailwind.config.js
└── vite.config.js
```

## Contacto

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Daniela_Cabrera-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/daniela-cabrera5071/)