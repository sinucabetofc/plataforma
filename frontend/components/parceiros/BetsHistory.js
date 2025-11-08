/**
 * ============================================================
 * Bets History - Histórico de Apostas (Parceiros)
 * ============================================================
 */

import { DollarSign, TrendingUp, Users } from 'lucide-react';
import CardInfo from '../admin/CardInfo';

export default function BetsHistory({ match, bets }) {
  const getStatusBadge = (status) => {
    const badges = {
      pending: { className: 'status-badge-warning', label: 'Aguardando' },
      matched: { className: 'status-badge-info', label: 'Casada' },
      won: { className: 'status-badge-success', label: 'Ganhou' },
      lost: { className: 'status-badge-error', label: 'Perdeu' },
      cancelled: { className: 'status-badge-default', label: 'Cancelada' },
      refunded: { className: 'status-badge-default', label: 'Reembolsada' }
    };

    const badge = badges[status?.toLowerCase()] || badges.pending;

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const bettingStats = match?.betting_stats || {};
  const commission = match?.commission || {};
  const influencerCommission = match?.influencer_commission || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CardInfo
          title="Total Apostado"
          value={bettingStats.total_bets || 0}
          isCurrency
          icon={<DollarSign size={24} />}
          className="border-status-info"
        />

        <CardInfo
          title="Nº de Apostas"
          value={bettingStats.bets_count || 0}
          icon={<Users size={24} />}
          className="border-status-success"
        />

        <CardInfo
          title={`Sua Comissão (${influencerCommission}%)`}
          value={commission?.commission_amount || 0}
          isCurrency
          icon={<TrendingUp size={24} />}
          className="border-status-warning"
        />
      </div>

      {/* Distribution by Player */}
      <div className="grid grid-cols-2 gap-4">
        <div className="admin-card border-l-4 border-[#27E502]">
          <p className="text-admin-text-muted text-sm mb-1">
            {match?.player1?.nickname || 'Jogador 1'}
          </p>
          <p className="text-2xl font-bold text-[#27E502]">
            R$ {(bettingStats.total_bets_player1 || 0).toFixed(2)}
          </p>
        </div>

        <div className="admin-card border-l-4 border-[#27E502]">
          <p className="text-admin-text-muted text-sm mb-1">
            {match?.player2?.nickname || 'Jogador 2'}
          </p>
          <p className="text-2xl font-bold text-[#27E502]">
            R$ {(bettingStats.total_bets_player2 || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Bets Table */}
      <div className="admin-card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-admin-text-primary">
            Histórico de Apostas
          </h3>
          <p className="text-sm text-admin-text-secondary mt-1">
            Apostas confirmadas neste jogo
          </p>
        </div>

        <div className="overflow-x-auto">
          {!bets || bets.length === 0 ? (
            <div className="py-8 text-center text-admin-text-muted">
              Nenhuma aposta registrada ainda
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>USUÁRIO</th>
                  <th>SÉRIE</th>
                  <th>JOGADOR</th>
                  <th>VALOR</th>
                  <th>STATUS</th>
                  <th>DATA</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => (
                  <tr key={bet.id}>
                    <td className="text-admin-text-primary font-medium">
                      {bet.user?.name || 'Usuário'}
                    </td>
                    <td className="text-admin-text-secondary">
                      Série {bet.serie?.serie_number || bet.series?.serie_number || bet.series?.series_number || '-'}
                    </td>
                    <td className="text-admin-text-secondary">
                      {bet.chosen_player_id === match?.player1_id
                        ? (match?.player1?.nickname || match?.player1?.name || 'Jogador 1')
                        : (match?.player2?.nickname || match?.player2?.name || 'Jogador 2')
                      }
                    </td>
                    <td className="text-admin-text-primary font-semibold">
                      R$ {(parseFloat(bet.amount) / 100).toFixed(2)}
                    </td>
                    <td>
                      {getStatusBadge(bet.status)}
                    </td>
                    <td className="text-admin-text-secondary">
                      {new Date(bet.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
