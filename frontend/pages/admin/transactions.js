/**
 * ============================================================
 * Transactions Page - Página de Transações
 * ============================================================
 */

import { useTransactions } from '../../hooks/admin/useTransactions';
import useAdminStore from '../../store/adminStore';
import Table from '../../components/admin/Table';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatCurrency, formatDate, formatTransactionType } from '../../utils/formatters';
import { FileText } from 'lucide-react';

export default function Transactions() {
  const { filters, setTransactionsFilters } = useAdminStore();
  const transactionsFilters = filters.transactions;
  
  const { data, isLoading } = useTransactions(transactionsFilters);

  const columns = [
    {
      key: 'user',
      label: 'Usuário',
      render: (user) => (
        <div>
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs text-admin-text-muted">{user?.email}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value) => formatTransactionType(value),
    },
    {
      key: 'amount',
      label: 'Valor',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'created_at',
      label: 'Data',
      render: (value) => formatDate(value),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
            Transações
          </h1>
          <p className="text-admin-text-secondary">
            Histórico completo de transações
          </p>
        </div>
        <div className="flex-shrink-0">
          <FileText className="text-admin-green" size={24} />
        </div>
      </div>

      <div className="admin-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-admin-text-secondary mb-2">
              Tipo
            </label>
            <select
              className="select"
              value={transactionsFilters.type || ''}
              onChange={(e) => setTransactionsFilters({ type: e.target.value || null, page: 1 })}
            >
              <option value="">Todos</option>
              <option value="deposit">Depósito</option>
              <option value="withdraw">Saque</option>
              <option value="bet">Aposta</option>
              <option value="win">Ganho</option>
              <option value="fee">Taxa</option>
              <option value="refund">Reembolso</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text-secondary mb-2">
              Status
            </label>
            <select
              className="select"
              value={transactionsFilters.status || ''}
              onChange={(e) => setTransactionsFilters({ status: e.target.value || null, page: 1 })}
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="completed">Concluído</option>
              <option value="failed">Falhou</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <Table
          columns={columns}
          data={data?.transactions || []}
          loading={isLoading}
          emptyMessage="Nenhuma transação encontrada"
        />

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-admin-text-muted">
              Página {data.pagination.page} de {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setTransactionsFilters({ page: transactionsFilters.page - 1 })}
                disabled={transactionsFilters.page === 1}
                className="btn btn-secondary btn-sm"
              >
                Anterior
              </button>
              <button
                onClick={() => setTransactionsFilters({ page: transactionsFilters.page + 1 })}
                disabled={transactionsFilters.page >= data.pagination.totalPages}
                className="btn btn-secondary btn-sm"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

