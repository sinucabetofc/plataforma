/**
 * ============================================================
 * Parceiros - Lista de Jogos
 * ============================================================
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useInfluencerMatches } from '../../../hooks/useInfluencerMatches';
import { Trophy, Calendar, Eye, Search } from 'lucide-react';
import Loader from '../../../components/admin/Loader';

export default function ParceirosJogos() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: matchesData, isLoading, error } = useInfluencerMatches({
    status: filterStatus === 'all' ? undefined : filterStatus,
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
          Meus Jogos
        </h1>
        <p className="text-admin-text-secondary">
          Gerencie e controle todos os seus jogos
        </p>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-col gap-4">
          {/* Search */}
            <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none" size={18} />
              <input
                type="text"
                placeholder="Buscar jogador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-admin-bg border border-admin-border rounded-lg text-admin-text-primary placeholder:text-admin-text-muted focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
              />
          </div>

          {/* Status Filter - Scroll horizontal no mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
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
        </div>
      </div>

      {/* Games List */}
      {error && (
        <div className="admin-card border-status-error">
          <p className="text-status-error">
            Erro ao carregar jogos: {error.message}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="py-12">
          <Loader size="lg" />
        </div>
      ) : matches.length === 0 ? (
        <div className="admin-card text-center py-12">
          <Trophy className="mx-auto mb-4 text-admin-text-muted" size={48} />
          <p className="text-admin-text-muted">Nenhum jogo encontrado</p>
        </div>
      ) : (
        <>
          {/* Versão Desktop - Tabela */}
          <div className="hidden md:block admin-card overflow-x-auto">
            <table className="admin-table w-full">
            <thead>
              <tr>
                  <th className="whitespace-nowrap">JOGADOR A</th>
                  <th className="whitespace-nowrap">JOGADOR B</th>
                  <th className="whitespace-nowrap">TIPO DE JOGO</th>
                  <th className="whitespace-nowrap">SÉRIES</th>
                  <th className="whitespace-nowrap">STATUS</th>
                  <th className="whitespace-nowrap">CRIADO EM</th>
                  <th className="whitespace-nowrap">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id}>
                  <td className="text-admin-text-primary font-medium">
                    {match.player1?.nickname || match.player1?.name || 'Jogador 1'}
                  </td>
                  <td className="text-admin-text-primary font-medium">
                    {match.player2?.nickname || match.player2?.name || 'Jogador 2'}
                  </td>
                  <td className="text-admin-text-secondary">
                    {match.game_rules?.game_type === 'LISA' ? 'Bolas Lisas' : 'Bolas Numeradas'}
                  </td>
                  <td className="text-admin-text-secondary text-center">
                    {match.total_series || 3}
                  </td>
                  <td className="text-center">
                    {getStatusBadge(match.status)}
                  </td>
                    <td className="text-admin-text-secondary whitespace-nowrap">
                    {new Date(match.scheduled_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => router.push(`/parceiros/jogos/${match.id}`)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#27E502] text-admin-black font-medium rounded-lg hover:bg-[#1fc600] transition-colors"
                    >
                      <Eye size={16} />
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Versão Mobile - Cards */}
          <div className="md:hidden space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="admin-card hover:border-admin-primary transition-colors"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(match.status)}
                  <button
                    onClick={() => router.push(`/parceiros/jogos/${match.id}`)}
                    className="text-[#27E502] text-sm font-semibold flex items-center gap-1 hover:underline"
                  >
                    Ver detalhes
                    <Eye size={14} />
                  </button>
                </div>

                {/* Jogadores */}
                <div className="mb-3">
                  <p className="text-xs text-admin-text-muted uppercase mb-1">Jogadores</p>
                  <p className="text-admin-text-primary font-semibold">
                    {match.player1?.nickname || match.player1?.name || 'Jogador 1'}
                    <span className="text-admin-text-muted mx-2">vs</span>
                    {match.player2?.nickname || match.player2?.name || 'Jogador 2'}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-admin-text-muted mb-1">Tipo de Jogo</p>
                    <p className="text-admin-text-secondary">
                      {match.game_rules?.game_type === 'LISA' ? 'Bolas Lisas' : 'Bolas Numeradas'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-admin-text-muted mb-1">Séries</p>
                    <p className="text-admin-text-secondary">{match.total_series || 3}</p>
                  </div>
                </div>

                {/* Data e Hora */}
                <div className="mt-3 pt-3 border-t border-admin-border">
                  <div className="flex items-center gap-2 text-xs text-admin-text-muted">
                    <Calendar size={14} />
                    <span>
                      {new Date(match.scheduled_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

