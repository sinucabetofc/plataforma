/**
 * ============================================================
 * Bets Page - Página de Apostas
 * ============================================================
 */

import { useState } from 'react';
import { useAllBets } from '../../hooks/admin/useBets';
import useAdminStore from '../../store/adminStore';
import Table from '../../components/admin/Table';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatMoney, formatDate, formatFullDate } from '../../utils/formatters';
import { Target, Eye, X, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function Bets() {
  const { filters, setBetsFilters } = useAdminStore();
  const betsFilters = {
    ...filters.bets,
    limit: 20, // Definir limite padrão
  };
  
  const { data, isLoading } = useAllBets(betsFilters);
  const [selectedBet, setSelectedBet] = useState(null);

  const handleViewDetails = (bet) => {
    setSelectedBet(bet);
  };

  const handleCloseModal = () => {
    setSelectedBet(null);
  };

  const handleCancelBet = async (bet) => {
    if (!confirm(`Cancelar aposta de R$ ${(bet.amount / 100).toFixed(2)} do usuário ${bet.user?.name}?\n\nO valor será reembolsado.`)) {
      return;
    }

    try {
      await api.admin.cancelBet(bet.id);
      toast.success('Aposta cancelada com sucesso!');
      // Recarregar lista
      window.location.reload();
    } catch (error) {
      console.error('Erro ao cancelar aposta:', error);
      toast.error(error.message || 'Erro ao cancelar aposta');
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'Usuário',
      render: (user) => user?.name,
    },
    {
      key: 'series',
      label: 'Jogo',
      render: (series) => {
        const match = series?.match;
        return match
          ? `${match.player_a?.name} vs ${match.player_b?.name}`
          : '-';
      },
    },
    {
      key: 'amount',
      label: 'Valor',
      render: (value) => formatMoney(value),
    },
    {
      key: 'chosen_player',
      label: 'Aposta em',
      render: (chosen_player, bet) => {
        if (chosen_player?.name) {
          return chosen_player.name;
        }
        // Fallback para bet_on se chosen_player não estiver disponível
        const match = bet.series?.match;
        if (bet.bet_on === 'player_a' && match?.player_a) {
          return match.player_a.name;
        }
        if (bet.bet_on === 'player_b' && match?.player_b) {
          return match.player_b.name;
        }
        return '-';
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'created_at',
      label: 'Data',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, bet) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(bet)}
            className="btn btn-sm bg-admin-primary hover:bg-admin-primary-dark text-white flex items-center gap-2"
          >
            <Eye size={16} />
            Ver
          </button>
          
          {/* Botão cancelar apenas para apostas pendentes ou aceitas */}
          {(bet.status === 'pendente' || bet.status === 'aceita') && (
            <button
              onClick={() => handleCancelBet(bet)}
              className="btn btn-sm bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
              title="Cancelar e reembolsar aposta"
            >
              <XCircle size={16} />
              Cancelar
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
            Apostas
          </h1>
          <p className="text-admin-text-secondary">
            Acompanhar todas as apostas em tempo real
          </p>
        </div>
        <div className="flex-shrink-0">
          <Target className="text-admin-green" size={24} />
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
              value={betsFilters.status || ''}
              onChange={(e) => setBetsFilters({ status: e.target.value || null, page: 1 })}
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="matched">Pareada</option>
              <option value="won">Venceu</option>
              <option value="lost">Perdeu</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <Table
          columns={columns}
          data={data?.bets || []}
          loading={isLoading}
          emptyMessage="Nenhuma aposta encontrada"
        />

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-admin-text-muted">
              Página {data.pagination.page} de {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setBetsFilters({ page: betsFilters.page - 1 })}
                disabled={betsFilters.page === 1}
                className="btn btn-secondary btn-sm"
              >
                Anterior
              </button>
              <button
                onClick={() => setBetsFilters({ page: betsFilters.page + 1 })}
                disabled={betsFilters.page >= data.pagination.totalPages}
                className="btn btn-secondary btn-sm"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Aposta */}
      {selectedBet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Detalhes da Aposta</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6">
              {/* Informações do Usuário */}
              <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  👤 Informações do Usuário
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="text-white font-medium">{selectedBet.user?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-white font-medium">{selectedBet.user?.email || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Informações da Partida */}
              <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  🎱 Informações da Partida
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Jogo</p>
                    <p className="text-white font-medium text-lg">
                      {selectedBet.series?.match?.player_a?.name || 'Jogador A'} 
                      <span className="text-verde-neon mx-2">vs</span> 
                      {selectedBet.series?.match?.player_b?.name || 'Jogador B'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Série</p>
                      <p className="text-white font-medium">
                        Série #{selectedBet.series?.serie_number || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status da Série</p>
                      <StatusBadge status={selectedBet.series?.status || 'pending'} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações da Aposta */}
              <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  💰 Informações da Aposta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Valor Apostado</p>
                    <p className="text-2xl font-bold text-verde-neon">
                      {formatMoney(selectedBet.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ganho Potencial</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {formatMoney(selectedBet.potential_return || selectedBet.amount * 2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Apostou em</p>
                    <p className="text-white font-medium text-lg">
                      {selectedBet.chosen_player?.name || 
                       (selectedBet.bet_on === 'player_a' 
                         ? selectedBet.series?.match?.player_a?.name 
                         : selectedBet.series?.match?.player_b?.name) || 
                       '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status da Aposta</p>
                    <StatusBadge status={selectedBet.status} />
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  📅 Datas e Horários
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Data da Aposta</p>
                    <p className="text-white font-medium">
                      {formatFullDate(selectedBet.placed_at || selectedBet.created_at)}
                    </p>
                  </div>
                  {selectedBet.updated_at && (
                    <div>
                      <p className="text-sm text-gray-500">Última Atualização</p>
                      <p className="text-white font-medium">
                        {formatFullDate(selectedBet.updated_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ID da Aposta */}
              <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">ID da Aposta</p>
                <p className="text-xs text-gray-400 font-mono break-all">
                  {selectedBet.id}
                </p>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-gray-800 p-6">
              <button
                onClick={handleCloseModal}
                className="w-full btn bg-gray-800 hover:bg-gray-700 text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

