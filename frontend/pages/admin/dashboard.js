/**
 * ============================================================
 * Dashboard Page - Página Principal Admin
 * ============================================================
 */

import { useEffect } from 'react';
import { Users, Trophy, Target, DollarSign, TrendingUp, UserPlus, CreditCard, Wallet, Calendar, Coins, DollarSign as DollarSolid } from 'lucide-react';
import { useDashboardStats } from '../../hooks/admin/useDashboardStats';
import useAdminStore from '../../store/adminStore';
import CardInfo from '../../components/admin/CardInfo';
import Loader from '../../components/admin/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function Dashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { setPendingWithdrawalsCount } = useAdminStore();

  // Atualizar contador de saques pendentes no store
  useEffect(() => {
    if (stats?.withdrawals?.pending?.count) {
      setPendingWithdrawalsCount(stats.withdrawals.pending.count);
    }
  }, [stats, setPendingWithdrawalsCount]);

  if (isLoading) {
    return (
      <div className="py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-status-error">
        <p>Erro ao carregar estatísticas do dashboard</p>
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
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4">
        <CardInfo
          title="Total Usuários"
          value={stats?.users?.total || 0}
          icon={<Users size={24} />}
          trend={`${stats?.users?.active || 0} ativos`}
        />

        <CardInfo
          title="Cadastros Hoje"
          value={stats?.users?.today || 0}
          icon={<UserPlus size={24} />}
          trend="Novos usuários"
          className="border-blue-500"
        />
        
        <CardInfo
          title="Jogos Ativos"
          value={(stats?.matches?.open || 0) + (stats?.matches?.in_progress || 0)}
          icon={<Trophy size={24} />}
          trend={`${stats?.matches?.finished || 0} finalizados`}
        />
        
        <CardInfo
          title="Apostado Hoje"
          value={stats?.bets?.today || 0}
          isCurrency
          icon={<Target size={24} />}
          trend="Últimas 24 horas"
          className="border-verde-neon"
        />

        <CardInfo
          title="Apostado no Mês"
          value={stats?.bets?.month || 0}
          isCurrency
          icon={<Calendar size={24} />}
          trend={`Total: ${formatCurrency(stats?.bets?.total || 0)}`}
          className="border-cyan-500"
        />

        <CardInfo
          title="Depósitos Hoje"
          value={stats?.deposits?.today || 0}
          isCurrency
          icon={<CreditCard size={24} />}
          trend="Recebidos hoje"
          className="border-green-500"
        />

        <CardInfo
          title="Saldo Total dos Jogadores"
          value={stats?.wallets?.total_balance || 0}
          isCurrency
          icon={<Coins size={24} />}
          trend={`Fake: ${formatCurrency(stats?.wallets?.fake_balance || 0)}`}
          className="border-yellow-500"
        />

        <CardInfo
          title="Saldo Total Casado"
          value={stats?.wallets?.real_balance || 0}
          isCurrency
          icon={<DollarSolid size={24} />}
          trend="Depósitos reais"
          className="border-emerald-500"
        />
        
        <CardInfo
          title="Saques Pendentes"
          value={stats?.withdrawals?.pending?.total || 0}
          isCurrency
          icon={<DollarSign size={24} />}
          trend={`${stats?.withdrawals?.pending?.count || 0} solicitações`}
          className="border-status-warning"
        />

        <CardInfo
          title="Saldo Fake Total"
          value={stats?.wallets?.fake_balance || 0}
          isCurrency
          icon={<Wallet size={24} />}
          trend="Créditos manuais"
          className="border-purple-500"
        />
        
        <CardInfo
          title="Lucro Plataforma (8%)"
          value={stats?.platform?.profit || 0}
          isCurrency
          icon={<TrendingUp size={24} />}
          trend={`De ${formatCurrency(stats?.withdrawals?.completed?.total || 0)} em saques`}
          className="border-admin-green"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Apostas */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4 text-admin-text-primary">
            Apostas (Últimos 7 dias)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.charts.betsLast7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis 
                dataKey="date" 
                stroke="#a0a0a0"
                tickFormatter={(value) => {
                  // Parse data local (formato YYYY-MM-DD)
                  const [year, month, day] = value.split('-').map(Number);
                  return `${day}/${month}`;
                }}
              />
              <YAxis stroke="#a0a0a0" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                labelFormatter={(value) => {
                  // Formatar label do tooltip corretamente
                  const [year, month, day] = value.split('-').map(Number);
                  return `${day}/${month}/${year}`;
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#27e502" 
                strokeWidth={2}
                dot={{ fill: '#27e502', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Novos Usuários */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4 text-admin-text-primary">
            Novos Usuários (Últimos 7 dias)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.charts.newUsersLast7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis 
                dataKey="date" 
                stroke="#a0a0a0"
                tickFormatter={(value) => {
                  // Parse data local (formato YYYY-MM-DD)
                  const [year, month, day] = value.split('-').map(Number);
                  return `${day}/${month}`;
                }}
              />
              <YAxis stroke="#a0a0a0" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                labelFormatter={(value) => {
                  // Formatar label do tooltip corretamente
                  const [year, month, day] = value.split('-').map(Number);
                  return `${day}/${month}/${year}`;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#27e502" 
                strokeWidth={2}
                dot={{ fill: '#27e502', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold mb-4 text-admin-text-primary">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/withdrawals"
            className="block p-4 bg-admin-gray-light rounded-lg hover:bg-admin-gray-dark transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-status-warning rounded-lg">
                <DollarSign size={20} className="text-admin-black" />
              </div>
              <div>
                <p className="font-medium text-admin-text-primary">Aprovar Saques</p>
                <p className="text-sm text-admin-text-muted">
                  {stats.withdrawals.pending.count} pendentes
                </p>
              </div>
            </div>
          </a>

          <a
            href="/admin/games"
            className="block p-4 bg-admin-gray-light rounded-lg hover:bg-admin-gray-dark transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-admin-green rounded-lg">
                <Trophy size={20} className="text-admin-black" />
              </div>
              <div>
                <p className="font-medium text-admin-text-primary">Cadastrar Jogo</p>
                <p className="text-sm text-admin-text-muted">
                  Nova partida
                </p>
              </div>
            </div>
          </a>

          <a
            href="/admin/users"
            className="block p-4 bg-admin-gray-light rounded-lg hover:bg-admin-gray-dark transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-status-info rounded-lg">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-admin-text-primary">Ver Usuários</p>
                <p className="text-sm text-admin-text-muted">
                  {stats.users.total} cadastrados
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}







