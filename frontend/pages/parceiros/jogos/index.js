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
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none z-10" size={20} />
              <input
                type="text"
                placeholder="Buscar jogador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input pl-11"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                filterStatus === 'all'
                  ? 'bg-[#27E502] text-white'
                  : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('agendada')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                filterStatus === 'agendada'
                  ? 'bg-[#27E502] text-white'
                  : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
              }`}
            >
              Agendados
            </button>
            <button
              onClick={() => setFilterStatus('em_andamento')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                filterStatus === 'em_andamento'
                  ? 'bg-[#27E502] text-white'
                  : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
              }`}
            >
              Ao Vivo
            </button>
            <button
              onClick={() => setFilterStatus('finalizada')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                filterStatus === 'finalizada'
                  ? 'bg-[#27E502] text-white'
                  : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
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
        <div className="admin-card overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>JOGADOR A</th>
                <th>JOGADOR B</th>
                <th>TIPO DE JOGO</th>
                <th>SÉRIES</th>
                <th>STATUS</th>
                <th>CRIADO EM</th>
                <th>AÇÕES</th>
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
                  <td className="text-admin-text-secondary">
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
      )}
    </div>
  );
}

