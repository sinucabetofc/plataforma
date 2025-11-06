import { Clock, Trophy, TrendingUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Componente RecentBetCard - Card para exibir aposta recente
 */
export default function RecentBetCard({ bet }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (error) {
      return 'Agora mesmo';
    }
  };

  const getPlayerName = (side) => {
    return side === 'player_a' ? bet.game?.player_a : bet.game?.player_b;
  };

  const getBetStatusColor = (status) => {
    switch (status) {
      case 'matched':
        return 'text-verde-accent bg-verde-medio/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'won':
        return 'text-verde-neon bg-verde-neon/20';
      case 'lost':
        return 'text-cinza-claro bg-cinza-claro/20';
      default:
        return 'text-texto-secundario bg-[#1a1a1a]/20';
    }
  };

  const getBetStatusText = (status) => {
    switch (status) {
      case 'matched':
        return 'Casada';
      case 'pending':
        return 'Pendente';
      case 'won':
        return 'Vitória';
      case 'lost':
        return 'Derrota';
      default:
        return status;
    }
  };

  return (
    <div className="group rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-4 transition-all hover:border-verde-neon hover:shadow-verde-soft">
      <div className="flex items-start justify-between">
        {/* Informações principais */}
        <div className="flex-1">
          {/* Usuário e Tempo */}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cinza-claro">
              <User size={16} className="text-verde-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-texto-principal">
                {bet.user?.name || 'Anônimo'}
              </p>
              <div className="flex items-center gap-1 text-xs text-texto-secundario">
                <Clock size={12} />
                <span>{getTimeAgo(bet.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Jogo */}
          <div className="mb-2 rounded-lg bg-cinza-claro/50 p-3">
            <div className="mb-1 flex items-center gap-1 text-xs text-texto-secundario">
              <Trophy size={12} />
              <span>{bet.game?.modality || 'Sinuca'}</span>
            </div>
            <p className="text-sm font-medium text-texto-normal">
              {bet.game?.player_a} vs {bet.game?.player_b}
            </p>
          </div>

          {/* Aposta */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <TrendingUp size={16} className="text-verde-accent" />
              <span className="text-sm font-medium text-texto-normal">
                Apostou em:{' '}
                <span className="font-bold text-verde-accent">
                  {getPlayerName(bet.side)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Valor e Status */}
        <div className="ml-4 flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-lg font-bold text-verde-neon">
              {formatCurrency(bet.amount)}
            </p>
            {bet.potential_return && (
              <p className="text-xs text-texto-secundario">
                Retorno: {formatCurrency(bet.potential_return)}
              </p>
            )}
          </div>

          {/* Status badge */}
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getBetStatusColor(
              bet.status
            )}`}
          >
            {getBetStatusText(bet.status)}
          </span>
        </div>
      </div>

      {/* Indicador de status do jogo */}
      {bet.game?.status && (
        <div className="mt-3 flex items-center justify-between border-t border-cinza-borda pt-2">
          <span className="text-xs text-texto-secundario">Status do Jogo</span>
          <span
            className={`text-xs font-semibold ${
              bet.game.status === 'open'
                ? 'text-verde-claro'
                : bet.game.status === 'in_progress'
                ? 'text-yellow-400'
                : 'text-cinza-claro'
            }`}
          >
            {bet.game.status === 'open' && 'Aberto'}
            {bet.game.status === 'in_progress' && 'Em Andamento'}
            {bet.game.status === 'finished' && 'Finalizado'}
            {bet.game.status === 'cancelled' && 'Cancelado'}
          </span>
        </div>
      )}
    </div>
  );
}





