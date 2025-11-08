/**
 * ============================================================
 * Parceiros - Saques
 * ============================================================
 */

import { useState } from 'react';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import CardInfo from '../../../components/admin/CardInfo';
import WithdrawalModal from '../../../components/parceiros/WithdrawalModal';
import toast from 'react-hot-toast';

export default function ParceirosSaques() {
  const [withdrawals] = useState([]);
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // TODO: Buscar saldo real da API
  const availableBalance = 150.00; // Exemplo

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
      // TODO: Chamar API para criar saque
      toast.success('Saque solicitado com sucesso!');
      setShowModal(false);
      setAmount('');
    } catch (error) {
      toast.error('Erro ao solicitar saque');
    }
  };

  const handleWithdrawAll = async () => {
    try {
      // TODO: Chamar API para sacar tudo disponível
      toast.success(`Saque de R$ ${availableBalance.toFixed(2).replace('.', ',')} solicitado!`);
      setShowModal(false);
      setAmount('');
    } catch (error) {
      toast.error('Erro ao solicitar saque');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pendente: { className: 'status-badge-info', label: 'Pendente' },
      processando: { className: 'status-badge-warning', label: 'Processando' },
      aprovado: { className: 'status-badge-success', label: 'Aprovado' },
      rejeitado: { className: 'status-badge-error', label: 'Rejeitado' }
    };

    const badge = badges[status] || badges.pendente;

    return (
      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

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
          value={0}
          isCurrency
          icon={<TrendingUp size={24} />}
          trend="Histórico"
        />

        <CardInfo
          title="Pendentes"
          value={0}
          isCurrency
          icon={<Clock size={24} />}
          trend="Em análise"
          className="border-status-warning"
        />

        <CardInfo
          title="Este Mês"
          value={0}
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
                className="p-4 bg-admin-gray-light rounded-lg border border-admin-gray-dark"
              >
                <div className="flex items-start justify-between mb-2">
                  {getStatusBadge(withdrawal.status)}
                  <span className="text-lg font-bold text-status-warning">
                    R$ {withdrawal.amount.toFixed(2)}
                  </span>
                </div>
                
                <div className="text-xs text-admin-text-muted">
                  Solicitado em: {new Date(withdrawal.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

