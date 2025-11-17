import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Clock,
  Check,
  X,
  Trophy,
  Target,
  TrendingUp,
} from 'lucide-react';

/**
 * Componente TransactionCard - Card de transação da carteira (UX Melhorado)
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
    metadata,
    balance_before,
    balance_after,
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

  // Lógica de exibição baseada nas regras do usuário
  const getTransactionConfig = () => {
    // GANHO (win, ganho)
    if (type === 'ganho' || type === 'win' || type === 'bet_win') {
      return {
        icon: <Trophy size={20} className="text-verde-neon" />,
        typeLabel: 'Ganho',
        amountPrefix: '+',
        amountColor: 'text-verde-neon',
        borderColor: 'border-verde-neon/30',
        bgGradient: 'bg-gradient-to-r from-verde-neon/5 to-transparent',
      };
    }

    // DEPÓSITO PENDENTE (sem + ou -, amarelo)
    if ((type === 'deposito' || type === 'deposit') && status === 'pending') {
      return {
        icon: <ArrowDownCircle size={20} className="text-yellow-500" />,
        typeLabel: 'Depósito',
        amountPrefix: '', // SEM SINAL
        amountColor: 'text-yellow-500',
        borderColor: 'border-yellow-500/30',
        bgGradient: 'bg-gradient-to-r from-yellow-500/5 to-transparent',
      };
    }

    // DEPÓSITO CONCLUÍDO (+ verde)
    if ((type === 'deposito' || type === 'deposit') && status === 'completed') {
      return {
        icon: <ArrowDownCircle size={20} className="text-verde-neon" />,
        typeLabel: 'Depósito',
        amountPrefix: '+',
        amountColor: 'text-verde-neon',
        borderColor: 'border-verde-neon/30',
        bgGradient: 'bg-gradient-to-r from-verde-neon/5 to-transparent',
      };
    }

    // APOSTA CASADA (azul, "Casada")
    if ((type === 'aposta' || type === 'bet') && (status === 'aceita' || status === 'matched' || metadata?.bet_status === 'aceita')) {
      return {
        icon: <Target size={20} className="text-blue-400" />,
        typeLabel: 'Casada',
        amountPrefix: '-',
        amountColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgGradient: 'bg-gradient-to-r from-blue-500/5 to-transparent',
      };
    }

    // PERDA (vermelho, -)
    if ((type === 'aposta' || type === 'bet') && (status === 'perdida' || status === 'lost' || metadata?.bet_status === 'perdida')) {
      return {
        icon: <X size={20} className="text-red-500" />,
        typeLabel: 'Perdeu',
        amountPrefix: '-',
        amountColor: 'text-red-500',
        borderColor: 'border-red-500/30',
        bgGradient: 'bg-gradient-to-r from-red-500/5 to-transparent',
      };
    }

    // APOSTA CANCELADA (vermelho)
    if ((type === 'aposta' || type === 'bet') && (status === 'cancelada' || status === 'cancelled')) {
      return {
        icon: <X size={20} className="text-red-500" />,
        typeLabel: 'Cancelada',
        amountPrefix: '',
        amountColor: 'text-red-500',
        borderColor: 'border-red-500/30',
        bgGradient: 'bg-gradient-to-r from-red-500/5 to-transparent',
      };
    }

    // APOSTA CONCLUÍDA mas não resolvida ainda (aguardando resultado)
    if ((type === 'aposta' || type === 'bet') && status === 'completed') {
      return {
        icon: <Target size={20} className="text-blue-400" />,
        typeLabel: 'Aguardando Resultado',
        amountPrefix: '-',
        amountColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgGradient: 'bg-gradient-to-r from-blue-500/5 to-transparent',
      };
    }

    // APOSTA PENDENTE (amarelo, aguardando emparceiramento)
    if ((type === 'aposta' || type === 'bet') && (status === 'pending' || status === 'pendente')) {
      return {
        icon: <Clock size={20} className="text-yellow-500" />,
        typeLabel: 'Aposta',
        amountPrefix: '-',
        amountColor: 'text-yellow-500',
        borderColor: 'border-yellow-500/30',
        bgGradient: 'bg-gradient-to-r from-yellow-500/5 to-transparent',
      };
    }

    // SAQUE
    if (type === 'saque' || type === 'withdraw') {
      // Se foi aprovado/pago, mostra em verde
      if (status === 'completed') {
        return {
          icon: <ArrowUpCircle size={20} className="text-verde-neon" />,
          typeLabel: 'Saque',
          amountPrefix: '-',
          amountColor: 'text-verde-neon',
          borderColor: 'border-verde-neon/30',
          bgGradient: 'bg-gradient-to-r from-verde-neon/5 to-transparent',
        };
      }
      // Se está pendente ou rejeitado, mostra em vermelho/amarelo
      return {
        icon: <ArrowUpCircle size={20} className="text-red-400" />,
        typeLabel: 'Saque',
        amountPrefix: '-',
        amountColor: 'text-red-400',
        borderColor: 'border-red-400/30',
        bgGradient: 'bg-gradient-to-r from-red-400/5 to-transparent',
      };
    }

    // REEMBOLSO (roxo, +)
    if (type === 'reembolso' || type === 'refund') {
      return {
        icon: <TrendingUp size={20} className="text-purple-400" />,
        typeLabel: 'Reembolso',
        amountPrefix: '+',
        amountColor: 'text-purple-400',
        borderColor: 'border-purple-400/30',
        bgGradient: 'bg-gradient-to-r from-purple-400/5 to-transparent',
      };
    }

    // DEFAULT (cinza)
    return {
      icon: <DollarSign size={20} className="text-gray-400" />,
      typeLabel: type,
      amountPrefix: '',
      amountColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      bgGradient: 'bg-gradient-to-r from-gray-700/5 to-transparent',
    };
  };

  // Definir badge de status (considerando o tipo da transação)
  const getStatusBadge = () => {
    // Para APOSTAS com status completed, mostrar "Aguardando" em azul
    if ((type === 'aposta' || type === 'bet') && status === 'completed') {
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/40',
        icon: <Clock size={14} />,
        label: 'Aguardando',
      };
    }

    // Para SAQUES com status completed, mostrar "Pago" em verde
    if ((type === 'saque' || type === 'withdraw') && status === 'completed') {
      return {
        bg: 'bg-verde-neon/20',
        text: 'text-verde-neon',
        border: 'border-verde-neon/40',
        icon: <Check size={14} />,
        label: 'Pago',
      };
    }

    const badges = {
      pending: {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-500',
        border: 'border-yellow-500/40',
        icon: <Clock size={14} />,
        label: 'Pendente',
      },
      completed: {
        bg: 'bg-verde-neon/20',
        text: 'text-verde-neon',
        border: 'border-verde-neon/40',
        icon: <Check size={14} />,
        label: 'Concluída',
      },
      aceita: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/40',
        icon: <Check size={14} />,
        label: 'Casada',
      },
      matched: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/40',
        icon: <Check size={14} />,
        label: 'Casada',
      },
      pendente: {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-500',
        border: 'border-yellow-500/40',
        icon: <Clock size={14} />,
        label: 'Aguardando',
      },
      perdida: {
        bg: 'bg-red-500/20',
        text: 'text-red-500',
        border: 'border-red-500/40',
        icon: <X size={14} />,
        label: 'Perdeu',
      },
      lost: {
        bg: 'bg-red-500/20',
        text: 'text-red-500',
        border: 'border-red-500/40',
        icon: <X size={14} />,
        label: 'Perdeu',
      },
      cancelled: {
        bg: 'bg-red-500/20',
        text: 'text-red-500',
        border: 'border-red-500/40',
        icon: <X size={14} />,
        label: 'Cancelada',
      },
      cancelada: {
        bg: 'bg-red-500/20',
        text: 'text-red-500',
        border: 'border-red-500/40',
        icon: <X size={14} />,
        label: 'Cancelada',
      },
      failed: {
        bg: 'bg-red-500/20',
        text: 'text-red-500',
        border: 'border-red-500/40',
        icon: <X size={14} />,
        label: 'Falhou',
      },
    };
    return badges[status] || badges.pending;
  };

  const config = getTransactionConfig();
  const statusBadge = getStatusBadge();

  return (
    <div className={`rounded-xl border-2 ${config.borderColor} ${config.bgGradient} bg-[#1a1a1a] overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg`}>
      {/* Conteúdo Principal */}
      <div className="p-4">
      <div className="flex items-start justify-between gap-4">
          {/* Ícone e Informações */}
        <div className="flex flex-1 items-start gap-3">
            <div className="mt-1 flex-shrink-0">{config.icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-white mb-1">
                {config.typeLabel}
            </h4>
            {description && (
                <p className="text-sm text-texto-secundario mb-2">
                  {description}
                </p>
              )}
              {/* Mostrar série/jogo para reembolsos */}
              {(type === 'reembolso' || type === 'refund') && metadata?.serie_id && (
                <p className="text-xs text-purple-400 mb-1">
                  📍 Série {metadata.serie_number || metadata.serie_id}
                </p>
            )}
              <p className="text-xs text-texto-desabilitado">
              {formatDate(created_at)}
              </p>
          </div>
        </div>

          {/* Valor e Status */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Valor */}
            <p className={`text-2xl font-bold ${config.amountColor}`}>
              {config.amountPrefix && <span>{config.amountPrefix} </span>}
              {formatCurrency(Math.abs(amount))}
          </p>
            
            {/* Badge de Status */}
            <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
            {statusBadge.icon}
              <span className="text-xs font-semibold">
              {statusBadge.label}
            </span>
          </div>
        </div>
      </div>

        {/* Taxa e Saldo (se houver) */}
        {(fee > 0 || balance_after !== null) && (
          <div className="mt-3 pt-3 border-t border-cinza-borda space-y-1">
            {fee > 0 && (
              <p className="text-xs text-yellow-500">
                💰 Taxa: {formatCurrency(fee)}
              </p>
            )}
            {balance_after !== null && (
              <p className="text-xs text-texto-secundario">
                💵 Saldo após: <span className="font-semibold text-verde-neon">{formatCurrency(balance_after)}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ID da Transação */}
      <div className="px-4 py-2 bg-[#0a0a0a] border-t border-cinza-borda">
        <p className="text-[10px] text-texto-desabilitado truncate">
          ID: {id}
        </p>
      </div>
    </div>
  );
}






