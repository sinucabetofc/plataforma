export default function Loader({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-green-500 rounded-full animate-spin`}
      />
    </div>
  );
}
