/**
 * ============================================================
 * Admin - Estatísticas Fake (Debug/Testes)
 * ============================================================
 */

import { DollarSign, TrendingDown, Calendar, BarChart3, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../utils/api';
import CardInfo from '../../components/admin/CardInfo';
import Loader from '../../components/admin/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FakeStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['fake-stats'],
    queryFn: async () => {
      const response = await get('/admin/fake-stats');
      return response.data;
    },
    staleTime: 60000, // 1 minuto
  });

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
        <p>Erro ao carregar estatísticas fake</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Warning */}
      <div className="admin-card bg-yellow-900/20 border-yellow-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-500 flex-shrink-0" size={24} />
          <div>
            <h2 className="text-lg font-bold text-yellow-500 mb-1">
              ⚠️ Estatísticas de Saldo Fake (Apenas para Debug)
            </h2>
            <p className="text-sm text-yellow-400/80">
              Esta página mostra dados de saldo fake adicionado manualmente para testes.
              Estes valores <strong>NÃO representam dinheiro real</strong> e não devem ser considerados no lucro da plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
          Estatísticas Fake
        </h1>
        <p className="text-admin-text-secondary">
          Saldo fake, saques de teste e dados para debugging
        </p>
      </div>

      {/* Cards de Saldo Fake */}
      <div>
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
          💰 Saldo Fake
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardInfo
            title="Saldo Fake Total"
            value={stats?.balance?.fake || 0}
            isCurrency
            icon={<DollarSign size={24} />}
            trend="Saldo de teste"
            className="border-yellow-500/30"
          />

          <CardInfo
            title="Saldo Real"
            value={stats?.balance?.real || 0}
            isCurrency
            icon={<DollarSign size={24} />}
            trend="Depósitos reais"
            className="border-green-500/30"
          />

          <CardInfo
            title="Créditos Manuais"
            value={stats?.balance?.admin_credits || 0}
            isCurrency
            icon={<DollarSign size={24} />}
            trend="Adicionados por admin"
            className="border-blue-500/30"
          />

          <CardInfo
            title="Saldo Total"
            value={stats?.balance?.total || 0}
            isCurrency
            icon={<DollarSign size={24} />}
            trend="Real + Fake"
          />
        </div>
      </div>

      {/* Cards de Saques Fake */}
      <div>
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
          📤 Saques de Saldo Fake
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardInfo
            title="Total Sacado Fake"
            value={stats?.withdrawals?.fake || 0}
            isCurrency
            icon={<TrendingDown size={24} />}
            trend={`${stats?.withdrawals?.count?.total || 0} saques`}
            className="border-red-500/30"
          />

          <CardInfo
            title="Sacado Hoje"
            value={stats?.withdrawals?.today || 0}
            isCurrency
            icon={<Calendar size={24} />}
            trend={`${stats?.withdrawals?.count?.today || 0} saques`}
          />

          <CardInfo
            title="Últimos 7 Dias"
            value={stats?.withdrawals?.last_7_days || 0}
            isCurrency
            icon={<BarChart3 size={24} />}
            trend={`${stats?.withdrawals?.count?.last_7_days || 0} saques`}
          />

          <CardInfo
            title="Este Mês"
            value={stats?.withdrawals?.month || 0}
            isCurrency
            icon={<Calendar size={24} />}
            trend={`${stats?.withdrawals?.count?.month || 0} saques`}
          />
        </div>
      </div>

      {/* Gráfico de Saques */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
          📊 Saques dos Últimos 7 Dias
        </h3>
        
        {stats?.charts?.withdrawals_last_7_days && stats.charts.withdrawals_last_7_days.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.charts.withdrawals_last_7_days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                stroke="#888"
                tick={{ fill: '#888' }}
              />
              <YAxis 
                stroke="#888"
                tick={{ fill: '#888' }}
                tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Total Sacado']}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-admin-text-muted">
            Sem dados para exibir
          </div>
        )}
      </div>

      {/* Informações Adicionais */}
      <div className="admin-card bg-gray-900/50">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
          ℹ️ Sobre Saldo Fake
        </h3>
        <div className="space-y-3 text-sm text-admin-text-secondary">
          <p>
            <strong className="text-admin-text-primary">O que é saldo fake?</strong><br />
            Saldo adicionado manualmente pelos admins para testes, sem depósito real em dinheiro.
          </p>
          <p>
            <strong className="text-admin-text-primary">Para que serve?</strong><br />
            Testar funcionalidades de apostas, saques e transações sem movimentar dinheiro real.
          </p>
          <p>
            <strong className="text-admin-text-primary">Por que não entra no lucro?</strong><br />
            Porque não é dinheiro real. As taxas sobre saldo fake são apenas números virtuais.
          </p>
          <p className="pt-3 border-t border-admin-border">
            <strong className="text-yellow-500">⚠️ Importante:</strong> Em produção, minimize o uso de saldo fake.
            Use apenas para testes controlados.
          </p>
        </div>
      </div>
    </div>
  );
}

