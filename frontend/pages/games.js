import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { getGames } from '../utils/api';
import SEO from '../components/SEO';
import Loader, { FullPageLoader } from '../components/Loader';
import GameCard from '../components/GameCard';
import FeaturedGame from '../components/FeaturedGame';
import { Trophy, Search, Zap, TrendingUp } from 'lucide-react';

/**
 * Página Index - Home com Jogos (PÚBLICA - sem requireAuth)
 * Mostra jogos para todos, mas só permite apostar se estiver logado
 */
export default function Home() {
  const router = useRouter();

  // Buscar jogos
  const {
    data: gamesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const result = await getGames();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message);
    },
    refetchInterval: 10000, // Refetch a cada 10 segundos
  });

  if (isLoading) {
    return <FullPageLoader text="Carregando jogos..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="rounded-lg border border-sinuca-error/30 bg-sinuca-error/10 p-6 text-center">
          <p className="text-lg text-sinuca-error">
            Erro ao carregar jogos: {error.message}
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

  const openGames = gamesData?.games?.filter((game) => game.status === 'open') || [];
  const inProgressGames =
    gamesData?.games?.filter((game) => game.status === 'in_progress') || [];
  
  // Jogo em destaque (primeiro jogo ao vivo, ou primeiro aberto)
  const featuredGame = inProgressGames[0] || openGames[0];

  return (
    <>
      <SEO
        title="Jogos Disponíveis"
        description="Aposte em partidas de sinuca ao vivo. Confira os jogos disponíveis, acompanhe partidas em andamento e faça suas apostas agora na SinucaBet!"
        keywords="jogos sinuca, apostas sinuca, sinuca ao vivo, partidas sinuca, apostar sinuca, sinuca bet, jogos disponíveis"
      />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-texto-principal">
            <Trophy className="text-verde-accent" size={36} />
            Jogos Disponíveis
          </h1>

          <button
            onClick={() => refetch()}
            className="rounded-lg bg-verde-neon px-5 py-2.5 text-base font-semibold text-black shadow-verde-soft transition-all hover:scale-105 hover:brightness-110"
          >
            Atualizar
          </button>
        </div>

        {/* Featured Game (Hero) */}
        {featuredGame && (
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="text-verde-neon" size={24} />
              <h2 className="text-2xl font-bold text-texto-principal">
                Jogo em Destaque
              </h2>
            </div>
            <FeaturedGame game={featuredGame} />
          </div>
        )}

        {/* Estatísticas */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-5 text-center transition-all hover:scale-105 hover:border-verde-neon">
            <p className="text-3xl font-bold text-verde-accent">
              {gamesData?.games?.length || 0}
            </p>
            <p className="text-sm text-texto-secundario">Total de Jogos</p>
          </div>
          <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-5 text-center transition-all hover:scale-105 hover:border-verde-neon">
            <p className="text-3xl font-bold text-verde-claro">
              {openGames.length}
            </p>
            <p className="text-sm text-texto-secundario">Jogos Abertos</p>
          </div>
          <div className="rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-5 text-center transition-all hover:scale-105 hover:border-verde-neon">
            <p className="text-3xl font-bold text-verde-neon">
              {inProgressGames.length}
            </p>
            <p className="text-sm text-texto-secundario">Em Andamento</p>
          </div>
        </div>

        {/* Jogos Abertos */}
        {openGames.length > 0 ? (
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="text-verde-accent" size={28} />
              <h2 className="text-2xl font-bold text-texto-principal">
                Jogos Abertos para Apostas
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {openGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12 rounded-xl border-2 border-cinza-borda bg-[#1a1a1a] p-8 text-center">
            <Search className="mx-auto mb-4 text-cinza-borda" size={48} />
            <p className="text-xl text-texto-normal">
              Nenhum jogo aberto no momento
            </p>
            <p className="mt-2 text-base text-texto-secundario">
              Novos jogos serão adicionados em breve
            </p>
          </div>
        )}

        {/* Jogos Em Andamento */}
        {inProgressGames.length > 0 && (
          <div>
            <div className="mb-6 flex items-center gap-2">
              <Zap className="text-verde-neon" size={28} />
              <h2 className="text-2xl font-bold text-texto-principal">
                Jogos Em Andamento
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {inProgressGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-12 rounded-xl border-2 border-verde-neon/30 bg-cinza-claro p-6 shadow-verde-soft">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-verde-accent">
            <Trophy size={24} />
            Como funciona?
          </h3>
          <ul className="space-y-3 text-texto-normal">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-verde-accent"></span>
              <span>Escolha um jogo aberto e clique para ver detalhes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-verde-accent"></span>
              <span>
                Selecione em qual jogador deseja apostar (A ou B)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-verde-accent"></span>
              <span>Escolha o valor da aposta (múltiplos de R$ 10)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-verde-accent"></span>
              <span>
                Suas apostas são casadas com outros apostadores do lado oposto
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-verde-accent"></span>
              <span>
                Se seu jogador vencer, você recebe o dobro da aposta
              </span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
