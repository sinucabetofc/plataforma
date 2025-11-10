/**
 * ============================================================
 * Parceiros - Saques
 * ============================================================
 */

import { useState } from 'react';
import { DollarSign, Clock, CheckCircle, TrendingUp, XCircle, Ban } from 'lucide-react';
import CardInfo from '../../../components/admin/CardInfo';
import WithdrawalModal from '../../../components/parceiros/WithdrawalModal';
import toast from 'react-hot-toast';
import { useInfluencerWithdrawals, useRequestWithdrawal, useCancelWithdrawal } from '../../../hooks/useInfluencerWithdrawals';
import { useInfluencerDashboard } from '../../../hooks/useInfluencerMatches';
import Loader from '../../../components/admin/Loader';

export default function ParceirosSaques() {
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Buscar dados da API
  const { data: dashboardData, isLoading: loadingDashboard } = useInfluencerDashboard();
  const { data: withdrawalsData, isLoading: loadingWithdrawals } = useInfluencerWithdrawals();
  const requestWithdrawalMutation = useRequestWithdrawal();
  const cancelWithdrawalMutation = useCancelWithdrawal();
  
  const availableBalance = dashboardData?.commission?.balance || 0;
  const withdrawals = withdrawalsData?.withdrawals || [];

  const formatCurrency = (value) => {
    // Remove tudo exceto números
    const numericValue = value.replace(/\D/g, '');
    
    // Se não houver números, retorna vazio
    if (!numericValue || numericValue === '' || numericValue === '0') {
      return '';
    }
    
    // Converte para número e divide por 100 para ter centavos
    const floatValue = parseFloat(numericValue) / 100;
    
    // Formata como moeda brasileira
    return floatValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const formatted = formatCurrency(value);
    setAmount(formatted);
  };

  const handleRequestWithdrawal = () => {
    if (!amount || amount === '0,00') {
      toast.error('Informe o valor do saque');
      return;
    }
    setShowModal(true);
  };

  const handleConfirmWithdrawal = async () => {
    try {
      const numericValue = parseFloat(amount.replace('.', '').replace(',', '.'));
      
      if (numericValue < 50) {
        toast.error('Valor mínimo é R$ 50,00');
        return;
      }
      
      if (numericValue > availableBalance) {
        toast.error('Saldo insuficiente');
        return;
      }
      
      await requestWithdrawalMutation.mutateAsync({
        amount: numericValue
      });
      
      setShowModal(false);
      setAmount('');
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro ao solicitar saque:', error);
    }
  };

  const handleWithdrawAll = async () => {
    try {
      if (availableBalance < 50) {
        toast.error('Saldo mínimo para saque é R$ 50,00');
        return;
      }
      
      await requestWithdrawalMutation.mutateAsync({
        amount: availableBalance
      });
      
      setShowModal(false);
      setAmount('');
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro ao solicitar saque:', error);
    }
  };
  
  const handleCancelWithdrawal = async (withdrawalId) => {
    if (!confirm('Tem certeza que deseja cancelar este saque?')) {
      return;
    }
    
    try {
      await cancelWithdrawalMutation.mutateAsync(withdrawalId);
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro ao cancelar saque:', error);
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
  
  // Calcular estatísticas
  const stats = {
    totalWithdrawn: withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + parseFloat(w.amount || 0), 0),
    pending: withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + parseFloat(w.amount || 0), 0),
    thisMonth: withdrawals
      .filter(w => {
        const date = new Date(w.requested_at);
        const now = new Date();
        return w.status === 'approved' && 
               date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, w) => sum + parseFloat(w.amount || 0), 0)
  };
  
  if (loadingDashboard || loadingWithdrawals) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
          Saques
        </h1>
        <p className="text-admin-text-secondary">
          Solicite e acompanhe seus saques de comissão
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardInfo
          title="Saldo Disponível"
          value={availableBalance}
          isCurrency
          icon={<DollarSign size={24} />}
          trend="Para saque"
          className="border-status-success"
        />

        <CardInfo
          title="Total Sacado"
          value={stats.totalWithdrawn}
          isCurrency
          icon={<TrendingUp size={24} />}
          trend="Histórico"
        />

        <CardInfo
          title="Pendentes"
          value={stats.pending}
          isCurrency
          icon={<Clock size={24} />}
          trend="Em análise"
          className="border-status-warning"
        />

        <CardInfo
          title="Este Mês"
          value={stats.thisMonth}
          isCurrency
          icon={<CheckCircle size={24} />}
          trend="Aprovados"
          className="border-status-info"
        />
      </div>

      {/* Request Withdrawal */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
          Solicitar Saque
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="admin-label">Valor</label>
            <input
              type="text"
              placeholder="0,00"
              value={amount}
              onChange={handleAmountChange}
              className="admin-input"
            />
            <p className="text-xs text-admin-text-muted mt-1">
              Valor mínimo: R$ 50,00
            </p>
          </div>

          <button 
            onClick={handleRequestWithdrawal}
            className="admin-btn-primary"
          >
            <DollarSign size={20} />
            Solicitar Saque
          </button>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <WithdrawalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        amount={amount}
        availableBalance={availableBalance}
        onConfirm={handleConfirmWithdrawal}
        onWithdrawAll={handleWithdrawAll}
      />

      {/* Withdrawals History */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
          Histórico de Saques
        </h3>

        {withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="mx-auto mb-4 text-admin-text-muted" size={48} />
            <p className="text-admin-text-muted">Nenhum saque realizado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="p-4 bg-admin-bg rounded-lg border-2 border-admin-border hover:border-admin-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(withdrawal.status)}
                  <span className="text-2xl font-bold text-[#27E502]">
                    R$ {parseFloat(withdrawal.amount).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-admin-text-muted">
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
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-400">
                      <strong>Motivo:</strong> {withdrawal.rejection_reason}
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Chave PIX:</span>
                    <span className="text-admin-text-primary font-mono text-xs">
                      {withdrawal.pix_key}
                    </span>
                  </div>
                </div>
                
                {/* Botão de cancelar (somente para pendentes) */}
                {withdrawal.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-admin-border">
                    <button
                      onClick={() => handleCancelWithdrawal(withdrawal.id)}
                      className="btn btn-secondary w-full flex items-center justify-center gap-2"
                      disabled={cancelWithdrawalMutation.isPending}
                    >
                      <Ban size={18} />
                      Cancelar Saque
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

