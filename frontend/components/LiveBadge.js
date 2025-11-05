import { Zap } from 'lucide-react';

/**
 * Componente LiveBadge - Badge "AO VIVO" com animação pulsante
 */
export default function LiveBadge({ size = 'md', showDot = true, showIcon = true }) {
  const sizes = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 14,
      dot: 'h-1.5 w-1.5',
    },
    md: {
      badge: 'px-3 py-1.5 text-sm',
      icon: 16,
      dot: 'h-2 w-2',
    },
    lg: {
      badge: 'px-4 py-2 text-base',
      icon: 18,
      dot: 'h-2.5 w-2.5',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-verde-medio ${sizeConfig.badge} font-semibold text-verde-neon shadow-verde-glow animate-pulse-live border border-verde-neon/30`}
    >
      {showDot && (
        <span
          className={`${sizeConfig.dot} animate-pulse-dot rounded-full bg-verde-neon shadow-verde-neon`}
        />
      )}
      {showIcon && <Zap size={sizeConfig.icon} className="text-verde-neon" />}
      <span>AO VIVO</span>
    </div>
  );
}

/**
 * Dot pulsante simples (para usar sozinho)
 */
export function LiveDot() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verde-neon opacity-75"></span>
      <span className="relative inline-flex h-3 w-3 rounded-full bg-verde-neon shadow-verde-neon"></span>
    </span>
  );
}

