import Link from 'next/link';
import { Users, Trophy, Target, TrendingUp } from 'lucide-react';
import LiveBadge, { LiveDot } from './LiveBadge';

/**
 * Componente GameCard - Card de jogo com informações resumidas (Redesign Verde Elegante)
 */
export default function GameCard({ game }) {
  const {
    id,
    player_a_name,
    player_b_name,
    modality,
    series,
    player_a_advantage,
    player_b_advantage,
    player_a_total_bets,
    player_b_total_bets,
    status,
  } = game;

  // Formatação de valores
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const isLive = status === 'in_progress';
  const isOpen = status === 'open';

  return (
    <Link href={`/game/${id}`}>
      <div className="group cursor-pointer rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-5 shadow-verde-soft transition-all duration-300 hover:scale-[1.02] hover:border-verde-neon hover:shadow-verde-medium md:p-6">
        {/* Status e ID */}
        <div className="mb-4 flex items-center justify-between">
          {isLive ? (
            <LiveBadge size="sm" />
          ) : isOpen ? (
            <div className="flex items-center gap-1.5 rounded-full bg-verde-medio px-3 py-1 text-sm font-semibold text-verde-accent">
              <span className="h-2 w-2 rounded-full bg-verde-accent"></span>
              Aberto
            </div>
          ) : (
            <div className="rounded-full bg-cinza-claro px-3 py-1 text-sm font-medium text-texto-secundario">
              {status === 'finished' ? 'Finalizado' : 'Cancelado'}
            </div>
          )}
          <span className="text-sm text-texto-secundario">#{id}</span>
        </div>

        {/* Players */}
        <div className="mb-4 flex items-center justify-between gap-2">
          {/* Player A */}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-verde-neon shadow-verde-glow">
                <Users size={18} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-texto-principal md:text-lg">
                {player_a_name}
              </h3>
            </div>
            {player_a_advantage > 0 && (
              <div className="ml-12 flex items-center gap-1 text-verde-accent">
                <TrendingUp size={14} />
                <span className="text-sm font-medium">+{player_a_advantage}</span>
              </div>
            )}
          </div>

          {/* VS */}
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-verde-neon bg-cinza-escuro text-lg font-bold text-verde-neon shadow-verde-glow">
              VS
            </div>
          </div>

          {/* Player B */}
          <div className="flex-1 text-right">
            <div className="mb-2 flex items-center justify-end gap-2">
              <h3 className="text-base font-semibold text-texto-principal md:text-lg">
                {player_b_name}
              </h3>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-verde-neon shadow-verde-glow">
                <Users size={18} className="text-white" />
              </div>
            </div>
            {player_b_advantage > 0 && (
              <div className="mr-12 flex items-center justify-end gap-1 text-verde-accent">
                <span className="text-sm font-medium">+{player_b_advantage}</span>
                <TrendingUp size={14} />
              </div>
            )}
          </div>
        </div>

        {/* Detalhes do jogo */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3 rounded-lg bg-cinza-claro p-3">
          <div className="flex items-center gap-1.5">
            <Trophy className="text-verde-accent" size={16} />
            <span className="text-sm text-texto-secundario">{modality}</span>
          </div>
          <div className="h-4 w-px bg-cinza-borda" />
          <div className="flex items-center gap-1.5">
            <Target className="text-verde-accent" size={16} />
            <span className="text-sm text-texto-secundario">Séries: {series}</span>
          </div>
        </div>

        {/* Total apostado */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-cinza-claro border border-verde-neon/30 p-3 text-center transition-all hover:scale-105 hover:border-verde-neon">
            <p className="mb-1 text-xs text-texto-secundario">Apostas em {player_a_name}</p>
            <p className="text-base font-bold text-verde-neon md:text-lg">
              {formatCurrency(player_a_total_bets)}
            </p>
          </div>

          <div className="rounded-lg bg-cinza-claro border border-verde-neon/30 p-3 text-center transition-all hover:scale-105 hover:border-verde-neon">
            <p className="mb-1 text-xs text-texto-secundario">Apostas em {player_b_name}</p>
            <p className="text-base font-bold text-verde-neon md:text-lg">
              {formatCurrency(player_b_total_bets)}
            </p>
          </div>
        </div>

        {/* Call to action */}
        {(status === 'open' || isLive) && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-verde-accent transition-colors group-hover:text-verde-neon">
              {isLive ? 'Assistir e apostar' : 'Clique para apostar'}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

