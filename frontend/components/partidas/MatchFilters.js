/**
 * ============================================================
 * MatchFilters - Filtros de Partidas
 * ============================================================
 */

export default function MatchFilters({ filters, onFilterChange, onReset }) {
  const statusOptions = [
    { value: '', label: 'Todas' },
    { value: 'agendada', label: 'Agendadas' },
    { value: 'em_andamento', label: 'Ao Vivo' },
    { value: 'finalizada', label: 'Finalizadas' },
  ];

  const sportOptions = [
    { value: '', label: 'Todas' },
    { value: 'sinuca', label: '🎱 Sinuca' },
    { value: 'futebol', label: '⚽ Futebol' },
  ];

  const hasActiveFilters = filters.status || filters.sport;

  return (
    <div className="bg-[#000000] rounded-lg shadow-md p-4 mb-6 border border-gray-800">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Título */}
        <div className="flex-shrink-0">
          <h3 className="text-sm font-semibold text-white">Filtros:</h3>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Status */}
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg text-sm
                         focus:ring-2 focus:ring-green-500 focus:border-transparent
                         bg-[#1a1a1a] text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Modalidade */}
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Modalidade</label>
            <select
              value={filters.sport || ''}
              onChange={(e) => onFilterChange('sport', e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg text-sm
                         focus:ring-2 focus:ring-green-500 focus:border-transparent
                         bg-[#1a1a1a] text-white"
            >
              {sportOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão Limpar */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white
                       hover:bg-gray-800 rounded-lg transition-colors"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Status: {statusOptions.find(o => o.value === filters.status)?.label}
                <button
                  onClick={() => onFilterChange('status', '')}
                  className="hover:text-green-600"
                >
                  ×
                </button>
              </span>
            )}
            {filters.sport && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Modalidade: {sportOptions.find(o => o.value === filters.sport)?.label}
                <button
                  onClick={() => onFilterChange('sport', '')}
                  className="hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

