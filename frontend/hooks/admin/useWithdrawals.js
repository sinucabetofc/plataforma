/**
 * ============================================================
 * useWithdrawals Hook (Admin)
 * ============================================================
 * Hook para admin gerenciar saques dos parceiros
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '../../utils/api';
import toast from 'react-hot-toast';

/**
 * Listar todos os saques (Admin)
 */
export function useWithdrawals(filters = {}) {
  return useQuery({
    queryKey: ['admin-withdrawals', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.influencer_id) params.append('influencer_id', filters.influencer_id);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await get(`/admin/withdrawals?${params.toString()}`);
      return response.data;
    },
    keepPreviousData: true,
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });
}

/**
 * Aprovar saque (Admin)
 */
export function useApproveWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ withdrawalId, withdrawal_type }) => {
      const response = await patch(`/admin/withdrawals/${withdrawalId}/approve`, { withdrawal_type });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('Saque aprovado com sucesso!');
    },
    onError: (error) => {
      const message = error.message || 'Erro ao aprovar saque';
      toast.error(message);
      console.error('Erro ao aprovar saque:', error);
    }
  });
}

/**
 * Rejeitar saque (Admin)
 */
export function useRejectWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ withdrawalId, withdrawal_type, reason }) => {
      const response = await patch(`/admin/withdrawals/${withdrawalId}/reject`, { withdrawal_type, reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('Saque rejeitado');
    },
    onError: (error) => {
      const message = error.message || 'Erro ao rejeitar saque';
      toast.error(message);
      console.error('Erro ao rejeitar saque:', error);
    }
  });
}

/**
 * Estatísticas de saques (Admin)
 */
export function useWithdrawalsStats() {
  return useQuery({
    queryKey: ['withdrawals-stats'],
    queryFn: async () => {
      const response = await get('/admin/withdrawals/stats');
      return response.data;
    },
    staleTime: 60000 // 1 minuto
  });
}

