/**
 * ============================================================
 * Página: /admin/games/[id] - Detalhes da Partida (Admin)
 * ============================================================
 */

import { useRouter } from 'next/router';
import { useMatch, useUpdateMatchStatus } from '../../../hooks/admin/useMatches';
import MatchInfoCard from '../../../components/admin/MatchInfoCard';
import SeriesManager from '../../../components/admin/SeriesManager';
import LiveScoreManager from '../../../components/admin/LiveScoreManager';
import LiveBetsPanel from '../../../components/admin/LiveBetsPanel';
import Loader from '../../../components/admin/Loader';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GameDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: match, isLoading, error, refetch } = useMatch(id);
  const updateStatus = useUpdateMatchStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Erro ao carregar partida
          </h2>
          <p className="text-gray-400 mb-6">{error?.message || 'Partida não encontrada'}</p>
          <Link href="/admin/games">
            <button className="btn btn-primary">
              <ArrowLeft className="mr-2" size={20} />
              Voltar para Jogos
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Buscar série em andamento
  const serieEmAndamento = match.series?.find(s => s.status === 'em_andamento');

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center justify-between">
        <Link href="/admin/games">
          <button className="btn btn-ghost flex items-center gap-2">
            <ArrowLeft size={20} />
            Voltar para Jogos
          </button>
        </Link>
      </div>

      {/* Informações da Partida */}
      <MatchInfoCard match={match} onUpdate={refetch} />

      {/* Grid com 2 colunas em telas grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gerenciador de Séries */}
        <SeriesManager matchId={id} match={match} />

        {/* Painel de Apostas Ao Vivo */}
        <LiveBetsPanel matchId={id} match={match} />
      </div>

      {/* Gerenciador de Placar (quando houver série em andamento) */}
      {serieEmAndamento && (
        <LiveScoreManager serie={serieEmAndamento} match={match} />
      )}
    </div>
  );
}




