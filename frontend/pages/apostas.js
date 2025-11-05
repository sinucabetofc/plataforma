import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getUserBets } from '../utils/api';
import { withAuth } from '../contexts/AuthContext';
import { FullPageLoader } from '../components/Loader';
import { 
  TrendingUp, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Target,
  Calendar,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Página de Apostas - Histórico do Usuário
 * Protegida com withAuth HOC
 */
function Apostas() {
  const [statusFilter, setStatusFilter] = useState('all');

  // Buscar apostas do usuário
  const {
    data: betsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-bets'],
    queryFn: async () => {
      const result = await getUserBets();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message);
    },
    refetchInterval: 15000, // Atualiza a cada 15 segundos
  });

  const formatCurrency = (value) => {
    // Converter centavos para reais
    const valueInReais = (value || 0) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(valueInReais);
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

  const getStatusBadge = (status) => {
    switch (status) {
      // Status em português (do banco de dados)
      case 'pendente':
        return {
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50',
          icon: Clock,
          text: 'Pendente',
        };
      case 'aceita':
      case 'matched':
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-400/50',
          icon: CheckCircle,
          text: 'Casada',
        };
      case 'ganha':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-400/50',
          icon: Trophy,
          text: 'Ganhou',
        };
      case 'perdida':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-400/50',
          icon: XCircle,
          text: 'Perdeu',
        };
      case 'cancelada':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-400/50',
          icon: XCircle,
          text: 'Cancelado',
        };
      // Status em inglês (fallback)
      case 'pending':
        return {
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50',
          icon: Clock,
          text: 'Pendente',
        };
      case 'won':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-400/50',
          icon: Trophy,
          text: 'Ganhou',
        };
      case 'lost':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-400/50',
          icon: XCircle,
          text: 'Perdeu',
        };
      case 'cancelled':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-400/50',
          icon: XCircle,
          text: 'Cancelado',
        };
      default:
        return {
          color: 'bg-[#1a1a1a] text-texto-secundario border-cinza-borda',
          icon: AlertCircle,
          text: status,
        };
    }
  };

  if (isLoading) {
    return <FullPageLoader text="Carregando apostas..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="rounded-lg border border-sinuca-error/30 bg-sinuca-error/10 p-6 text-center">
          <p className="text-lg text-sinuca-error">
            Erro ao carregar apostas: {error.message}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-verde-neon px-6 py-2 text-white transition-all hover:bg-verde-claro"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const stats = betsData?.stats || {};
  const allBets = betsData?.bets || [];
  
  // Filtrar apostas
  const filteredBets = statusFilter === 'all' 
    ? allBets 
    : allBets.filter(bet => bet.status === statusFilter);

  return (
    <>
      <Head>
        <title>Minhas Apostas - SinucaBet</title>
        <meta
          name="description"
          content="Histórico completo das suas apostas no SinucaBet"
        />
      </Head>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-texto-principal">
              <TrendingUp className="text-verde-accent" size={36} />
              Minhas Apostas
            </h1>

            <button
              onClick={() => refetch()}
              className="rounded-lg bg-verde-neon px-5 py-2.5 text-base font-semibold text-black shadow-verde-soft transition-all hover:scale-105 hover:brightness-110"
            >
              Atualizar
            </button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-4 text-center">
              <p className="text-2xl font-bold text-verde-accent">
                {stats.total_bets || 0}
              </p>
              <p className="text-xs text-texto-secundario">Total de Apostas</p>
            </div>

            <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-4 text-center">
              <p className="text-2xl font-bold text-verde-neon">
                {stats.won || 0}
              </p>
              <p className="text-xs text-texto-secundario">Vitórias</p>
            </div>

            <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {stats.pending || 0}
              </p>
              <p className="text-xs text-texto-secundario">Pendentes</p>
            </div>

            <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-4 text-center">
              <p className="text-2xl font-bold text-texto-principal">
                {formatCurrency(stats.total_wagered || 0)}
              </p>
              <p className="text-xs text-texto-secundario">Total Apostado</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-verde-neon text-white'
                  : 'bg-[#1a1a1a] text-texto-secundario hover:bg-cinza-claro'
              }`}
            >
              Todas ({stats.total_bets || 0})
            </button>
            <button
              onClick={() => setStatusFilter('ganha')}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                statusFilter === 'ganha'
                  ? 'bg-green-500 text-white'
                  : 'bg-[#1a1a1a] text-texto-secundario hover:bg-cinza-claro'
              }`}
            >
              Vitórias ({stats.won || stats.ganha || 0})
            </button>
            <button
              onClick={() => setStatusFilter('pendente')}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                statusFilter === 'pendente'
                  ? 'bg-yellow-500 text-cinza-escuro'
                  : 'bg-[#1a1a1a] text-texto-secundario hover:bg-cinza-claro'
              }`}
            >
              Pendentes ({stats.pending || stats.pendente || 0})
            </button>
            <button
              onClick={() => setStatusFilter('aceita')}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                statusFilter === 'aceita'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#1a1a1a] text-texto-secundario hover:bg-cinza-claro'
              }`}
            >
              Casadas ({stats.matched || stats.aceita || 0})
            </button>
            <button
              onClick={() => setStatusFilter('perdida')}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                statusFilter === 'perdida'
                  ? 'bg-red-500 text-white'
                  : 'bg-[#1a1a1a] text-texto-secundario hover:bg-cinza-claro'
              }`}
            >
              Derrotas ({stats.lost || stats.perdida || 0})
            </button>
          </div>
        </div>

        {/* Lista de Apostas */}
        {filteredBets.length > 0 ? (
          <div className="space-y-4">
            {filteredBets.map((bet) => {
              const statusInfo = getStatusBadge(bet.status);
              const StatusIcon = statusInfo.icon;
              
              // Pegar informações da série e match
              const serie = bet.serie;
              const match = bet.match; // match está no mesmo nível que serie, não dentro
              const chosenPlayer = bet.chosen_player;

              return (
                <div
                  key={bet.id}
                  className="group rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] overflow-hidden transition-all hover:border-verde-neon hover:shadow-verde-soft"
                >
                  {/* Cabeçalho do Card */}
                  <div className="bg-[#0a0a0a] px-4 py-3 border-b border-cinza-borda">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Trophy size={14} className="text-verde-accent" />
                        <span className="text-xs font-semibold text-verde-neon">
                          Série {serie?.serie_number || '-'}
                        </span>
                        <span className="text-xs text-texto-desabilitado">•</span>
                        <span className="text-xs text-texto-secundario">
                          {match?.game_rules?.game_type || 'Sinuca'}
                        </span>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${statusInfo.color}`}>
                        <StatusIcon size={12} />
                        <span className="text-xs font-bold">{statusInfo.text}</span>
                      </div>
                    </div>
                    
                    {/* Data da aposta */}
                    <div className="flex items-center gap-1 mt-2">
                      <Clock size={10} className="text-texto-desabilitado" />
                      <span className="text-[10px] text-texto-desabilitado">
                        {getTimeAgo(bet.placed_at)}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo Principal */}
                  <div className="p-4">
                    {/* Matchup */}
                    <h3 className="mb-3 text-center text-lg font-bold text-texto-principal">
                      {match?.player1?.nickname || match?.player1?.name || 'Jogador 1'}
                      {' '}
                      <span className="text-texto-desabilitado">vs</span>
                      {' '}
                      {match?.player2?.nickname || match?.player2?.name || 'Jogador 2'}
                    </h3>

                    {/* Informações da Aposta */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Apostou em */}
                      <div className="bg-[#0a0a0a] rounded-lg p-3 border border-cinza-borda">
                        <div className="flex items-center gap-2 mb-1">
                          <Target size={14} className="text-verde-neon" />
                          <p className="text-[10px] text-texto-secundario uppercase">Apostou em</p>
                        </div>
                        <p className="text-sm font-bold text-verde-accent">
                          {chosenPlayer?.nickname || chosenPlayer?.name || 'Jogador'}
                        </p>
                      </div>

                      {/* Valor Apostado */}
                      <div className="bg-[#0a0a0a] rounded-lg p-3 border border-cinza-borda">
                        <p className="text-[10px] text-texto-secundario uppercase mb-1">Valor Apostado</p>
                        <p className="text-sm font-bold text-white">
                          {formatCurrency(bet.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Retornos (se aplicável) */}
                    {(bet.potential_return || bet.payout_amount > 0) && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {bet.potential_return && (
                          <div className="bg-green-900/10 rounded-lg p-3 border border-green-500/20">
                            <p className="text-[10px] text-green-400 uppercase mb-1">Retorno Possível</p>
                            <p className="text-sm font-bold text-green-400">
                              {formatCurrency(bet.potential_return)}
                            </p>
                          </div>
                        )}
                        {bet.payout_amount > 0 && (
                          <div className="bg-green-900/10 rounded-lg p-3 border border-green-500/20">
                            <p className="text-[10px] text-green-400 uppercase mb-1">Você Ganhou</p>
                            <p className="text-sm font-bold text-green-400">
                              {formatCurrency(bet.payout_amount)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Card */}
                  <div className="bg-[#0a0a0a] px-4 py-3 border-t border-cinza-borda">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-texto-secundario">Status da Série:</span>
                        <span
                          className={`text-xs font-semibold ${
                            serie?.status === 'liberada'
                              ? 'text-verde-claro'
                              : serie?.status === 'em_andamento'
                              ? 'text-yellow-400'
                              : serie?.status === 'encerrada'
                              ? 'text-red-400'
                              : 'text-texto-desabilitado'
                          }`}
                        >
                          {serie?.status === 'liberada' && '🟢 Liberada'}
                          {serie?.status === 'em_andamento' && '🟡 Em Andamento'}
                          {serie?.status === 'encerrada' && '🔴 Encerrada'}
                          {serie?.status === 'pendente' && '⏳ Pendente'}
                        </span>
                      </div>

                      {/* Link para a partida */}
                      {match?.id && (
                        <Link href={`/partidas/${match.id}`}>
                          <span className="text-xs font-semibold text-verde-accent hover:text-verde-neon transition-colors cursor-pointer">
                            Ver Partida →
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-12 text-center">
            <TrendingUp className="mx-auto mb-4 text-cinza-borda" size={64} />
            <h3 className="mb-2 text-xl font-bold text-texto-normal">
              {statusFilter === 'all' 
                ? 'Nenhuma aposta ainda' 
                : `Nenhuma aposta ${statusInfo === 'won' ? 'vencida' : statusFilter}`}
            </h3>
            <p className="mb-6 text-base text-texto-secundario">
              {statusFilter === 'all'
                ? 'Faça sua primeira aposta e acompanhe tudo aqui!'
                : 'Altere o filtro para ver outras apostas'}
            </p>
            <Link href="/games">
              <button className="rounded-lg bg-verde-neon px-6 py-3 font-bold text-cinza-escuro transition-all hover:scale-105 hover:shadow-verde-strong">
                Ver Jogos Disponíveis
              </button>
            </Link>
          </div>
        )}

        {/* Resumo Financeiro */}
        {stats.total_bets > 0 && (
          <div className="mt-8 rounded-xl border-2 border-verde-neon/30 bg-cinza-claro p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-verde-accent">
              <DollarSign size={24} />
              Resumo Financeiro
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-texto-secundario">Total Apostado</p>
                <p className="text-lg font-bold text-texto-principal">
                  {formatCurrency(stats.total_wagered || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-texto-secundario">Total Ganho</p>
                <p className="text-lg font-bold text-verde-neon">
                  {formatCurrency(stats.total_won || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-texto-secundario">Resultado Líquido</p>
                <p className={`text-lg font-bold ${
                  (stats.total_won - stats.total_wagered) >= 0 
                    ? 'text-verde-neon' 
                    : 'text-sinuca-error'
                }`}>
                  {formatCurrency((stats.total_won || 0) - (stats.total_wagered || 0))}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Proteger rota com autenticação
export default withAuth(Apostas);

