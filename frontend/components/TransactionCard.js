import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Clock,
  Check,
  X,
} from 'lucide-react';

/**
 * Componente TransactionCard - Card de transação da carteira
 */
export default function TransactionCard({ transaction }) {
  const {
    id,
    type,
    amount,
    fee,
    status,
    created_at,
    description,
  } = transaction;

  // Formatação de valores
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  // Formatação de data
  const formatDate = (date) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  // Definir ícone e cor baseado no tipo
  const getTransactionIcon = () => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle size={24} className="text-sinuca-success" />;
      case 'withdraw':
        return <ArrowUpCircle size={24} className="text-sinuca-warning" />;
      case 'bet':
        return <DollarSign size={24} className="text-blue-400" />;
      case 'bet_win':
        return <Check size={24} className="text-sinuca-success" />;
      case 'bet_refund':
        return <ArrowDownCircle size={24} className="text-gray-400" />;
      default:
        return <DollarSign size={24} className="text-gray-400" />;
    }
  };

  // Definir label do tipo
  const getTypeLabel = () => {
    const labels = {
      deposit: 'Depósito',
      withdraw: 'Saque',
      bet: 'Aposta',
      bet_win: 'Ganho de Aposta',
      bet_refund: 'Reembolso',
    };
    return labels[type] || type;
  };

  // Definir cor do status
  const getStatusBadge = () => {
    const badges = {
      pending: {
        bg: 'bg-yellow-600/20',
        text: 'text-yellow-600',
        icon: <Clock size={16} />,
        label: 'Pendente',
      },
      completed: {
        bg: 'bg-sinuca-success/20',
        text: 'text-sinuca-success',
        icon: <Check size={16} />,
        label: 'Concluído',
      },
      cancelled: {
        bg: 'bg-red-600/20',
        text: 'text-red-600',
        icon: <X size={16} />,
        label: 'Cancelado',
      },
      failed: {
        bg: 'bg-red-600/20',
        text: 'text-red-600',
        icon: <X size={16} />,
        label: 'Falhou',
      },
    };
    return badges[status] || badges.pending;
  };

  const statusBadge = getStatusBadge();

  // Determinar se é entrada ou saída
  const isIncoming = ['deposit', 'bet_win', 'bet_refund'].includes(type);
  const amountColor = isIncoming ? 'text-sinuca-success' : 'text-sinuca-warning';
  const amountSign = isIncoming ? '+' : '-';

  return (
    <div className="rounded-lg border border-sinuca-green-dark bg-gray-900 p-4 transition-all hover:border-sinuca-green">
      <div className="flex items-start justify-between gap-4">
        {/* Ícone e info */}
        <div className="flex flex-1 items-start gap-3">
          <div className="mt-1">{getTransactionIcon()}</div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-white md:text-lg">
              {getTypeLabel()}
            </h4>
            {description && (
              <p className="mt-1 text-sm text-gray-400">{description}</p>
            )}
            <p className="mt-2 text-xs text-gray-500 md:text-sm">
              {formatDate(created_at)}
            </p>
            {fee > 0 && (
              <p className="mt-1 text-xs text-sinuca-warning">
                Taxa: {formatCurrency(fee)}
              </p>
            )}
          </div>
        </div>

        {/* Valor e status */}
        <div className="flex flex-col items-end gap-2">
          <p className={`text-xl font-bold md:text-2xl ${amountColor}`}>
            {amountSign} {formatCurrency(Math.abs(amount))}
          </p>
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 ${statusBadge.bg} ${statusBadge.text}`}
          >
            {statusBadge.icon}
            <span className="text-xs font-medium md:text-sm">
              {statusBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* ID da transação */}
      <div className="mt-3 border-t border-sinuca-green-dark pt-2">
        <p className="text-xs text-gray-600">ID: {id}</p>
      </div>
    </div>
  );
}





