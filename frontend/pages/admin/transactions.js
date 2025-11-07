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

// Badge colorido para tipos de transação
const TransactionTypeBadge = ({ type }) => {
  const typeConfig = {
    aposta: { 
      label: 'Aposta', 
      bgColor: 'bg-red-500/20', 
      textColor: 'text-red-400', 
      borderColor: 'border-red-500/50' 
    },
    ganho: { 
      label: 'Ganho', 
      bgColor: 'bg-green-500/20', 
      textColor: 'text-green-400', 
      borderColor: 'border-green-500/50' 
    },
    reembolso: { 
      label: 'Reembolso', 
      bgColor: 'bg-blue-500/20', 
      textColor: 'text-blue-400', 
      borderColor: 'border-blue-500/50' 
    },
    deposito: { 
      label: 'Depósito', 
      bgColor: 'bg-emerald-500/20', 
      textColor: 'text-emerald-400', 
      borderColor: 'border-emerald-500/50' 
    },
    saque: { 
      label: 'Saque', 
      bgColor: 'bg-orange-500/20', 
      textColor: 'text-orange-400', 
      borderColor: 'border-orange-500/50' 
    },
    taxa: { 
      label: 'Taxa', 
      bgColor: 'bg-purple-500/20', 
      textColor: 'text-purple-400', 
      borderColor: 'border-purple-500/50' 
    },
    admin_credit: { 
      label: 'Crédito Admin', 
      bgColor: 'bg-cyan-500/20', 
      textColor: 'text-cyan-400', 
      borderColor: 'border-cyan-500/50' 
    },
    admin_debit: { 
      label: 'Débito Admin', 
      bgColor: 'bg-pink-500/20', 
      textColor: 'text-pink-400', 
      borderColor: 'border-pink-500/50' 
    },
  };

  const config = typeConfig[type] || { 
    label: type, 
    bgColor: 'bg-gray-500/20', 
    textColor: 'text-gray-400', 
    borderColor: 'border-gray-500/50' 
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      {config.label}
    </span>
  );
};

// Badge de status específico para transações
const TransactionStatusBadge = ({ status, type, metadata }) => {
  // Determinar texto e cor baseado no status E tipo
  let label, colorClass;

  // Para transações de APOSTA
  if (type === 'aposta') {
    if (status === 'pending') {
      label = 'Aguardando emparelhamento';
      colorClass = 'status-warning'; // 🟡 Amarelo
    } else if (status === 'completed') {
      // Verificar se é aposta casada ou resolvida através do metadata
      const betStatus = metadata?.bet_status;
      
      if (betStatus === 'aceita') {
        label = 'Aposta casada';
        colorClass = 'status-info'; // 🔵 Azul
      } else {
        label = 'Concluída';
        colorClass = 'status-success'; // 🟢 Verde
      }
    } else if (status === 'cancelled') {
      label = 'Cancelada';
      colorClass = 'status-error'; // 🔴 Vermelho
    } else {
      label = status;
      colorClass = 'status-info';
    }
  }
  // Para transações de DEPÓSITO ou SAQUE
  else if (type === 'deposito' || type === 'saque') {
    if (status === 'pending') {
      label = 'Pendente';
      colorClass = 'status-warning'; // 🟡 Amarelo
    } else if (status === 'completed') {
      label = 'Concluída';
      colorClass = 'status-success'; // 🟢 Verde
    } else if (status === 'failed') {
      label = 'Falhou';
      colorClass = 'status-error'; // 🔴 Vermelho
    } else if (status === 'cancelled') {
      label = 'Cancelada';
      colorClass = 'status-error'; // 🔴 Vermelho
    } else {
      label = status;
      colorClass = 'status-info';
    }
  }
  // Para outros tipos (ganho, reembolso, etc)
  else {
    if (status === 'pending') {
      label = 'Pendente';
      colorClass = 'status-warning'; // 🟡 Amarelo
    } else if (status === 'completed') {
      label = 'Concluída';
      colorClass = 'status-success'; // 🟢 Verde
    } else if (status === 'failed') {
      label = 'Falhou';
      colorClass = 'status-error'; // 🔴 Vermelho
    } else if (status === 'cancelled') {
      label = 'Cancelada';
      colorClass = 'status-error'; // 🔴 Vermelho
    } else {
      label = status;
      colorClass = 'status-info';
    }
  }

  return (
    <span className={`status-badge ${colorClass}`}>
      {label}
    </span>
  );
};

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
      render: (value) => <TransactionTypeBadge type={value} />,
    },
    {
      key: 'amount',
      label: 'Valor',
      render: (value) => {
        const amount = value / 100;
        const isNegative = amount < 0;
        return (
          <span className={`font-semibold ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
            {formatCurrency(amount)}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (status, row) => <TransactionStatusBadge status={status} type={row.type} metadata={row.metadata} />,
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
              <option value="deposito">Depósito</option>
              <option value="saque">Saque</option>
              <option value="aposta">Aposta</option>
              <option value="ganho">Ganho</option>
              <option value="taxa">Taxa</option>
              <option value="reembolso">Reembolso</option>
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

