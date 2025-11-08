import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import useInfluencerStore from '../store/influencerStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Hook para obter cabeçalhos de autenticação
 */
const useAuthHeaders = () => {
  const { token } = useInfluencerStore();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

/**
 * Hook para dashboard do influencer
 */
export const useInfluencerDashboard = () => {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: ['influencer-dashboard'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/influencers/dashboard`,
        authHeaders
      );
      return response.data.data;
    },
    staleTime: 30000, // 30 segundos
    retry: 1
  });
};

/**
 * Hook para listar partidas do influencer
 */
export const useInfluencerMatches = (filters = {}) => {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: ['influencer-matches', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await axios.get(
        `${API_URL}/api/influencers/matches?${params.toString()}`,
        authHeaders
      );
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 10000, // 10 segundos
    retry: 1
  });
};

/**
 * Hook para buscar uma partida específica do influencer
 */
export const useInfluencerMatch = (id) => {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: ['influencer-match', id],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/influencers/matches/${id}`,
        authHeaders
      );
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 10000,
    retry: 1
  });
};

/**
 * Hook para iniciar partida
 */
export const useStartMatch = () => {
  const authHeaders = useAuthHeaders();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId) => {
      const response = await axios.patch(
        `${API_URL}/api/influencers/matches/${matchId}/start`,
        {},
        authHeaders
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-matches'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-match'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-dashboard'] });
    }
  });
};

/**
 * Hook para atualizar placar
 */
export const useUpdateScore = () => {
  const authHeaders = useAuthHeaders();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, player1_score, player2_score }) => {
      const response = await axios.patch(
        `${API_URL}/api/influencers/matches/${matchId}/score`,
        { player1_score, player2_score },
        authHeaders
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['influencer-matches'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-match', variables.matchId] });
    }
  });
};

/**
 * Hook para iniciar série
 */
export const useStartSeries = () => {
  const authHeaders = useAuthHeaders();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (seriesId) => {
      const response = await axios.patch(
        `${API_URL}/api/influencers/series/${seriesId}/start`,
        {},
        authHeaders
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-matches'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-match'] });
    }
  });
};

/**
 * Hook para liberar apostas
 */
export const useEnableBetting = () => {
  const authHeaders = useAuthHeaders();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (seriesId) => {
      const response = await axios.patch(
        `${API_URL}/api/influencers/series/${seriesId}/enable-betting`,
        {},
        authHeaders
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-matches'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-match'] });
    }
  });
};

