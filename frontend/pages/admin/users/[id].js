/**
 * ============================================================
 * User Details Page - Página de Detalhes do Usuário
 * ============================================================
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser, useUserTransactions, useUserBets } from '../../../hooks/admin/useUsers';
import StatusBadge from '../../../components/admin/StatusBadge';
import Table from '../../../components/admin/Table';
import { formatCurrency, formatCPF, formatPhone, formatDate } from '../../../utils/formatters';
import { ArrowLeft, User, Wallet, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { post } from '../../../utils/api';

export default function UserDetails() {
  const router = useRouter();
  const { id } = router.query;

  const { data: user, isLoading: userLoading, refetch: refetchUser } = useUser(id);
  const { data: transactionsData } = useUserTransactions(id, { page: 1, limit: 10 });
  const { data: betsData } = useUserBets(id, { page: 1, limit: 10 });

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceOperation, setBalanceOperation] = useState('add'); // 'add' ou 'remove'
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleOpenBalanceModal = (operation) => {
    setBalanceOperation(operation);
    setBalanceAmount('');
    setBalanceReason('');
    setShowBalanceModal(true);
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(balanceAmount);
    if (!amount || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    if (!balanceReason.trim()) {
      toast.error('Motivo é obrigatório');
      return;
    }

    try {
      setProcessing(true);
      
      const amountInCents = Math.round(amount * 100);
      const finalAmount = balanceOperation === 'add' ? amountInCents : -amountInCents;

      await post(`/admin/users/${id}/adjust-balance`, {
        amount: finalAmount,
        reason: balanceReason,
      });

      toast.success(
        balanceOperation === 'add' 
          ? `Saldo adicionado: ${formatCurrency(amount)}` 
          : `Saldo removido: ${formatCurrency(amount)}`
      );

      setShowBalanceModal(false);
      refetchUser();
    } catch (error) {
      console.error('Erro ao ajustar saldo:', error);
      toast.error(error.message || 'Erro ao ajustar saldo');
    } finally {
      setProcessing(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-admin-text-secondary">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-admin-text-secondary mb-4">Usuário não encontrado</div>
        <button onClick={() => router.push('/admin/users')} className="btn btn-primary">
          Voltar para Usuários
        </button>
      </div>
    );
  }

  const transactionColumns = [
    {
      key: 'type',
      label: 'Tipo',
      render: (value) => {
        const types = {
          deposit: { label: 'Depósito', icon: '💰', color: 'text-green-500' },
          withdraw: { label: 'Saque', icon: '💸', color: 'text-red-500' },
          bet: { label: 'Aposta', icon: '🎯', color: 'text-blue-500' },
          win: { label: 'Ganho', icon: '🎉', color: 'text-green-500' },
          refund: { label: 'Reembolso', icon: '↩️', color: 'text-yellow-500' },
          fee: { label: 'Taxa', icon: '💳', color: 'text-gray-500' },
        };
        const type = types[value] || { label: value, icon: '📝', color: 'text-gray-500' };
        return (
          <span className={`flex items-center gap-1 ${type.color}`}>
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </span>
        );
      },
    },
    {
      key: 'amount',
      label: 'Valor',
      render: (value, row) => {
        const amount = formatCurrency(value / 100);
        const isPositive = ['deposit', 'win', 'refund'].includes(row.type);
        return (
          <span className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : '-'} {amount}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'created_at',
      label: 'Data',
      render: (value) => formatDate(value),
    },
  ];

  const betColumns = [
    {
      key: 'match',
      label: 'Partida',
      render: (match) => match?.title || <span className="text-admin-text-muted">Sem informação</span>,
    },
    {
      key: 'amount',
      label: 'Valor',
      render: (value) => (
        <span className="font-semibold text-admin-text-primary">
          {formatCurrency(value / 100)}
        </span>
      ),
    },
    {
      key: 'odd',
      label: 'Odd',
      render: (value) => value ? (
        <span className="font-semibold text-admin-green">{value.toFixed(2)}</span>
      ) : (
        <span className="text-admin-text-muted text-sm">-</span>
      ),
    },
    {
      key: 'potential_win',
      label: 'Ganho Potencial',
      render: (value) => value ? (
        <span className="font-semibold text-green-500">{formatCurrency(value / 100)}</span>
      ) : (
        <span className="text-admin-text-muted text-sm">-</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'created_at',
      label: 'Data',
      render: (value) => formatDate(value),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Botão Voltar */}
      <div>
        <button
          onClick={() => router.push('/admin/users')}
          className="btn btn-secondary flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
            Detalhes do Usuário
          </h1>
          <p className="text-admin-text-secondary">
            Visualizar informações completas do usuário
          </p>
        </div>
      </div>

      {/* Informações do Usuário */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card - Dados Pessoais */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-admin-green/20 flex items-center justify-center">
              <User className="text-admin-green" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-admin-text-primary">Dados Pessoais</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-admin-text-muted">Nome</label>
              <p className="text-admin-text-primary font-medium">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-admin-text-muted">Email</label>
              <p className="text-admin-text-primary font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-admin-text-muted">CPF</label>
              <p className="text-admin-text-primary font-medium">{formatCPF(user.cpf)}</p>
            </div>
            <div>
              <label className="text-sm text-admin-text-muted">Telefone</label>
              <p className="text-admin-text-primary font-medium">{formatPhone(user.phone)}</p>
            </div>
            <div>
              <label className="text-sm text-admin-text-muted">Status</label>
              <div className="mt-1">
                <StatusBadge status={user.is_active ? 'active' : 'blocked'} />
              </div>
            </div>
            <div>
              <label className="text-sm text-admin-text-muted">Tipo de Conta</label>
              <p className="text-admin-text-primary font-medium capitalize">{user.role}</p>
            </div>
            <div>
              <label className="text-sm text-admin-text-muted">Data de Cadastro</label>
              <p className="text-admin-text-primary font-medium">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Card - Informações Financeiras */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-admin-green/20 flex items-center justify-center">
              <Wallet className="text-admin-green" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-admin-text-primary">Carteira</h2>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-admin-bg-tertiary rounded-lg border border-admin-border">
              <label className="text-sm text-admin-text-muted">Saldo Atual</label>
              <p className="text-3xl font-bold text-admin-green mt-2 mb-4">
                {formatCurrency((user.wallet?.balance || 0) / 100)}
              </p>
              
              {/* Botões de Ajuste de Saldo */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenBalanceModal('add')}
                  className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 flex-1"
                >
                  <Plus size={16} />
                  Adicionar Saldo
                </button>
                <button
                  onClick={() => handleOpenBalanceModal('remove')}
                  className="btn btn-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 flex-1"
                >
                  <Minus size={16} />
                  Remover Saldo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-admin-bg-tertiary rounded-lg border border-admin-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-green-500" size={18} />
                  <label className="text-sm text-admin-text-muted">Total Depositado</label>
                </div>
                <p className="text-xl font-semibold text-admin-text-primary">
                  {formatCurrency((user.wallet?.total_deposited || 0) / 100)}
                </p>
              </div>

              <div className="p-4 bg-admin-bg-tertiary rounded-lg border border-admin-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="text-red-500" size={18} />
                  <label className="text-sm text-admin-text-muted">Total Sacado</label>
                </div>
                <p className="text-xl font-semibold text-admin-text-primary">
                  {formatCurrency((user.wallet?.total_withdrawn || 0) / 100)}
                </p>
              </div>
            </div>

            {user.wallet && (
              <>
                <div>
                  <label className="text-sm text-admin-text-muted">Data de Criação da Carteira</label>
                  <p className="text-admin-text-primary font-medium mt-1">
                    {formatDate(user.wallet.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-admin-text-muted">Última Atualização</label>
                  <p className="text-admin-text-primary font-medium mt-1">
                    {formatDate(user.wallet.updated_at)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="admin-card">
        <h2 className="text-xl font-semibold text-admin-text-primary mb-4">Transações Recentes</h2>
        <Table
          columns={transactionColumns}
          data={transactionsData?.transactions || []}
          emptyMessage="Nenhuma transação encontrada"
        />
      </div>

      {/* Apostas Recentes */}
      <div className="admin-card">
        <h2 className="text-xl font-semibold text-admin-text-primary mb-4">Apostas Recentes</h2>
        <Table
          columns={betColumns}
          data={betsData?.bets || []}
          emptyMessage="Nenhuma aposta encontrada"
        />
      </div>

      {/* Modal de Ajuste de Saldo */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-gray-dark rounded-lg max-w-md w-full border border-black">
            <div className="p-6 border-b border-black">
              <h2 className="text-2xl font-bold text-admin-text-primary flex items-center gap-2">
                {balanceOperation === 'add' ? (
                  <>
                    <Plus className="text-green-500" size={24} />
                    Adicionar Saldo
                  </>
                ) : (
                  <>
                    <Minus className="text-red-500" size={24} />
                    Remover Saldo
                  </>
                )}
              </h2>
            </div>

            <form onSubmit={handleBalanceSubmit} className="p-6 space-y-4">
              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-admin-text-primary mb-2">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-admin-gray-medium border border-black rounded-lg text-admin-text-primary focus:outline-none focus:border-admin-green"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-admin-text-primary mb-2">
                  Motivo *
                </label>
                <textarea
                  required
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  className="w-full px-4 py-2 bg-admin-gray-medium border border-black rounded-lg text-admin-text-primary focus:outline-none focus:border-admin-green"
                  rows="3"
                  placeholder="Descreva o motivo do ajuste..."
                />
              </div>

              {/* Preview */}
              <div className={`p-4 rounded-lg border ${
                balanceOperation === 'add' 
                  ? 'bg-green-500/10 border-green-500' 
                  : 'bg-red-500/10 border-red-500'
              }`}>
                <p className="text-sm text-admin-text-muted mb-1">Operação:</p>
                <p className={`text-lg font-bold ${
                  balanceOperation === 'add' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {balanceOperation === 'add' ? '+' : '-'} {balanceAmount ? formatCurrency(parseFloat(balanceAmount)) : 'R$ 0,00'}
                </p>
                <p className="text-xs text-admin-text-muted mt-2">
                  Saldo atual: {formatCurrency((user.wallet?.balance || 0) / 100)}
                </p>
                <p className="text-xs text-admin-text-muted">
                  Novo saldo: {formatCurrency(
                    ((user.wallet?.balance || 0) / 100) + 
                    (balanceOperation === 'add' ? parseFloat(balanceAmount || 0) : -parseFloat(balanceAmount || 0))
                  )}
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBalanceModal(false)}
                  className="btn btn-secondary flex-1"
                  disabled={processing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`btn flex-1 ${
                    balanceOperation === 'add' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                  disabled={processing}
                >
                  {processing ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

