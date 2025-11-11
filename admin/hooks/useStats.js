import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
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

        return null;
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }
    },
    // Retornar dados vazios em caso de erro
    placeholderData: {
      totalUsers: 0,
      betsToday: 0,
      totalVolume: 0,
      activeMatches: 0,
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};

export default useStats;




