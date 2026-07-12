import React from 'react';
import MagneticButton from './MagneticButton';

const LINKS = [
  {
    name:  'GitHub',
    url:   'https://github.com/Dancay5071',
    label: 'Ver perfil de GitHub',
    hoverBorder: 'hover:border-indigo-400/40',
    hoverShadow: 'hover:shadow-[0_0_15px_rgba(165,180,252,0.20)]',
    hoverColor:  'hover:text-indigo-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
  {
    name:  'LinkedIn',
    url:   'https://www.linkedin.com/in/daniela-cabrera5071/',
    label: 'Ver perfil de LinkedIn',
    hoverBorder: 'hover:border-indigo-400/40',
    hoverShadow: 'hover:shadow-[0_0_15px_rgba(165,180,252,0.20)]',
    hoverColor:  'hover:text-indigo-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    name:  'Email',
    url:   'mailto:daniela.cabrera@gmail.com',
    label: 'Enviar email',
    hoverBorder: 'hover:border-fuchsia-400/35',
    hoverShadow: 'hover:shadow-[0_0_15px_rgba(217,70,239,0.18)]',
    hoverColor:  'hover:text-fuchsia-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

const SIZE_MAP = {
  sm: { wrap: 'w-8  h-8',  icon: 'w-4   h-4'   },
  md: { wrap: 'w-10 h-10', icon: 'w-5   h-5'   },
  lg: { wrap: 'w-12 h-12', icon: 'w-6   h-6'   },
};

export default function SocialLinks({ className = '', size = 'md', onContactClick }) {
  const { wrap, icon } = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      role="list"
      aria-label="Redes sociales"
    >
      {LINKS.map(link => (
        <MagneticButton key={link.name} strength={0.3}>
          <a
            href={link.name === 'Email' ? '#' : link.url}
            onClick={(e) => {
              if (link.name === 'Email') {
                e.preventDefault();
                if (onContactClick) onContactClick();
              }
            }}
            target={link.name === 'Email' ? undefined : "_blank"}
            rel={link.name === 'Email' ? undefined : "noopener noreferrer"}
            aria-label={link.label}
            role="listitem"
            className={[
              wrap,
              'flex items-center justify-center',
              'rounded-full',
              'bg-white/5 backdrop-blur-md',
              'border border-white/10',
              'text-indigo-200/50',
              'transition-all duration-300',
              'hover:scale-110',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0914]',
              link.hoverBorder,
              link.hoverShadow,
              link.hoverColor,
            ].join(' ')}
          >
            <span className={`${icon} flex items-center justify-center`}>
              {link.icon}
            </span>
          </a>
        </MagneticButton>
      ))}
    </div>
  );
}