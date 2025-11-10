/**
 * ============================================================
 * Parceiros Dashboard - Dashboard do Painel de Parceiros
 * ============================================================
 * Segue EXATAMENTE o padrão do Admin Dashboard
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useInfluencerDashboard, useInfluencerMatches } from '../../hooks/useInfluencerMatches';
import { Trophy, DollarSign, TrendingUp, Calendar, Eye } from 'lucide-react';
import CardInfo from '../../components/admin/CardInfo';
import Loader from '../../components/admin/Loader';

export default function ParceirosDashboard() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useInfluencerDashboard();
  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useInfluencerMatches({
    status: filterStatus === 'all' ? undefined : filterStatus,
    limit: 10
  });

  const stats = dashboardData?.stats || {};
  const matches = matchesData?.data || [];

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

  if (dashboardLoading) {
    return (
      <div className="py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
          Dashboard
        </h1>
        <p className="text-admin-text-secondary">
          Bem-vindo ao seu painel de parceiro
        </p>
      </div>

      {/* Stats Cards - Usando CardInfo do admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardInfo
          title="Total de Jogos"
          value={stats.total_matches || 0}
          icon={<Trophy size={24} />}
          trend={`${stats.completed_matches || 0} finalizados`}
        />

        <CardInfo
          title="Jogos Ativos"
          value={stats.active_matches || 0}
          icon={<TrendingUp size={24} />}
          trend="Em andamento"
          className="border-status-success"
        />

        <CardInfo
          title="Comissões Totais"
          value={stats.total_commissions || 0}
          isCurrency
          icon={<DollarSign size={24} />}
          trend="Acumulado"
          className="border-status-warning"
        />

        <CardInfo
          title="Pendentes"
          value={stats.pending_commissions || 0}
          isCurrency
          icon={<DollarSign size={24} />}
          trend="Aguardando pagamento"
          className="border-status-info"
        />
      </div>

      {/* Error Messages */}
      {dashboardError && (
        <div className="admin-card border-status-error">
          <p className="text-status-error">
            Erro ao carregar estatísticas: {dashboardError.message}
          </p>
        </div>
      )}

      {matchesError && (
        <div className="admin-card border-status-error">
          <p className="text-status-error">
            Erro ao carregar jogos: {matchesError.message}
          </p>
        </div>
      )}

      {/* Matches Section */}
      <div className="admin-card">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-admin-text-primary">Meus Jogos</h3>
            <button
              onClick={() => router.push('/parceiros/jogos')}
              className="text-sm text-[#27E502] hover:text-[#27E502]/80 whitespace-nowrap flex-shrink-0"
            >
              Ver todos →
            </button>
          </div>
        </div>

        {/* Filters - Scroll horizontal no mobile */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap flex-shrink-0 ${
                filterStatus === 'all'
                  ? 'bg-[#27E502] text-white'
                  : 'bg-admin-bg text-admin-text-secondary hover:bg-admin-border'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('agendada')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap flex-shrink-0 ${
                filterStatus === 'agendada'
                  ? 'bg-[#27E502] text-white'
                  : 'bg-admin-bg text-admin-text-secondary hover:bg-admin-border'
              }`}
            >
              Agendados
            </button>
            <button
              onClick={() => setFilterStatus('em_andamento')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap flex-shrink-0 ${
                filterStatus === 'em_andamento'
                  ? 'bg-[#27E502] text-white'
                  : 'bg-admin-bg text-admin-text-secondary hover:bg-admin-border'
              }`}
            >
              Ao Vivo
            </button>
            <button
              onClick={() => setFilterStatus('finalizada')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap flex-shrink-0 ${
                filterStatus === 'finalizada'
                  ? 'bg-[#27E502] text-white'
                  : 'bg-admin-bg text-admin-text-secondary hover:bg-admin-border'
              }`}
            >
              Finalizados
            </button>
        </div>

        {/* Matches List */}
        <div className="space-y-3">
          {matchesLoading ? (
            <div className="py-8 text-center">
              <Loader size="md" />
            </div>
          ) : matches.length === 0 ? (
            <div className="py-8 text-center text-admin-text-muted">
              Nenhum jogo encontrado
            </div>
          ) : (
            matches.map((match) => (
              <div
                key={match.id}
                className="admin-card hover:border-[#27E502] cursor-pointer"
                onClick={() => router.push(`/parceiros/jogos/${match.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  {getStatusBadge(match.status)}
                  <button className="flex items-center text-sm text-[#27E502] hover:text-[#27E502]/80">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver detalhes
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Players */}
                  <div>
                    <p className="text-xs text-admin-text-muted mb-1">Jogadores</p>
                    <div className="text-admin-text-primary text-sm">
                      <div className="font-medium">
                        {match.player1?.nickname || match.player1?.name || 'Jogador 1'}
                      </div>
                      <div className="text-admin-text-muted my-1 text-xs">vs</div>
                      <div className="font-medium">
                        {match.player2?.nickname || match.player2?.name || 'Jogador 2'}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs text-admin-text-muted mb-1">Data e Hora</p>
                    <div className="flex items-center text-admin-text-primary">
                      <Calendar className="h-4 w-4 mr-2 text-admin-text-muted" />
                      <span className="text-sm">
                        {new Date(match.scheduled_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  {(match.status === 'em_andamento' || match.status === 'finalizada') && (
                    <div>
                      <p className="text-xs text-admin-text-muted mb-1">Placar</p>
                      <div className="text-2xl font-bold text-[#27E502]">
                        {match.player1_score || 0} - {match.player2_score || 0}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

