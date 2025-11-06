/**
 * ============================================================
 * Table Component - Tabela Reutilizável
 * ============================================================
 */

import { useState } from 'react';
import Loader from './Loader';

export default function Table({ 
  columns, 
  data, 
  loading = false,
  onRowClick = null,
  emptyMessage = 'Nenhum dado encontrado',
  className = ''
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (columnKey) => {
    if (!columns.find(col => col.key === columnKey)?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = sortColumn
    ? [...data].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal === bVal) return 0;

        const comparison = aVal > bVal ? 1 : -1;
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : data;

  if (loading) {
    return (
      <div className="py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-admin-text-muted">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                onClick={() => column.sortable && handleSort(column.key)}
                className={column.sortable ? 'cursor-pointer hover:text-admin-green' : ''}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortColumn === column.key && (
                    <span className="text-admin-green">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr 
              key={row.id || index}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'cursor-pointer' : ''}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render 
                    ? column.render(row[column.key], row) 
                    : row[column.key] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Exemplo de uso:
 * 
 * const columns = [
 *   { key: 'name', label: 'Nome', sortable: true },
 *   { key: 'email', label: 'Email', sortable: true },
 *   { 
 *     key: 'status', 
 *     label: 'Status', 
 *     render: (value) => <StatusBadge status={value} />
 *   },
 *   { 
 *     key: 'actions', 
 *     label: 'Ações', 
 *     render: (_, row) => (
 *       <button onClick={() => handleEdit(row)}>Editar</button>
 *     )
 *   }
 * ];
 */

