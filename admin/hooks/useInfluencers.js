import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../utils/api';

/**
 * Hook para listar influencers
 */
export const useInfluencers = (filters = {}) => {
  return useQuery(
    ['influencers', filters],
    async () => {
      const params = new URLSearchParams();
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await api.get(`/api/admin/influencers?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true,
      staleTime: 30000 // 30 segundos
    }
  );
};

/**
 * Hook para buscar um influencer específico
 */
export const useInfluencer = (id) => {
  return useQuery(
    ['influencer', id],
    async () => {
      const response = await api.get(`/api/admin/influencers/${id}`);
      return response.data.data;
    },
    {
      enabled: !!id,
      staleTime: 30000
    }
  );
};

/**
 * Hook para criar influencer
 */
export const useCreateInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (data) => {
      const response = await api.post('/api/admin/influencers', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('influencers');
      }
    }
  );
};

/**
 * Hook para atualizar influencer
 */
export const useUpdateInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, data }) => {
      const response = await api.patch(`/api/admin/influencers/${id}`, data);
      return response.data;
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('influencers');
        queryClient.invalidateQueries(['influencer', variables.id]);
      }
    }
  );
};

/**
 * Hook para deletar/desativar influencer
 */
export const useDeleteInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, permanent = false }) => {
      const response = await api.delete(`/api/admin/influencers/${id}?permanent=${permanent}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('influencers');
      }
    }
  );
};

