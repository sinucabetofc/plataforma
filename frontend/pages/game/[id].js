import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getGame, createBet, getWallet } from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import { FullPageLoader } from '../../components/Loader';
import BetButton from '../../components/BetButton';
import {
  Trophy,
  Users,
  ArrowLeft,
  Clock,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

/**
 * Página Game - Detalhes e Apostas (PÚBLICA, mas aposta requer login)
 */
export default function GameDetail() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const authenticated = isAuthenticated();

  // Buscar dados do jogo
  const {
    data: gameData,
    isLoading: gameLoading,
    error: gameError,
    refetch: refetchGame,
  } = useQuery({
    queryKey: ['game', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await getGame(id);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message);
    },
    enabled: !!id,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Buscar saldo do usuário (apenas se autenticado)
  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const result = await getWallet();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message);
    },
    enabled: authenticated,
  });

  // Mutation para criar aposta
  const betMutation = useMutation({
    mutationFn: async (betData) => {
      const result = await createBet(betData);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidar queries para atualizar dados
      queryClient.invalidateQueries(['game', id]);
      queryClient.invalidateQueries(['wallet']);
    },
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  if (gameLoading || !gameData) {
    return <FullPageLoader text="Carregando jogo..." />;
  }

  if (gameError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="rounded-lg border border-sinuca-error/30 bg-sinuca-error/10 p-6 text-center">
          <p className="text-lg text-sinuca-error">
            Erro ao carregar jogo: {gameError.message}
          </p>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => refetchGame()}
              className="rounded-lg bg-sinuca-green px-6 py-2 text-white transition-all hover:bg-sinuca-green-light"
            >
              Tentar novamente
            </button>
            <Link href="/games">
              <button className="rounded-lg border border-sinuca-green bg-transparent px-6 py-2 text-sinuca-green transition-all hover:bg-sinuca-green hover:text-white">
                Voltar aos jogos
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const game = gameData.game;
  const canBet = authenticated && game.status === 'open' && walletData?.available_balance > 0;

  // Status do jogo
  const statusColors = {
    open: 'bg-sinuca-green text-white',
    in_progress: 'bg-yellow-600 text-white',
    finished: 'bg-gray-600 text-white',
    cancelled: 'bg-red-600 text-white',
  };

  const statusLabels = {
    open: 'Aberto para Apostas',
    in_progress: 'Em Andamento',
    finished: 'Finalizado',
    cancelled: 'Cancelado',
  };

  return (
    <>
      <Head>
        <title>{`${game.player_a_name} vs ${game.player_b_name} - SinucaBet`}</title>
      </Head>

      <div className="mx-auto max-w-6xl">
        {/* Botão voltar */}
        <Link href="/games">
          <button className="mb-6 flex items-center gap-2 text-gray-400 transition-colors hover:text-sinuca-green">
            <ArrowLeft size={20} />
            Voltar aos jogos
          </button>
        </Link>

        {/* Header do jogo */}
        <div className="mb-8 rounded-lg border border-sinuca-green bg-gray-900 p-8 shadow-xl">
          {/* Status e ID */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <span
              className={`rounded-full px-4 py-2 text-base font-medium ${
                statusColors[game.status] || statusColors.open
              }`}
            >
              {statusLabels[game.status] || 'Aberto'}
            </span>
            <span className="text-gray-400">ID: #{game.id}</span>
          </div>

          {/* Players */}
          <div className="mb-6 flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Player A */}
            <div className="flex-1 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <Users size={28} className="text-sinuca-green" />
                <h2 className="text-3xl font-bold text-white">
                  {game.player_a_name}
                </h2>
              </div>
              {game.player_a_advantage > 0 && (
                <div className="mb-2 flex items-center justify-center gap-1">
                  <TrendingUp size={18} className="text-sinuca-success" />
                  <p className="text-base font-medium text-sinuca-success">
                    Vantagem: {game.player_a_advantage}
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-gray-800 p-4">
                <p className="text-sm text-gray-400">Total apostado</p>
                <p className="text-2xl font-bold text-sinuca-success">
                  {formatCurrency(game.player_a_total_bets)}
                </p>
              </div>
            </div>

            {/* VS */}
            <div className="flex-shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-sinuca-green bg-gray-800">
                <span className="text-2xl font-bold text-sinuca-green">VS</span>
              </div>
            </div>

            {/* Player B */}
            <div className="flex-1 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <h2 className="text-3xl font-bold text-white">
                  {game.player_b_name}
                </h2>
                <Users size={28} className="text-sinuca-green" />
              </div>
              {game.player_b_advantage > 0 && (
                <div className="mb-2 flex items-center justify-center gap-1">
                  <TrendingUp size={18} className="text-sinuca-success" />
                  <p className="text-base font-medium text-sinuca-success">
                    Vantagem: {game.player_b_advantage}
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-gray-800 p-4">
                <p className="text-sm text-gray-400">Total apostado</p>
                <p className="text-2xl font-bold text-sinuca-success">
                  {formatCurrency(game.player_b_total_bets)}
                </p>
              </div>
            </div>
          </div>

          {/* Detalhes do jogo */}
          <div className="flex flex-wrap items-center justify-center gap-6 border-t border-sinuca-green-dark pt-6">
            <div className="flex items-center gap-2 text-center">
              <Trophy className="text-sinuca-green" size={24} />
              <div className="text-left">
                <p className="text-sm text-gray-400">Modalidade</p>
                <p className="text-lg font-semibold text-white">
                  {game.modality}
                </p>
              </div>
            </div>

            <div className="h-12 w-px bg-sinuca-green-dark" />

            <div className="flex items-center gap-2 text-center">
              <Clock className="text-sinuca-green" size={24} />
              <div className="text-left">
                <p className="text-sm text-gray-400">Séries</p>
                <p className="text-lg font-semibold text-white">{game.series}</p>
              </div>
            </div>

            <div className="h-12 w-px bg-sinuca-green-dark" />

            <div className="flex items-center gap-2 text-center">
              <DollarSign className="text-sinuca-green" size={24} />
              <div className="text-left">
                <p className="text-sm text-gray-400">Total em Jogo</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(
                    game.player_a_total_bets + game.player_b_total_bets
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo disponível */}
        {authenticated && walletData && (
          <div className="mb-6 rounded-lg border border-cinza-borda bg-[#1a1a1a] p-4">
            <div className="flex items-center justify-between">
              <span className="text-texto-secundario">Seu saldo disponível:</span>
              <span className="text-2xl font-bold text-verde-neon">
                {formatCurrency(walletData.available_balance)}
              </span>
            </div>
          </div>
        )}

        {/* Botões de aposta ou CTA para login */}
        {!authenticated ? (
          <div className="rounded-xl border-2 border-verde-neon bg-[#1a1a1a] p-8 text-center">
            <p className="mb-4 text-xl font-medium text-texto-principal">
              Faça login para apostar neste jogo
            </p>
            <p className="mb-6 text-sm text-texto-secundario">
              Crie sua conta ou entre agora para começar a apostar!
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:justify-center">
              <button 
                onClick={() => router.push('/')}
                className="w-full rounded-lg bg-verde-neon px-8 py-3 text-lg font-bold text-black transition-all hover:brightness-110 md:w-auto"
              >
                Ir para Home
              </button>
            </div>
          </div>
        ) : canBet ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <BetButton
              gameId={game.id}
              playerId="A"
              playerName={game.player_a_name}
              onBetPlaced={betMutation.mutateAsync}
            />
            <BetButton
              gameId={game.id}
              playerId="B"
              playerName={game.player_b_name}
              onBetPlaced={betMutation.mutateAsync}
            />
          </div>
        ) : game.status !== 'open' ? (
          <div className="rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-6 text-center">
            <p className="text-lg font-medium text-yellow-600">
              Este jogo não está mais aberto para apostas
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-sinuca-error/30 bg-sinuca-error/10 p-6 text-center">
            <p className="text-lg font-medium text-sinuca-error">
              Saldo insuficiente para apostar
            </p>
            <Link href="/wallet">
              <button className="mt-4 rounded-lg bg-verde-neon px-6 py-2 text-white transition-all hover:bg-verde-claro">
                Adicionar saldo
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

