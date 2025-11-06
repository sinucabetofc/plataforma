export default function CardInfo({ title, value, icon, trend, isCurrency, className = '' }) {
  const displayValue = isCurrency && typeof value === 'number' 
    ? `R$ ${value.toFixed(2)}` 
    : value;

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{displayValue}</div>
      {trend && <p className="text-sm text-gray-500">{trend}</p>}
    </div>
  );
}
