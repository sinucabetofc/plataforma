/**
 * ============================================================
 * Withdrawal Modal - Modal de Confirmação de Saque
 * ============================================================
 */

import { X, AlertCircle, DollarSign, CheckCircle } from 'lucide-react';

export default function WithdrawalModal({ 
  isOpen, 
  onClose, 
  amount, 
  availableBalance = 0,
  onConfirm,
  onWithdrawAll 
}) {
  if (!isOpen) return null;

  const requestedAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
  const hasInsufficientBalance = requestedAmount > availableBalance;
  const isValidAmount = requestedAmount >= 50;
  const canWithdraw = !hasInsufficientBalance && isValidAmount;

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-admin-gray-medium rounded-lg border border-admin-gray-light max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-admin-gray-light">
          <h3 className="text-xl font-semibold text-admin-text-primary flex items-center gap-2">
            <DollarSign className="text-[#27E502]" size={24} />
            Confirmar Saque
          </h3>
          <button
            onClick={onClose}
            className="text-admin-text-muted hover:text-admin-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Saldo Disponível */}
          <div className="p-4 bg-admin-gray-light rounded-lg border border-admin-gray-dark">
            <p className="text-sm text-admin-text-muted mb-1">Saldo Disponível</p>
            <p className="text-2xl font-bold text-[#27E502]">
              R$ {formatCurrency(availableBalance)}
            </p>
          </div>

          {/* Valor Solicitado */}
          <div className="p-4 bg-admin-gray-light rounded-lg border border-admin-gray-dark">
            <p className="text-sm text-admin-text-muted mb-1">Valor Solicitado</p>
            <p className="text-2xl font-bold text-admin-text-primary">
              R$ {amount || '0,00'}
            </p>
          </div>

          {/* Avisos */}
          {!isValidAmount && requestedAmount > 0 && (
            <div className="p-4 bg-status-warning/10 border border-status-warning rounded-lg flex items-start gap-3">
              <AlertCircle className="text-status-warning flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-status-warning">Valor Mínimo</p>
                <p className="text-xs text-admin-text-secondary mt-1">
                  O valor mínimo para saque é R$ 50,00
                </p>
              </div>
            </div>
          )}

          {hasInsufficientBalance && (
            <div className="p-4 bg-status-error/10 border border-status-error rounded-lg flex items-start gap-3">
              <AlertCircle className="text-status-error flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-status-error">Saldo Insuficiente</p>
                <p className="text-xs text-admin-text-secondary mt-1">
                  O valor solicitado é maior que seu saldo disponível.
                </p>
              </div>
            </div>
          )}

          {canWithdraw && (
            <div className="p-4 bg-status-success/10 border border-status-success rounded-lg flex items-start gap-3">
              <CheckCircle className="text-status-success flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-status-success">Saque Disponível</p>
                <p className="text-xs text-admin-text-secondary mt-1">
                  Seu saque será processado em até 2 dias úteis.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-admin-gray-light space-y-3">
          {hasInsufficientBalance && availableBalance >= 50 && (
            <button
              onClick={onWithdrawAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#27E502] text-admin-black font-semibold rounded-lg hover:bg-[#1fc600] transition-colors"
            >
              <DollarSign size={20} />
              Sacar Tudo Disponível (R$ {formatCurrency(availableBalance)})
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-admin-gray-light text-admin-text-primary font-medium rounded-lg hover:bg-admin-gray-dark transition-colors"
            >
              Cancelar
            </button>
            
            {canWithdraw && (
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-[#27E502] text-admin-black font-semibold rounded-lg hover:bg-[#1fc600] transition-colors"
              >
                Confirmar Saque
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

