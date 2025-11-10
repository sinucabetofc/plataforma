/**
 * ============================================================
 * Parceiros - Detalhes do Jogo
 * ============================================================
 */

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import GameControlPanel from '../../../components/parceiros/GameControlPanel';
import BetsHistory from '../../../components/parceiros/BetsHistory';
import Loader from '../../../components/admin/Loader';
import { 
  useInfluencerMatch,
  useStartMatch,
  useUpdateScore,
  useStartSeries,
  useEnableBetting
} from '../../../hooks/useInfluencerMatches';
import { Calendar, MapPin, Youtube, ArrowLeft } from 'lucide-react';

export default function ParceirosGameDetails() {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading, error, refetch } = useInfluencerMatch(id);
  
  // Auto-refresh a cada 5 segundos para manter dados atualizados
  useEffect(() => {
    if (!id) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 5000); // Atualiza a cada 5 segundos
    
    return () => clearInterval(interval);
  }, [id, refetch]);
  const startMatchMutation = useStartMatch();
  const updateScoreMutation = useUpdateScore();
  const startSeriesMutation = useStartSeries();
  const enableBettingMutation = useEnableBetting();

  const match = data?.match;
  const bets = data?.bets || [];
  const series = match?.series || [];

  const handleAction = async (action, payload) => {
    try {
      switch (action) {
        case 'start-match':
          await startMatchMutation.mutateAsync(id);
          toast.success('Partida iniciada com sucesso!', {
            duration: 3000,
            position: 'top-center'
          });
          await refetch();
          break;

        case 'update-score':
          await updateScoreMutation.mutateAsync({
            matchId: id,
            ...payload
          });
          toast.success('Placar atualizado com sucesso!', {
            duration: 3000,
            position: 'top-center',
            icon: '🎯'
          });
          await refetch();
          break;

        case 'start-series':
          await startSeriesMutation.mutateAsync(payload.seriesId);
          toast.success('Série iniciada com sucesso!', {
            duration: 3000,
            position: 'top-center'
          });
          await refetch();
          break;

        case 'enable-betting':
          await enableBettingMutation.mutateAsync(payload.seriesId);
          toast.success('Apostas liberadas!', {
            duration: 2000,
            position: 'top-center',
            icon: '💰'
          });
          await refetch();
          break;

        default:
          console.log('Ação desconhecida:', action);
      }
    } catch (error) {
      console.error('Erro na ação:', error);
      toast.error(error.response?.data?.message || 'Erro ao executar ação', {
        duration: 4000,
        position: 'top-center'
      });
    }
  };

  const isActionLoading = 
    startMatchMutation.isLoading || 
    updateScoreMutation.isLoading ||
    startSeriesMutation.isLoading ||
    enableBettingMutation.isLoading;

  const getStatusBadge = (status) => {
    const badges = {
      agendada: { className: 'status-badge-info', label: 'Agendada' },
      em_andamento: { className: 'status-badge-success', label: 'Em Andamento' },
      finalizada: { className: 'status-badge-default', label: 'Finalizada' },
      cancelada: { className: 'status-badge-error', label: 'Cancelada' }
    };

    const badge = badges[status] || badges.agendada;

    return (
      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card border-status-error">
        <p className="text-status-error font-semibold mb-2">Erro ao carregar jogo</p>
        <p className="text-sm text-admin-text-secondary">{error.message}</p>
        <button
          onClick={() => router.push('/parceiros/dashboard')}
          className="mt-4 admin-btn-secondary"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="admin-card text-center">
        <p className="text-admin-text-muted">Jogo não encontrado</p>
        <button
          onClick={() => router.push('/parceiros/dashboard')}
          className="mt-4 admin-btn-secondary"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/parceiros/jogos')}
            className="flex items-center text-admin-text-secondary hover:text-[#27E502] mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Jogos
          </button>
          <h1 className="text-3xl font-bold text-admin-text-primary">Detalhes do Jogo</h1>
        </div>
        {getStatusBadge(match.status)}
      </div>

      {/* Match Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player 1 Card */}
        <div className="admin-card text-center">
          <p className="text-xs uppercase text-admin-text-muted mb-3 tracking-wider">Jogador 1</p>
          {match.player1?.photo_url ? (
            <img
              src={match.player1.photo_url}
              alt={match.player1.name}
              className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-[#27E502]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-admin-gray-dark mx-auto mb-3 flex items-center justify-center">
              <span className="text-2xl font-bold text-admin-text-muted">
                {match.player1?.name?.charAt(0).toUpperCase() || 'J1'}
              </span>
            </div>
          )}
          <h3 className="text-xl font-bold text-admin-text-primary mb-1">
            {match.player1?.nickname || match.player1?.name || 'Jogador 1'}
          </h3>
          {(match.status === 'em_andamento' || match.status === 'finalizada') && (
            <p className="text-5xl font-bold text-[#27E502] mt-4">
              {match.player1_score || 0}
            </p>
          )}
        </div>

        {/* VS Card */}
        <div className="admin-card flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl font-bold text-admin-text-muted mb-2">VS</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center text-admin-text-secondary">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(match.scheduled_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {match.location && (
                <div className="flex items-center justify-center text-admin-text-secondary">
                  <MapPin className="h-4 w-4 mr-2" />
                  {match.location}
                </div>
              )}
              {match.game_rules?.game_type && (
                <div className="text-admin-text-secondary">
                  {match.game_rules.game_type === 'LISA' ? 'Bolas Lisas' : 'Bolas Numeradas'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player 2 Card */}
        <div className="admin-card text-center">
          <p className="text-xs uppercase text-admin-text-muted mb-3 tracking-wider">Jogador 2</p>
          {match.player2?.photo_url ? (
            <img
              src={match.player2.photo_url}
              alt={match.player2.name}
              className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-[#27E502]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-admin-gray-dark mx-auto mb-3 flex items-center justify-center">
              <span className="text-2xl font-bold text-admin-text-muted">
                {match.player2?.name?.charAt(0).toUpperCase() || 'J2'}
              </span>
            </div>
          )}
          <h3 className="text-xl font-bold text-admin-text-primary mb-1">
            {match.player2?.nickname || match.player2?.name || 'Jogador 2'}
          </h3>
          {(match.status === 'em_andamento' || match.status === 'finalizada') && (
            <p className="text-5xl font-bold text-[#27E502] mt-4">
              {match.player2_score || 0}
            </p>
          )}
        </div>
      </div>

      {/* YouTube Link */}
      {match.youtube_url && (
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-admin-text-primary mb-1">
                Transmissão ao Vivo
              </h3>
              <p className="text-sm text-admin-text-secondary">
                Assista este jogo no YouTube
              </p>
            </div>
            <a
              href={match.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <Youtube size={20} />
              Assistir Live
            </a>
          </div>
        </div>
      )}

      {/* Game Controls and Bets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Game Controls */}
        <div className="lg:col-span-1">
          <GameControlPanel
            match={match}
            series={series}
            onAction={handleAction}
            isLoading={isActionLoading}
          />
        </div>

        {/* Right Column - Bets History */}
        <div className="lg:col-span-2">
          <BetsHistory match={match} bets={bets} />
        </div>
      </div>
    </div>
  );
}

