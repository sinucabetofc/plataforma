import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('admin_token');
        
        const response = await axios.get(`${API_URL}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          return response.data.data;
        }

        throw new Error('Erro ao carregar estatísticas');
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }
    },
    // Retornar dados mockados em caso de erro
    placeholderData: {
      users: {
        total: 0,
        active: 0,
      },
      matches: {
        open: 0,
        in_progress: 0,
        finished: 0,
      },
      bets: {
        total: 0,
        month: 0,
      },
      withdrawals: {
        pending: {
          total: 0,
          count: 0,
        },
        completed: {
          total: 0,
        },
      },
      platform: {
        profit: 0,
      },
      charts: {
        betsLast7Days: [],
        newUsersLast7Days: [],
      },
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};

export default useDashboardStats;
