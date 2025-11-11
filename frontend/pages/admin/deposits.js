/**
 * ============================================================
 * Deposits Page - Gerenciamento de Depósitos
 * ============================================================
 */

import { useState } from 'react';
import { Check, X, Clock, AlertCircle, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useDeposits, useApproveDeposit, useRejectDeposit } from '../../hooks/admin/useDeposits';
import Loader from '../../components/admin/Loader';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';

export default function Deposits() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, error } = useDeposits({ 
    page: currentPage, 
    limit: 20,
    status: statusFilter 
  });

  const approveDeposit = useApproveDeposit();
  const rejectDeposit = useRejectDeposit();

  const handleApprove = async (depositId) => {
    if (!confirm('Tem certeza que deseja aprovar este depósito?')) return;

    try {
      await approveDeposit.mutateAsync(depositId);
      toast.success('Depósito aprovado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao aprovar depósito');
    }
  };

  const handleReject = async () => {
    if (!selectedDeposit) return;

    if (!rejectReason.trim()) {
      toast.error('Por favor, informe o motivo da rejeição');
      return;
    }

    try {
      await rejectDeposit.mutateAsync({ 
        depositId: selectedDeposit.id, 
        reason: rejectReason 
      });
      toast.success('Depósito rejeitado com sucesso!');
      setShowRejectModal(false);
      setSelectedDeposit(null);
      setRejectReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao rejeitar depósito');
    }
  };

  const openRejectModal = (deposit) => {
    setSelectedDeposit(deposit);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: 'bg-status-warning',
        text: 'Pendente',
        icon: <Clock size={14} />
      },
      completed: {
        color: 'bg-status-success',
        text: 'Aprovado',
        icon: <CheckCircle size={14} />
      },
      failed: {
        color: 'bg-status-error',
        text: 'Rejeitado',
        icon: <XCircle size={14} />
      }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color} text-white`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-status-error">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <p>Erro ao carregar depósitos</p>
      </div>
    );
  }

  const { deposits = [], pagination = {} } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
            Gerenciar Depósitos
          </h1>
          <p className="text-admin-text-muted">
            Aprovar ou rejeitar depósitos pendentes
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'all'
                ? 'bg-admin-green text-admin-black font-medium'
                : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
            }`}
          >
            Todos ({pagination.total || 0})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'pending'
                ? 'bg-admin-green text-admin-black font-medium'
                : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'completed'
                ? 'bg-admin-green text-admin-black font-medium'
                : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
            }`}
          >
            Aprovados
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'failed'
                ? 'bg-admin-green text-admin-black font-medium'
                : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
            }`}
          >
            Rejeitados
          </button>
        </div>
      </div>

      {/* Tabela de Depósitos */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-gray-light">
              <th className="text-left py-3 px-4 text-admin-text-muted font-medium">Usuário</th>
              <th className="text-left py-3 px-4 text-admin-text-muted font-medium">Valor</th>
              <th className="text-left py-3 px-4 text-admin-text-muted font-medium">Status</th>
              <th className="text-left py-3 px-4 text-admin-text-muted font-medium">Data</th>
              <th className="text-right py-3 px-4 text-admin-text-muted font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {deposits.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-admin-text-muted">
                  Nenhum depósito encontrado
                </td>
              </tr>
            ) : (
              deposits.map((deposit) => (
                <tr key={deposit.id} className="border-b border-admin-gray-dark hover:bg-admin-gray-light/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-admin-text-primary font-medium">{deposit.user?.name}</p>
                      <p className="text-sm text-admin-text-muted">{deposit.user?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-admin-green font-bold text-lg">
                      {formatCurrency(deposit.amount_reais)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(deposit.status)}
                  </td>
                  <td className="py-3 px-4 text-admin-text-secondary">
                    {formatDate(deposit.created_at)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {deposit.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(deposit.id)}
                            disabled={approveDeposit.isPending}
                            className="p-2 rounded-lg bg-status-success hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Aprovar"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => openRejectModal(deposit)}
                            disabled={rejectDeposit.isPending}
                            className="p-2 rounded-lg bg-status-error hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Rejeitar"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {deposit.status !== 'pending' && (
                        <span className="text-admin-text-muted text-sm">
                          Processado
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-admin-gray-light text-admin-text-primary hover:bg-admin-gray-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-admin-text-secondary">
            Página {currentPage} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages}
            className="px-4 py-2 rounded-lg bg-admin-gray-light text-admin-text-primary hover:bg-admin-gray-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modal de Rejeição */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-admin-gray-medium rounded-lg p-6 max-w-md w-full border border-admin-gray-light">
            <h2 className="text-xl font-bold text-admin-text-primary mb-4">
              Rejeitar Depósito
            </h2>
            
            <div className="mb-4">
              <p className="text-admin-text-secondary mb-2">
                Valor: <span className="text-admin-green font-bold">{formatCurrency(selectedDeposit?.amount_reais)}</span>
              </p>
              <p className="text-admin-text-secondary mb-4">
                Usuário: <span className="text-admin-text-primary">{selectedDeposit?.user?.name}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-admin-text-primary mb-2">
                Motivo da rejeição *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: Comprovante inválido, valor incorreto..."
                className="w-full px-4 py-2 rounded-lg bg-admin-gray-dark border border-admin-gray-light text-admin-text-primary placeholder-admin-text-muted focus:outline-none focus:border-admin-green resize-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedDeposit(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-admin-gray-light text-admin-text-primary hover:bg-admin-gray-dark transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={rejectDeposit.isPending || !rejectReason.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-status-error hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectDeposit.isPending ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

