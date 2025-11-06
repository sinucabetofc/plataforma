/**
 * Componente Loader - Feedback de carregamento
 */

'use client';

import { useState, useEffect } from 'react';

export default function Loader({ size = 'medium', text = 'Carregando...' }) {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-verde-neon border-t-transparent shadow-verde-glow`}
        role="status"
        aria-label="Carregando"
      />
      {text && (
        <p className="text-lg text-texto-secundario">{text}</p>
      )}
    </div>
  );
}

/**
 * Loader em tela cheia (overlay)
 */
export function FullPageLoader({ text = 'Carregando...' }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cinza-escuro bg-opacity-95 backdrop-blur-sm">
      <div className="rounded-xl border-2 border-verde-neon bg-[#1a1a1a] p-8 shadow-verde-strong">
        <Loader size="large" text={text} />
      </div>
    </div>
  );
}

/**
 * Loader inline (dentro de botões)
 */
export function InlineLoader() {
  return (
    <div
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent shadow-verde-glow"
      role="status"
      aria-label="Carregando"
    />
  );
}

