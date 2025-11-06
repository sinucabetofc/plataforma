/**
 * ============================================================
 * Loader Component
 * ============================================================
 */

export default function Loader({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`spinner ${sizeClasses[size]} ${className}`}
        role="status"
        aria-label="Carregando"
      >
        <span className="sr-only">Carregando...</span>
      </div>
    </div>
  );
}

