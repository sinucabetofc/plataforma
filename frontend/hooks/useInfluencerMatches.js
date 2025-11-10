import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import useInfluencerStore from '../store/influencerStore';

// Normalizar API_URL para garantir que termina com /api
const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  // Se já termina com /api, retorna como está
  if (baseUrl.endsWith('/api')) {
    return baseUrl;
  }
  // Se não, adiciona /api no final
  return `${baseUrl}/api`;
};

const API_URL = getApiUrl();

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
        `${API_URL}/influencers/dashboard`,
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
        `${API_URL}/influencers/matches?${params.toString()}`,
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
        `${API_URL}/influencers/matches/${id}`,
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
        `${API_URL}/influencers/matches/${matchId}/start`,
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
 * Hook para atualizar placar da série
 */
export const useUpdateScore = () => {
  const authHeaders = useAuthHeaders();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serieId, player1_score, player2_score }) => {
      console.log('📡 Enviando atualização de placar:', {
        url: `${API_URL}/influencers/series/${serieId}/score`,
        data: { player1_score, player2_score }
      });
      
      const response = await axios.patch(
        `${API_URL}/influencers/series/${serieId}/score`,
        { player1_score, player2_score },
        authHeaders
      );
      
      console.log('✅ Resposta do backend:', response.data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['influencer-matches'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-match'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-dashboard'] });
      
      // Notificação de sucesso
      toast.success('Placar atualizado com sucesso!', {
        duration: 3000,
        position: 'top-center',
        icon: '🎯'
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erro ao atualizar placar';
      toast.error(message, {
        duration: 4000,
        position: 'top-center'
      });
      console.error('Erro ao atualizar placar:', error);
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
        `${API_URL}/influencers/series/${seriesId}/start`,
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
        `${API_URL}/influencers/series/${seriesId}/enable-betting`,
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

