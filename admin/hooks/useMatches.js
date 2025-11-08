import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../utils/api';

/**
 * Hook para listar partidas
 */
export const useMatches = (filters = {}) => {
  return useQuery(
    ['matches', filters],
    async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.influencer_id) params.append('influencer_id', filters.influencer_id);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await api.get(`/api/matches?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true,
      staleTime: 10000 // 10 segundos
    }
  );
};

/**
 * Hook para buscar uma partida específica
 */
export const useMatch = (id) => {
  return useQuery(
    ['match', id],
    async () => {
      const response = await api.get(`/api/matches/${id}`);
      return response.data.data;
    },
    {
      enabled: !!id,
      staleTime: 10000
    }
  );
};

/**
 * Hook para criar partida
 */
export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (data) => {
      const response = await api.post('/api/matches', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('matches');
      }
    }
  );
};

/**
 * Hook para atualizar partida
 */
export const useUpdateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, data }) => {
      const response = await api.patch(`/api/matches/${id}`, data);
      return response.data;
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('matches');
        queryClient.invalidateQueries(['match', variables.id]);
      }
    }
  );
};

/**
 * Hook para deletar partida
 */
export const useDeleteMatch = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const response = await api.delete(`/api/matches/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('matches');
      }
    }
  );
};
