/**
 * ============================================================
 * useInfluencers Hook - Gestão de Influencers
 * ============================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../../utils/api';

/**
 * Hook para listar influencers
 */
export const useInfluencers = (filters = {}) => {
  return useQuery({
    queryKey: ['influencers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await get(`/admin/influencers?${params.toString()}`);
      return response;
    },
    keepPreviousData: true,
    staleTime: 30000 // 30 segundos
  });
};

/**
 * Hook para buscar um influencer específico
 */
export const useInfluencer = (id) => {
  return useQuery({
    queryKey: ['influencer', id],
    queryFn: async () => {
      const response = await get(`/admin/influencers/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 30000
  });
};

/**
 * Hook para criar influencer
 */
export const useCreateInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await post('/admin/influencers', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    }
  });
};

/**
 * Hook para atualizar influencer
 */
export const useUpdateInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await patch(`/admin/influencers/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
      queryClient.invalidateQueries({ queryKey: ['influencer', variables.id] });
    }
  });
};

/**
 * Hook para deletar/desativar influencer
 */
export const useDeleteInfluencer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, permanent = false }) => {
      const response = await del(`/admin/influencers/${id}?permanent=${permanent}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    }
  });
};

