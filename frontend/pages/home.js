'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Loader, { FullPageLoader } from '../components/Loader';
import MatchCard from '../components/partidas/MatchCard';
import { Trophy, Zap, TrendingUp, Clock, Users, Target, Calendar, CheckCircle, Play } from 'lucide-react';

/**
 * Página Home/Inicio - Dashboard Principal Interativo
 * Mostra: Partidas Ao Vivo, Resultados Recentes e Apostas do Usuário
 */
export default function Home() {
  const router = useRouter();
  const { authenticated } = useAuth();

  // Buscar todas as partidas
  const {
    data: matchesData,
    isLoading: matchesLoading,
    error: matchesError,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: ['home-matches'],
    queryFn: async () => {
      const result = await api.matches.getAll({ limit: 50 });
      return result;
    },
    enabled: typeof window !== 'undefined', // Só executa no cliente
    refetchInterval: 10000, // Atualiza a cada 10s
  });

  // Buscar apostas do usuário (apenas se autenticado)
  const {
    data: userBetsData,
    isLoading: betsLoading,
    refetch: refetchBets,
  } = useQuery({
    queryKey: ['user-bets'],
    queryFn: async () => {
      if (!authenticated) return { bets: [], stats: {} };
      try {
        const result = await api.bets.getUserBets({ limit: 10 });
        console.log('User Bets Result:', result); // Debug
        return result || { bets: [], stats: {} };
      } catch (error) {
        console.error('Erro ao buscar apostas:', error);
        return { bets: [], stats: {} };
      }
    },
    enabled: authenticated,
    refetchInterval: 15000, // Atualiza a cada 15s
  });

  // Buscar séries finalizadas para "Últimos Resultados"
  const {
    data: finishedSeriesData,
    isLoading: seriesLoading,
    refetch: refetchSeries,
  } = useQuery({
    queryKey: ['finished-series'],
    queryFn: async () => {
      try {
        const result = await api.series.getFinished({ limit: 5 });
        return result || [];
      } catch (error) {
        console.error('Erro ao buscar séries finalizadas:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Atualiza a cada 30s
  });

  const isLoading = matchesLoading;

  if (isLoading) {
    return <FullPageLoader text="Carregando partidas..." />;
  }

  if (matchesError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="rounded-lg border border-sinuca-error/30 bg-sinuca-error/10 p-6 text-center">
          <p className="text-lg text-sinuca-error">
            Erro ao carregar partidas
          </p>
          <button
            onClick={() => refetchMatches()}
            className="mt-4 rounded-lg bg-verde-neon px-6 py-2 font-semibold text-black transition-all hover:brightness-110"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const matches = matchesData?.matches || [];
  
  // Filtrar partidas por status (status vem do backend como 'em_andamento', 'agendada', 'finalizada')
  const liveMatches = matches.filter((m) => m.status === 'em_andamento' || m.status === 'ao_vivo' || m.status === 'live');
  
  // Ordenar partidas agendadas por data/hora (mais próximas primeiro)
  const scheduledMatches = matches
    .filter((m) => m.status === 'agendada' || m.status === 'scheduled')
    .sort((a, b) => {
      const dateA = new Date(a.scheduled_at || a.match_date);
      const dateB = new Date(b.scheduled_at || b.match_date);
      return dateA - dateB; // Ordem crescente (mais próximas primeiro)
    });
  
  const finishedMatches = matches
    .filter((m) => m.status === 'finalizada' || m.status === 'finished')
    .sort((a, b) => {
      const dateA = new Date(a.scheduled_at || a.match_date);
      const dateB = new Date(b.scheduled_at || b.match_date);
      return dateB - dateA; // Ordem decrescente (mais recentes primeiro)
    })
    .slice(0, 5);
  
  // Partidas a exibir: PRIORIDADE para ao vivo, depois próximas agendadas
  // Se houver ao vivo, mostra ao vivo + algumas agendadas
  // Se não houver ao vivo, mostra só as agendadas
  const displayMatches = liveMatches.length > 0 
    ? [...liveMatches, ...scheduledMatches.slice(0, Math.max(0, 6 - liveMatches.length))]
    : scheduledMatches.slice(0, 6);

  const userBets = userBetsData?.bets || [];

  // Ordenar apostas por prioridade: Casadas → Ganhas → Pendentes → Perdas
  const sortedUserBets = [...userBets].sort((a, b) => {
    const priorityOrder = {
      'aceita': 1,
      'matched': 1,
      'ganha': 2,
      'won': 2,
      'pendente': 3,
      'pending': 3,
      'perdida': 4,
      'lost': 4,
      'cancelada': 5,
      'cancelled': 5
    };
    
    const priorityA = priorityOrder[a.status] || 999;
    const priorityB = priorityOrder[b.status] || 999;
    
    // Se mesma prioridade, ordenar por data (mais recentes primeiro)
    if (priorityA === priorityB) {
      return new Date(b.placed_at) - new Date(a.placed_at);
    }
    
    return priorityA - priorityB;
  });

  return (
    <>
      <Head>
        <title>SinucaBet - Início</title>
        <meta
          name="description"
          content="Acompanhe partidas ao vivo, resultados e suas apostas no SinucaBet!"
        />
      </Head>

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header com Título */}
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-texto-principal">
            <Trophy className="text-verde-neon" size={36} />
            Início
          </h1>

          <button
            onClick={() => {
              refetchMatches();
              if (authenticated) refetchBets();
            }}
            className="rounded-lg bg-verde-neon px-5 py-2.5 text-base font-semibold text-black shadow-lg transition-all hover:scale-105 hover:brightness-110"
          >
            <Clock size={18} className="mr-2 inline" />
            Atualizar
          </button>
        </div>

        {/* Estatísticas de Apostas - Simplificado */}
        {authenticated && (
          <div className="grid grid-cols-3 gap-4">
            {/* Apostas Casadas */}
            <div className="rounded-xl border-2 border-blue-500/30 bg-[#1a1a1a] p-5 text-center transition-all hover:scale-105 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="mb-2 flex justify-center">
                <CheckCircle className="text-blue-400" size={28} />
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {userBets.filter(bet => bet.status === 'aceita' || bet.status === 'matched').length}
              </p>
              <p className="text-sm text-texto-secundario">Casadas</p>
            </div>

            {/* Apostas Ganhas */}
            <div className="rounded-xl border-2 border-green-500/30 bg-[#1a1a1a] p-5 text-center transition-all hover:scale-105 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20">
              <div className="mb-2 flex justify-center">
                <Trophy className="text-green-400" size={28} />
              </div>
              <p className="text-3xl font-bold text-green-400">
                {userBets.filter(bet => bet.status === 'ganha' || bet.status === 'won').length}
              </p>
              <p className="text-sm text-texto-secundario">Ganhas</p>
            </div>

            {/* Apostas Pendentes */}
            <div className="rounded-xl border-2 border-yellow-500/30 bg-[#1a1a1a] p-5 text-center transition-all hover:scale-105 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20">
              <div className="mb-2 flex justify-center">
                <Clock className="text-yellow-400" size={28} />
              </div>
              <p className="text-3xl font-bold text-yellow-400">
                {userBets.filter(bet => bet.status === 'pendente' || bet.status === 'pending').length}
              </p>
              <p className="text-sm text-texto-secundario">Pendentes</p>
            </div>
          </div>
        )}
        
        {!authenticated && (
          <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-8 text-center">
            <p className="text-lg text-texto-secundario">Faça login para ver suas apostas</p>
          </div>
        )}

        {/* Seção Principal: Partidas Ao Vivo ou Todas as Partidas */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {liveMatches.length > 0 ? (
                <>
                  <div className="relative">
                    <Zap className="text-verde-neon" size={28} />
                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verde-neon opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-verde-neon"></span>
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-texto-principal">
                    Partidas Rolando
                  </h2>
                  <span className="rounded-full bg-verde-neon/20 px-3 py-1 text-sm font-bold text-verde-neon">
                    {liveMatches.length}
                  </span>
                </>
              ) : (
                <>
                  <Calendar className="text-verde-accent" size={28} />
                  <h2 className="text-2xl font-bold text-texto-principal">
                    Próximas Partidas
                  </h2>
                </>
              )}
            </div>
            <Link href="/partidas">
              <span className="cursor-pointer text-sm font-semibold text-verde-accent transition-all hover:text-verde-neon">
                Ver todas →
              </span>
            </Link>
          </div>

          {displayMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {displayMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-12 text-center">
              <Calendar className="mx-auto mb-4 text-cinza-borda" size={48} />
              <p className="text-lg font-semibold text-texto-normal">
                Nenhuma partida disponível
              </p>
              <p className="mt-2 text-sm text-texto-secundario">
                Aguarde novas partidas serem agendadas
              </p>
            </div>
          )}
        </div>

        {/* Grid: Últimos Resultados e Apostas do Usuário */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Últimos Resultados - Séries Finalizadas */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-400" size={28} />
              <h2 className="text-2xl font-bold text-texto-principal">
                Últimos Resultados
              </h2>
            </div>

            {finishedSeriesData && finishedSeriesData.length > 0 ? (
              <div className="space-y-4">
                {finishedSeriesData.map((serie) => (
                  <div
                    key={serie.id}
                    className="cursor-pointer rounded-xl border-2 border-green-500/30 bg-[#1a1a1a] p-4 transition-all hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20"
                    onClick={() => router.push(`/partidas/${serie.match_id}`)}
                  >
                    {/* Cabeçalho */}
                    <div className="mb-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="text-green-400" size={16} />
                          <span className="text-xs font-semibold text-green-400">
                            Série {serie.serie_number}
                          </span>
                          <span className="text-xs text-texto-desabilitado">•</span>
                          <span className="text-xs text-texto-secundario">
                            {serie.match?.game_rules?.game_type || 'Sinuca'}
                          </span>
                        </div>
                        <span className="rounded-full bg-green-400/20 px-2 py-0.5 text-[10px] font-bold text-green-400 uppercase">
                          Finalizada
                        </span>
                      </div>
                      
                      {/* Data e Horário */}
                      <div className="flex items-center gap-2 text-xs text-texto-desabilitado">
                        <Clock size={12} />
                        <span>
                          {new Date(serie.updated_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                          {' às '}
                          {new Date(serie.updated_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Placar */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex-1 text-center">
                        <p className="text-sm font-semibold text-texto-normal">
                          {serie.match?.player1?.nickname || serie.match?.player1?.name || 'Jogador 1'}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          {serie.player1_score || 0}
                        </p>
                      </div>

                      <div className="mx-4 text-xl font-bold text-texto-secundario">×</div>

                      <div className="flex-1 text-center">
                        <p className="text-sm font-semibold text-texto-normal">
                          {serie.match?.player2?.nickname || serie.match?.player2?.name || 'Jogador 2'}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          {serie.player2_score || 0}
                        </p>
                      </div>
                    </div>

                    {/* Vencedor */}
                    {serie.winner && (
                      <div className="border-t border-cinza-borda pt-2 text-center">
                        <p className="text-xs text-texto-secundario">Vencedor</p>
                        <p className="text-sm font-bold text-green-400">
                          🏆 {serie.winner.nickname || serie.winner.name}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-8 text-center">
                <CheckCircle className="mx-auto mb-3 text-cinza-borda" size={40} />
                <p className="text-base text-texto-normal">
                  Nenhuma série finalizada ainda
                </p>
              </div>
            )}
          </div>

          {/* Minhas Apostas (se autenticado) */}
          {authenticated && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="text-yellow-400" size={28} />
                <h2 className="text-2xl font-bold text-texto-principal">
                  Minhas Apostas
                </h2>
              </div>

              {sortedUserBets.length > 0 ? (
                <div className="space-y-4">
                  {sortedUserBets.slice(0, 5).map((bet) => (
                    <div
                      key={bet.id}
                      className="cursor-pointer rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-4 transition-all hover:border-yellow-400 hover:shadow-lg"
                      onClick={() => router.push('/apostas')}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          bet.status === 'ganha' 
                            ? 'bg-green-400/20 text-green-400'
                            : bet.status === 'perdida'
                            ? 'bg-red-400/20 text-red-400'
                            : bet.status === 'aceita'
                            ? 'bg-blue-400/20 text-blue-400'
                            : 'bg-yellow-400/20 text-yellow-400'
                        }`}>
                          {bet.status === 'ganha' ? '✓ GANHOU' : bet.status === 'perdida' ? '✗ PERDEU' : bet.status === 'aceita' ? '✓ CASADA' : '⏳ PENDENTE'}
                        </span>
                        <span className="text-sm font-bold text-white">
                          R$ {(bet.amount / 100).toFixed(2)}
                        </span>
                      </div>

                      <p className="text-sm text-texto-normal">
                        Apostou em: <span className="font-semibold text-verde-neon">
                          {bet.chosen_player?.nickname || bet.chosen_player?.name || 'Jogador'}
                        </span>
                      </p>
                      
                      {bet.match && (
                        <p className="text-xs text-texto-secundario mt-1">
                          {bet.match.player1?.nickname || bet.match.player1?.name} vs {bet.match.player2?.nickname || bet.match.player2?.name}
                        </p>
                      )}
                      
                      {bet.potential_return && (
                        <p className="mt-1 text-xs text-texto-secundario">
                          Retorno potencial: R$ {(bet.potential_return / 100).toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-8 text-center">
                  <TrendingUp className="mx-auto mb-3 text-cinza-borda" size={40} />
                  <p className="text-base text-texto-normal">
                    Você ainda não fez apostas
                  </p>
                  <Link href="/partidas">
                    <button className="mt-4 rounded-lg bg-verde-neon px-6 py-2 font-semibold text-black transition-all hover:brightness-110">
                      Fazer primeira aposta
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Banner Informativo */}
        <div className="rounded-xl border-2 border-verde-neon/30 bg-gradient-to-r from-verde-neon/10 to-verde-accent/10 p-6 backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-verde-neon/20 p-3">
              <Trophy className="text-verde-neon" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-bold text-verde-neon">
                Como Apostar no SinucaBet?
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-start gap-2">
                  <span className="mt-1 text-verde-accent">1.</span>
                  <p className="text-sm text-texto-normal">
                    Escolha uma partida ao vivo ou agendada
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 text-verde-accent">2.</span>
                  <p className="text-sm text-texto-normal">
                    Selecione o jogador que você acha que vai vencer
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 text-verde-accent">3.</span>
                  <p className="text-sm text-texto-normal">
                    Defina o valor da sua aposta (mínimo R$ 10)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 text-verde-accent">4.</span>
                  <p className="text-sm text-texto-normal">
                    Acompanhe ao vivo e torça pelo seu jogador!
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-verde-neon/30 bg-verde-neon/5 p-3">
                <p className="text-center text-sm font-semibold text-verde-neon">
                  ⚡ Atualização automática a cada 10 segundos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


