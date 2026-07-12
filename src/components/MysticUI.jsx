import { useId } from 'react';

export function MysticInput({
  type         = 'text',
  value,
  onChange,
  placeholder  = '',
  label,
  hint,
  icon,
  required     = false,
  disabled     = false,
  className    = '',
  inputClassName = '',
  id: propId,
  error,
  as           = 'input',
  rows         = 3,
  ...rest
}) {
  const autoId  = useId();
  const fieldId = propId ?? autoId;
  const Tag     = as;

  //Clases dinámicas según estado 
  const borderClass = error
    ? 'border-rose-500/40 focus:border-rose-400/60 focus:ring-rose-500/20'
    : 'border-white/8 focus:border-violet-400/30 focus:ring-indigo-500/20';

  const baseInput = [
    
    'w-full rounded-xl',
    icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
    'bg-white/4 backdrop-blur-sm',
    `border ${borderClass}`,
    'text-sm text-mystic-star font-sans-body',
    'placeholder:text-indigo-300/35 placeholder:font-light',
    'outline-none',
    'focus:ring-2',
    'focus:bg-white/6',
    'transition-all duration-400 ease-out',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    as === 'textarea' ? 'resize-y min-h-[80px]' : '',
    inputClassName,
  ].filter(Boolean).join(' ');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>

      {label && (
        <label
          htmlFor={fieldId}
          className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.18em] uppercase text-indigo-300/60 font-mono-hud"
        >
          <span className="text-violet-400/40 text-[8px]">◊</span>
          {label}
        </label>
      )}

      <div className="relative">

        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/40 pointer-events-none flex items-center"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        <Tag
          id={fieldId}
          type={as === 'input' ? type : undefined}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={as === 'textarea' ? rows : undefined}
          className={baseInput}
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${fieldId}-desc` : undefined}
          {...rest}
        />

        <div
          className="absolute top-0 left-4 right-4 h-px pointer-events-none rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(196,181,253,0.12) 30%, rgba(226,217,254,0.18) 50%, rgba(196,181,253,0.12) 70%, transparent)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Error*/}
      {(hint || error) && (
        <p
          id={`${fieldId}-desc`}
          className={`text-[10px] font-mono-hud tracking-wide pl-1 ${
            error ? 'text-rose-400/70' : 'text-indigo-300/40'
          }`}
        >
          {error ?? hint}
        </p>
      )}

    </div>
  );
}

export function MysticButton({
  children,
  variant      = 'ghost',
  size         = 'md',
  type         = 'button',
  disabled     = false,
  isLoading    = false,
  loadingText  = 'Procesando',
  onClick,
  className    = '',
  icon,
  iconRight,
  fullWidth    = false,
  as           = 'button',
  href,
  ...rest
}) {
 
  const sizes = {
    sm: 'px-4 py-1.5 text-[10px] tracking-[0.22em]',
    md: 'px-6 py-2.5 text-xs   tracking-[0.20em]',
    lg: 'px-8 py-3   text-xs   tracking-[0.22em]',
  };

  
  const variants = {
  
    ghost: [
      'border border-indigo-400/28',
      'text-indigo-200/80',
      'bg-transparent',
      'hover:bg-indigo-900/20',
      'hover:border-indigo-300/45',
      'hover:text-indigo-100',
      'hover:shadow-[0_0_18px_rgba(99,102,241,0.18),0_0_40px_rgba(99,102,241,0.07)]',
    ].join(' '),

    solid: [
      'border border-violet-400/30',
      'text-violet-100',
      'bg-gradient-to-br from-violet-900/50 to-indigo-900/40',
      'hover:from-violet-800/60 hover:to-indigo-800/50',
      'hover:border-violet-300/50',
      'hover:shadow-[0_0_24px_rgba(139,92,246,0.22),0_0_50px_rgba(139,92,246,0.08)]',
    ].join(' '),

    danger: [
      'border border-rose-500/25',
      'text-rose-300/80',
      'bg-transparent',
      'hover:bg-rose-900/20',
      'hover:border-rose-400/40',
      'hover:shadow-[0_0_16px_rgba(244,63,94,0.15)]',
    ].join(' '),

    subtle: [
      'border border-white/8',
      'text-indigo-300/55',
      'bg-transparent',
      'hover:bg-white/5',
      'hover:border-white/15',
      'hover:text-indigo-200/80',
    ].join(' '),
  };

  const base = [
    
    'rounded-full',
    'uppercase font-medium font-sans-body',
    'inline-flex items-center justify-center gap-2',
    fullWidth ? 'w-full' : 'w-auto',
    'cursor-pointer',
    'transition-all duration-500 ease-out',
    (disabled || isLoading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    sizes[size] ?? sizes.md,
    variants[variant] ?? variants.ghost,
    className,
  ].filter(Boolean).join(' ');

  const Tag = as;

  return (
    <Tag
      type={as === 'button' ? type : undefined}
      href={as === 'a' ? href : undefined}
      disabled={as === 'button' ? (disabled || isLoading) : undefined}
      onClick={!disabled && !isLoading ? onClick : undefined}
      className={base}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="flex gap-0.5 items-center" aria-hidden="true">
            {['0s', '0.2s', '0.4s'].map((delay, i) => (
              <span
                key={i}
                className="inline-block w-1 h-1 rounded-full bg-current"
                style={{ animation: `mystic-stellar-breathe 1.2s ease-in-out ${delay} infinite` }}
              />
            ))}
          </span>
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon    && <span className="flex-shrink-0 opacity-70" aria-hidden="true">{icon}</span>}
          {children}
          {iconRight && <span className="flex-shrink-0 opacity-70" aria-hidden="true">{iconRight}</span>}
        </>
      )}
    </Tag>
  );
}

export function MysticDivider({ label = '◊' }) {
  return (
    <div className="mystic-divider" aria-hidden="true">
      <span className="mystic-divider__line" />
      {label && (
        <span className="text-[10px] text-violet-400/35 font-mono-hud tracking-[0.3em] flex-shrink-0">
          {label}
        </span>
      )}
      <span className="mystic-divider__line" />
    </div>
  );
}

export function MysticFormPanel({ title, children, className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/6 p-5 space-y-4 ${className}`}
      style={{
        background:         'linear-gradient(135deg, rgba(11,9,20,0.65) 0%, rgba(8,5,18,0.55) 100%)',
        backdropFilter:     'blur(14px)',
        WebkitBackdropFilter:'blur(14px)',
        boxShadow:          '0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(196,181,253,0.06)',
      }}
    >
      <div
        className="absolute top-0 left-6 right-6 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(196,181,253,0.15) 30%, rgba(226,217,254,0.22) 50%, rgba(196,181,253,0.15) 70%, transparent)',
        }}
        aria-hidden="true"
      />

      {/* Título de sección */}
      {title && (
        <div className="flex items-center gap-2 pb-3 border-b border-white/6 mb-1">
          <span className="text-violet-400/50 text-[9px]">◊</span>
          <span className="text-[10px] font-medium tracking-[0.20em] uppercase text-indigo-300/55 font-mono-hud">
            {title}
          </span>
        </div>
      )}

      {children}
    </div>
  );
}

