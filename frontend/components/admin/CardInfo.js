/**
 * ============================================================
 * CardInfo Component - Card de Informação/Métrica
 * ============================================================
 */

import { formatNumber, formatCurrency } from '../../utils/formatters';

export default function CardInfo({ 
  title, 
  value, 
  icon, 
  trend = null,
  isCurrency = false,
  className = '' 
}) {
  const formattedValue = isCurrency 
    ? formatCurrency(value) 
    : formatNumber(value);

  return (
    <div className={`admin-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-admin-text-secondary mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-admin-green mb-2">
            {formattedValue}
          </h3>
          {trend && (
            <p className="text-xs text-admin-text-muted">
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 rounded-lg bg-admin-gray-light text-admin-green">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

