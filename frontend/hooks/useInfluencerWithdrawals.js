/**
 * ============================================================
 * useInfluencerWithdrawals Hook
 * ============================================================
 * Hook para gerenciar saques dos parceiros
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import useInfluencerStore from '../store/influencerStore';
import toast from 'react-hot-toast';

// Normalizar API_URL
const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  if (baseUrl.endsWith('/api')) {
    return baseUrl;
  }
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
 * Hook para listar saques do influencer
 */
export function useInfluencerWithdrawals(filters = {}) {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: ['influencer-withdrawals', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await axios.get(
        `${API_URL}/influencers/withdrawals?${params.toString()}`,
        authHeaders
      );
      return response.data.data;
    },
    keepPreviousData: true,
    staleTime: 10000 // 10 segundos
  });
}

/**
 * Hook para solicitar novo saque
 */
export function useRequestWithdrawal() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${API_URL}/influencers/withdrawals`,
        data,
        authHeaders
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-dashboard'] });
      toast.success('Saque solicitado com sucesso! Aguarde a aprovação.');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erro ao solicitar saque';
      toast.error(message);
      console.error('Erro ao solicitar saque:', error);
    }
  });
}

/**
 * Hook para cancelar saque
 */
export function useCancelWithdrawal() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async (withdrawalId) => {
      const response = await axios.delete(
        `${API_URL}/influencers/withdrawals/${withdrawalId}`,
        authHeaders
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-withdrawals'] });
      toast.success('Saque cancelado com sucesso');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erro ao cancelar saque';
      toast.error(message);
      console.error('Erro ao cancelar saque:', error);
    }
  });
}

