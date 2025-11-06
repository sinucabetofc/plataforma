/**
 * ============================================================
 * useWithdrawals Hooks - Gerenciamento de Saques
 * ============================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '../../utils/api';
import toast from 'react-hot-toast';
import useAdminStore from '../../store/adminStore';

// Listar saques
export function useWithdrawals(filters = {}) {
  return useQuery({
    queryKey: ['withdrawals', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const response = await get(`/admin/withdrawals?${params}`);
      return response.data;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}

// Buscar saque específico
export function useWithdrawal(withdrawalId) {
  return useQuery({
    queryKey: ['withdrawals', withdrawalId],
    queryFn: async () => {
      const response = await get(`/admin/withdrawals/${withdrawalId}`);
      return response.data;
    },
    enabled: !!withdrawalId,
  });
}

// Aprovar saque
export function useApproveWithdrawal() {
  const queryClient = useQueryClient();
  const { decrementPendingWithdrawals } = useAdminStore();

  return useMutation({
    mutationFn: async (withdrawalId) => {
      const response = await patch(`/admin/withdrawals/${withdrawalId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      decrementPendingWithdrawals();
      toast.success('Saque aprovado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao aprovar saque:', error);
    },
  });
}

// Recusar saque
export function useRejectWithdrawal() {
  const queryClient = useQueryClient();
  const { decrementPendingWithdrawals } = useAdminStore();

  return useMutation({
    mutationFn: async ({ withdrawalId, reason }) => {
      const response = await patch(`/admin/withdrawals/${withdrawalId}/reject`, {
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      decrementPendingWithdrawals();
      toast.success('Saque recusado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao recusar saque:', error);
    },
  });
}