export function MysticSelect({ label, children, className = '', id: propId, ...rest }) {
  const autoId  = useId();
  const fieldId = propId ?? autoId;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.18em] uppercase text-indigo-300/60 font-mono-hud"
        >
          <span className="text-violet-400/40 text-[8px]">◊</span>
          {label}
        </label>
      )}
      <select
        id={fieldId}
        className={[
          'w-full rounded-xl px-4 py-3',
          'bg-white/4 backdrop-blur-sm',
          'border border-white/8',
          'text-sm text-mystic-star font-sans-body',
          'outline-none cursor-pointer',
          'focus:ring-2 focus:ring-indigo-500/20 focus:border-violet-400/30 focus:bg-white/6',
          'transition-all duration-400 ease-out',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'appearance-none',
        ].join(' ')}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}

export default function MysticFormDemo() {
  return (
    <MysticFormPanel title="Sistema de Formularios — Misticismo Digital" className="max-w-md mx-auto">
      <MysticInput
        label="Correo Electrónico"
        type="email"
        placeholder="tu@email.com"
        hint="Solo para contacto, nunca spam."
      />
      <MysticInput
        label="Contraseña"
        type="password"
        placeholder="••••••••"
      />
      <MysticDivider label="◊" />
      <div className="flex gap-3 flex-wrap">
        <MysticButton variant="solid" size="md">
          Iniciar Sesión
        </MysticButton>
        <MysticButton variant="ghost" size="md">
          Cancelar
        </MysticButton>
        <MysticButton variant="subtle" size="sm">
          ¿Olvidaste tu clave?
        </MysticButton>
      </div>
    </MysticFormPanel>
  );
}
