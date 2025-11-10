/**
 * ============================================================
 * Admin - Gerenciar Saques dos Parceiros
 * ============================================================
 */

import { useState } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, User, Phone, Key, Ban, Users, Star } from 'lucide-react';
import CardInfo from '../../components/admin/CardInfo';
import Loader from '../../components/admin/Loader';
import toast from 'react-hot-toast';
import { useWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from '../../hooks/admin/useWithdrawals';

export default function AdminWithdrawals() {
  const [filter, setFilter] = useState('pending');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Hooks
  const { data, isLoading } = useWithdrawals({ status: filter === 'all' ? '' : filter });
  const approveWithdrawalMutation = useApproveWithdrawal();
  const rejectWithdrawalMutation = useRejectWithdrawal();

  const withdrawals = data?.withdrawals || [];

  const handleApprove = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowApproveModal(true);
  };

  const handleReject = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    try {
      await approveWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal.id,
        withdrawal_type: selectedWithdrawal.type
      });
      setShowApproveModal(false);
      setSelectedWithdrawal(null);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Informe o motivo da rejeição');
      return;
    }

    try {
      await rejectWithdrawalMutation.mutateAsync({
      withdrawalId: selectedWithdrawal.id,
        withdrawal_type: selectedWithdrawal.type,
        reason: rejectionReason
    });
    setShowRejectModal(false);
    setSelectedWithdrawal(null);
      setRejectionReason('');
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { className: 'status-badge-warning', label: 'Pendente', icon: <Clock size={16} /> },
      approved: { className: 'status-badge-success', label: 'Aprovado', icon: <CheckCircle size={16} /> },
      rejected: { className: 'status-badge-error', label: 'Rejeitado', icon: <XCircle size={16} /> },
      cancelled: { className: 'bg-gray-600 text-white', label: 'Cancelado', icon: <Ban size={16} /> }
    };

    const badge = badges[status] || badges.pending;
        
        return (
      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${badge.className}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (type === 'influencer') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-600/20 text-purple-400 border border-purple-500/30">
          <Star size={16} />
          Parceiro
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600/20 text-blue-400 border border-blue-500/30">
          <Users size={16} />
          Apostador
        </span>
      );
    }
  };

  // Calcular estatísticas
  const stats = {
    total: withdrawals.length,
    influencers: withdrawals.filter(w => w.type === 'influencer').length,
    users: withdrawals.filter(w => w.type === 'user').length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    pendingAmount: withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + parseFloat(w.amount || 0), 0),
    approved: withdrawals.filter(w => w.status === 'approved').length,
    rejected: withdrawals.filter(w => w.status === 'rejected').length
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
          <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
          Gerenciar Saques
          </h1>
          <p className="text-admin-text-secondary">
          Aprovar ou rejeitar solicitações de saque de parceiros e apostadores
          </p>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardInfo
          title="Total de Saques"
          value={stats.total}
          icon={<DollarSign size={24} />}
          trend="Geral"
        />

        <CardInfo
          title="Parceiros"
          value={stats.influencers}
          icon={<Star size={24} />}
          trend="Influencers"
          className="border-purple-500/30"
        />

        <CardInfo
          title="Apostadores"
          value={stats.users}
          icon={<Users size={24} />}
          trend="Usuários"
          className="border-blue-500/30"
        />

        <CardInfo
          title="Pendentes"
          value={stats.pending}
          icon={<Clock size={24} />}
          trend={`R$ ${stats.pendingAmount.toFixed(2)}`}
          className="border-status-warning"
        />
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'pending', label: 'Pendentes' },
            { value: 'approved', label: 'Aprovados' },
            { value: 'rejected', label: 'Rejeitados' },
            { value: 'cancelled', label: 'Cancelados' },
            { value: 'all', label: 'Todos' }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f.value
                  ? 'bg-[#27E502] text-cinza-escuro'
                  : 'bg-admin-border text-admin-text-primary hover:bg-admin-border/70'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="space-y-4">
        {withdrawals.length === 0 ? (
          <div className="admin-card text-center py-12">
            <DollarSign className="mx-auto mb-4 text-admin-text-muted" size={48} />
            <p className="text-admin-text-muted">Nenhum saque encontrado</p>
          </div>
        ) : (
          withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="admin-card hover:border-admin-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  {getTypeBadge(withdrawal.type)}
                  {getStatusBadge(withdrawal.status)}
                </div>
                <span className="text-3xl font-bold text-[#27E502]">
                  R$ {parseFloat(withdrawal.amount).toFixed(2).replace('.', ',')}
                </span>
              </div>

              {/* Requester Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-admin-bg rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <User size={16} className="text-admin-text-muted" />
                  <span className="text-admin-text-muted">{withdrawal.requester?.type}:</span>
                  <span className="text-admin-text-primary font-semibold">
                    {withdrawal.requester?.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-admin-text-muted" />
                  <span className="text-admin-text-muted">Telefone:</span>
                  <span className="text-admin-text-primary font-mono">
                    {withdrawal.requester?.phone}
                  </span>
                </div>

                {/* CPF (apenas para apostadores) */}
                {withdrawal.type === 'user' && withdrawal.requester?.cpf && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-admin-text-muted">CPF:</span>
                    <span className="text-admin-text-primary font-mono">
                      {withdrawal.requester.cpf}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm col-span-2">
                  <Key size={16} className="text-admin-text-muted" />
                  <span className="text-admin-text-muted">Chave PIX ({withdrawal.pix_type}):</span>
                  <span className="text-admin-text-primary font-mono text-xs">
                    {withdrawal.pix_key}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 text-sm text-admin-text-muted mb-4">
                <div className="flex justify-between">
                  <span>Solicitado em:</span>
                  <span className="text-admin-text-primary">
                    {new Date(withdrawal.requested_at).toLocaleString('pt-BR')}
                  </span>
                </div>

                {withdrawal.approved_at && (
                  <div className="flex justify-between">
                    <span>Aprovado em:</span>
                    <span className="text-green-600">
                      {new Date(withdrawal.approved_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}

                {withdrawal.rejected_at && (
                  <div className="flex justify-between">
                    <span>Rejeitado em:</span>
                    <span className="text-red-600">
                      {new Date(withdrawal.rejected_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}

                {withdrawal.rejection_reason && (
                  <div className="mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400">
                    <strong>Motivo da Rejeição:</strong> {withdrawal.rejection_reason}
                  </div>
                )}
              </div>

              {/* Actions (only for pending) */}
              {withdrawal.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-admin-border">
                  <button
                    onClick={() => handleApprove(withdrawal)}
                    className="btn btn-success flex-1 flex items-center justify-center gap-2"
                    disabled={approveWithdrawalMutation.isPending}
                  >
                    <CheckCircle size={18} />
                    Aprovar Saque
                  </button>

                  <button
                    onClick={() => handleReject(withdrawal)}
                    className="btn btn-danger flex-1 flex items-center justify-center gap-2"
                    disabled={rejectWithdrawalMutation.isPending}
                  >
                    <XCircle size={18} />
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="admin-card max-w-lg w-full">
            <h3 className="text-2xl font-bold text-admin-text-primary mb-4">
              Confirmar Aprovação
            </h3>

            <div className="space-y-4 mb-6">
              <p className="text-admin-text-secondary">
                Tem certeza que deseja aprovar este saque?
              </p>

              <div className="p-4 bg-admin-bg rounded-lg border border-admin-border">
                <div className="flex justify-between mb-2">
                  <span className="text-admin-text-muted">Tipo:</span>
                  {getTypeBadge(selectedWithdrawal.type)}
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-admin-text-muted">{selectedWithdrawal.requester?.type}:</span>
                  <span className="text-admin-text-primary font-semibold">
                    {selectedWithdrawal.requester?.name}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-admin-text-muted">Valor:</span>
                  <span className="text-2xl font-bold text-[#27E502]">
                    R$ {parseFloat(selectedWithdrawal.amount).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-admin-text-muted">Chave PIX:</span>
                  <span className="text-admin-text-primary font-mono text-sm">
                    {selectedWithdrawal.pix_key}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-yellow-400 text-sm">
                ⚠️ Ao aprovar, o valor será deduzido do saldo do parceiro automaticamente.
                Certifique-se de que o PIX foi realizado antes de aprovar.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedWithdrawal(null);
                }}
                className="btn btn-secondary flex-1"
                disabled={approveWithdrawalMutation.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={confirmApprove}
                className="btn btn-success flex-1"
                disabled={approveWithdrawalMutation.isPending}
              >
                {approveWithdrawalMutation.isPending ? 'Aprovando...' : 'Confirmar Aprovação'}
              </button>
            </div>
            </div>
          </div>
        )}

      {/* Reject Modal */}
      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="admin-card max-w-lg w-full">
            <h3 className="text-2xl font-bold text-admin-text-primary mb-4">
              Rejeitar Saque
            </h3>

            <div className="space-y-4 mb-6">
              <p className="text-admin-text-secondary">
                Informe o motivo da rejeição:
              </p>

              <div className="p-4 bg-admin-bg rounded-lg border border-admin-border mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-admin-text-muted">Tipo:</span>
                  {getTypeBadge(selectedWithdrawal.type)}
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-admin-text-muted">{selectedWithdrawal.requester?.type}:</span>
                  <span className="text-admin-text-primary font-semibold">
                    {selectedWithdrawal.requester?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-admin-text-muted">Valor:</span>
                  <span className="text-xl font-bold text-red-400">
                    R$ {parseFloat(selectedWithdrawal.amount).toFixed(2).replace('.', ',')}
                  </span>
                </div>
      </div>

            <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Saldo insuficiente, dados incorretos, etc."
                className="admin-input min-h-[100px]"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedWithdrawal(null);
                  setRejectionReason('');
                }}
                className="btn btn-secondary flex-1"
                disabled={rejectWithdrawalMutation.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={confirmReject}
                className="btn btn-danger flex-1"
                disabled={rejectWithdrawalMutation.isPending}
              >
                {rejectWithdrawalMutation.isPending ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
