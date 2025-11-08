import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import CardInfo from '../components/CardInfo';
import { useStats } from '../hooks/useStats';

function Dashboard() {
  const { data: stats, isLoading, error } = useStats();

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        {isLoading && (
          <div className="text-white">Carregando estatísticas...</div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            Erro ao carregar estatísticas: {error.message}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardInfo
              title="Usuários Totais"
              value={stats.totalUsers || 0}
              icon="👥"
              trend={stats.usersTrend}
            />
            <CardInfo
              title="Apostas Hoje"
              value={stats.betsToday || 0}
              icon="🎯"
              trend={stats.betsTrend}
            />
            <CardInfo
              title="Volume Total"
              value={`R$ ${(stats.totalVolume || 0).toFixed(2)}`}
              icon="💰"
              trend={stats.volumeTrend}
            />
            <CardInfo
              title="Partidas Ativas"
              value={stats.activeMatches || 0}
              icon="🎱"
              trend={stats.matchesTrend}
            />
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Bem-vindo ao Painel Admin
          </h2>
          <p className="text-gray-400">
            Use o menu lateral para navegar pelas diferentes seções do sistema.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}



