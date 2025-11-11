/**
 * ============================================================
 * useDeposits Hook - Gerenciamento de Depósitos
 * ============================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, put } from '../../utils/api';

/**
 * Hook para listar depósitos
 */
export function useDeposits({ page = 1, limit = 20, status = 'all' } = {}) {
  return useQuery({
    queryKey: ['admin', 'deposits', { page, limit, status }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (status && status !== 'all') {
        params.append('status', status);
      }

      const response = await get(`/admin/deposits?${params.toString()}`);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}

/**
 * Hook para buscar detalhes de um depósito
 */
export function useDeposit(depositId) {
  return useQuery({
    queryKey: ['admin', 'deposits', depositId],
    queryFn: async () => {
      const response = await get(`/admin/deposits/${depositId}`);
      return response.data;
    },
    enabled: !!depositId,
  });
}

/**
 * Hook para aprovar um depósito
 */
export function useApproveDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (depositId) => {
      const response = await put(`/admin/deposits/${depositId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      // Invalida todas as queries de depósitos para recarregar
      queryClient.invalidateQueries({ queryKey: ['admin', 'deposits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Hook para rejeitar um depósito
 */
export function useRejectDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ depositId, reason }) => {
      const response = await put(`/admin/deposits/${depositId}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      // Invalida todas as queries de depósitos para recarregar
      queryClient.invalidateQueries({ queryKey: ['admin', 'deposits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
