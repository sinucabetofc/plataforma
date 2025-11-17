/**
 * ============================================================
 * Games Page - Página de Jogos/Partidas
 * ============================================================
 */

import { useState } from 'react';
import { useMatches, useCreateMatch, useDeleteMatch } from '../../hooks/admin/useMatches';
import useAdminStore from '../../store/adminStore';
import Table from '../../components/admin/Table';
import StatusBadge from '../../components/admin/StatusBadge';
import GameForm from '../../components/admin/GameForm';
import { formatDate } from '../../utils/formatters';
import { Trophy, Plus, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function Games() {
  const { filters, setMatchesFilters } = useAdminStore();
  const matchesFilters = filters.matches;
  
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useMatches(matchesFilters);
  const createMatch = useCreateMatch();
  const deleteMatch = useDeleteMatch();

  const handleCreateMatch = async (formData) => {
    await createMatch.mutateAsync(formData);
    setShowForm(false);
  };

  const handleDelete = async (match) => {
    if (!confirm(`Deletar partida ${match.player_a?.name} vs ${match.player_b?.name}?\n\nIsso removerá todas as séries e apostas associadas.`)) {
      return;
    }

    try {
      await deleteMatch.mutateAsync(match.id);
    } catch (error) {
      alert('Erro ao deletar partida: ' + error.message);
    }
  };

  const columns = [
    {
      key: 'player_a',
      label: 'Jogador A',
      render: (player) => player?.name,
    },
    {
      key: 'player_b',
      label: 'Jogador B',
      render: (player) => player?.name,
    },
    {
      key: 'game_rules',
      label: 'Tipo de Jogo',
      render: (game_rules) => {
        const gameType = game_rules?.game_type;
        if (gameType === 'LISA') return 'Bolas Lisas';
        if (gameType === 'NUMERADA') return 'Bolas Numeradas';
        if (gameType === 'BOLINHO') return 'Bolinho';
        return '-';
      },
    },
    {
      key: 'total_series',
      label: 'Séries',
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (value) => formatDate(value, 'dd/MM/yyyy HH:mm'),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/admin/games/${row.id}`}>
            <button
              className="btn btn-primary btn-sm px-3 py-1 text-xs flex items-center gap-1"
              title="Ver Detalhes"
            >
              <Eye size={14} />
              Detalhes
            </button>
          </Link>
          
          {(row.status === 'agendada' || row.status === 'open') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="btn btn-danger btn-sm px-3 py-1 text-xs flex items-center gap-1"
              disabled={deleteMatch.isPending}
              title="Deletar Partida"
            >
              <Trash2 size={14} />
              Excluir
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
            Jogos
          </h1>
          <p className="text-admin-text-secondary">
            Gerenciar partidas e jogos
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Novo Jogo
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-admin-text-secondary mb-2">
              Status
            </label>
            <select
              className="select"
              value={matchesFilters.status || ''}
              onChange={(e) => setMatchesFilters({ status: e.target.value || null, page: 1 })}
            >
              <option value="">Todos</option>
              <option value="open">Aberto</option>
              <option value="in_progress">Em Andamento</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <Table
          columns={columns}
          data={data?.matches || []}
          loading={isLoading}
          emptyMessage="Nenhum jogo encontrado"
        />

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-admin-text-muted">
              Página {data.pagination.page} de {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setMatchesFilters({ page: matchesFilters.page - 1 })}
                disabled={matchesFilters.page === 1}
                className="btn btn-secondary btn-sm"
              >
                Anterior
              </button>
              <button
                onClick={() => setMatchesFilters({ page: matchesFilters.page + 1 })}
                disabled={matchesFilters.page >= data.pagination.totalPages}
                className="btn btn-secondary btn-sm"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <GameForm
          onSubmit={handleCreateMatch}
          onCancel={() => setShowForm(false)}
          isLoading={createMatch.isPending}
        />
      )}
    </div>
  );
}

