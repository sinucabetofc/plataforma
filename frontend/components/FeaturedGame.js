import Link from 'next/link';
import { Users, Trophy, Target, TrendingUp } from 'lucide-react';
import LiveBadge from './LiveBadge';

/**
 * Componente FeaturedGame - Jogo em destaque (Hero Section)
 */
export default function FeaturedGame({ game }) {
  if (!game) return null;

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
    timer, // tempo de jogo (ex: "45:23")
  } = game;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const totalBets = player_a_total_bets + player_b_total_bets;

  return (
    <Link href={`/game/${id}`}>
      <div className="group cursor-pointer rounded-2xl border-2 border-verde-neon bg-[#1a1a1a] shadow-verde-medium transition-all duration-300 hover:scale-[1.02] hover:border-verde-neon hover:shadow-verde-strong">
        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Header - Status e Timer */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <LiveBadge size="lg" />
            {timer && (
              <div className="flex items-center gap-2 rounded-lg bg-cinza-claro px-4 py-2 font-mono text-2xl font-bold text-verde-neon shadow-verde-glow">
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-verde-neon"></span>
                {timer}
              </div>
            )}
          </div>

          {/* Players */}
          <div className="mb-6 grid grid-cols-3 items-center gap-4">
            {/* Player A */}
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-verde-neon shadow-verde-glow transition-all group-hover:scale-110 group-hover:shadow-verde-neon md:h-20 md:w-20">
                  <Users size={32} className="text-white" />
                </div>
              </div>
              <h3 className="mb-1 text-lg font-bold text-texto-principal md:text-xl">
                {player_a_name}
              </h3>
              {player_a_advantage > 0 && (
                <div className="flex items-center justify-center gap-1 text-verde-accent">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">+{player_a_advantage}</span>
                </div>
              )}
            </div>

            {/* VS */}
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border-4 border-verde-neon bg-cinza-escuro text-3xl font-bold text-verde-neon shadow-verde-neon animate-glow-pulse md:h-20 md:w-20">
                VS
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-cinza-claro px-3 py-1">
                <Trophy size={14} className="text-verde-accent" />
                <span className="text-xs font-medium text-texto-secundario">
                  {modality}
                </span>
              </div>
            </div>

            {/* Player B */}
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-verde-neon shadow-verde-glow transition-all group-hover:scale-110 group-hover:shadow-verde-neon md:h-20 md:w-20">
                  <Users size={32} className="text-white" />
                </div>
              </div>
              <h3 className="mb-1 text-lg font-bold text-texto-principal md:text-xl">
                {player_b_name}
              </h3>
              {player_b_advantage > 0 && (
                <div className="flex items-center justify-center gap-1 text-verde-accent">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">+{player_b_advantage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info do Jogo */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-4 rounded-lg bg-cinza-claro p-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-verde-accent" size={18} />
              <span className="text-sm text-texto-secundario">Séries:</span>
              <span className="font-semibold text-texto-principal">{series}</span>
            </div>
            <div className="h-6 w-px bg-cinza-borda"></div>
            <div className="flex items-center gap-2">
              <Target className="text-verde-accent" size={18} />
              <span className="text-sm text-texto-secundario">Total:</span>
              <span className="font-semibold text-verde-neon">
                {formatCurrency(totalBets)}
              </span>
            </div>
          </div>

          {/* Apostas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Apostas em Player A */}
            <div className="rounded-lg bg-cinza-claro border border-verde-neon/30 p-4 transition-all hover:scale-105 hover:border-verde-neon">
              <p className="mb-2 text-sm text-texto-secundario">
                Apostas em {player_a_name}
              </p>
              <p className="text-2xl font-bold text-verde-neon">
                {formatCurrency(player_a_total_bets)}
              </p>
            </div>

            {/* Apostas em Player B */}
            <div className="rounded-lg bg-cinza-claro border border-verde-neon/30 p-4 transition-all hover:scale-105 hover:border-verde-neon">
              <p className="mb-2 text-sm text-texto-secundario">
                Apostas em {player_b_name}
              </p>
              <p className="text-2xl font-bold text-verde-neon">
                {formatCurrency(player_b_total_bets)}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 font-medium text-verde-accent transition-colors group-hover:text-verde-neon">
              Clique para apostar
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

