/**
 * ============================================================
 * Withdrawals Page - Página de Saques
 * ============================================================
 */

import { useState } from 'react';
import { useWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from '../../hooks/admin/useWithdrawals';
import useAdminStore from '../../store/adminStore';
import Table from '../../components/admin/Table';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatCurrency, formatDate, formatPixKey } from '../../utils/formatters';
import { DollarSign, Check, X } from 'lucide-react';

export default function Withdrawals() {
  const { filters, setWithdrawalsFilters } = useAdminStore();
  const withdrawalsFilters = filters.withdrawals;
  
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, isLoading } = useWithdrawals(withdrawalsFilters);
  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();

  const handleApprove = async (withdrawal) => {
    if (!confirm(`Confirmar aprovação do saque de ${formatCurrency(withdrawal.amount)}?`)) {
      return;
    }

    await approveWithdrawal.mutateAsync(withdrawal.id);
  };

  const handleRejectClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert('Informe o motivo da recusa');
      return;
    }

    await rejectWithdrawal.mutateAsync({
      withdrawalId: selectedWithdrawal.id,
      reason: rejectReason,
    });

    setShowRejectModal(false);
    setSelectedWithdrawal(null);
    setRejectReason('');
  };

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
      key: 'amount',
      label: 'Valor Bruto',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'fee',
      label: 'Taxa (8%)',
      render: (value) => (
        <span className="text-status-warning">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'netAmount',
      label: 'Valor Líquido',
      render: (value) => (
        <span className="text-admin-green font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'user',
      label: 'Chave PIX',
      render: (user) => formatPixKey(user?.pix_key, user?.pix_type),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'created_at',
      label: 'Data',
      render: (value) => formatDate(value, 'dd/MM/yyyy HH:mm'),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => {
        if (row.status !== 'pending') return '-';
        
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(row)}
              className="btn btn-primary btn-sm px-3 py-1 text-xs"
              disabled={approveWithdrawal.isPending}
              title="Aprovar"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => handleRejectClick(row)}
              className="btn btn-danger btn-sm px-3 py-1 text-xs"
              disabled={rejectWithdrawal.isPending}
              title="Recusar"
            >
              <X size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
            Saques
          </h1>
          <p className="text-admin-text-secondary">
            Aprovar ou recusar solicitações de saque
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <DollarSign className="text-admin-green" size={24} />
        </div>
      </div>

      {/* Filtros */}
      <div className="admin-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-admin-text-secondary mb-2">
              Status
            </label>
            <select
              className="select"
              value={withdrawalsFilters.status || ''}
              onChange={(e) => setWithdrawalsFilters({ status: e.target.value || null, page: 1 })}
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="completed">Aprovado</option>
              <option value="failed">Recusado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="admin-card">
        <Table
          columns={columns}
          data={data?.withdrawals || []}
          loading={isLoading}
          emptyMessage="Nenhum saque encontrado"
        />

        {/* Paginação */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-admin-text-muted">
              Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.total} itens)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setWithdrawalsFilters({ page: withdrawalsFilters.page - 1 })}
                disabled={withdrawalsFilters.page === 1}
                className="btn btn-secondary btn-sm"
              >
                Anterior
              </button>
              <button
                onClick={() => setWithdrawalsFilters({ page: withdrawalsFilters.page + 1 })}
                disabled={withdrawalsFilters.page >= data.pagination.totalPages}
                className="btn btn-secondary btn-sm"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Rejeição */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-gray-medium border border-admin-gray-light rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Recusar Saque</h3>
            <p className="text-admin-text-secondary mb-4">
              Informe o motivo da recusa do saque de{' '}
              <span className="text-admin-green font-bold">
                {formatCurrency(selectedWithdrawal?.amount)}
              </span>
            </p>
            <textarea
              className="input min-h-[100px] mb-4"
              placeholder="Ex: Dados bancários incorretos, documentação pendente..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectSubmit}
                className="btn btn-danger flex-1"
                disabled={rejectWithdrawal.isPending}
              >
                {rejectWithdrawal.isPending ? 'Processando...' : 'Recusar Saque'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

