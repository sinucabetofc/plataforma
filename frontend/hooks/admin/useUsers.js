/**
 * ============================================================
 * useUsers Hooks - Gerenciamento de Usuários
 * ============================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '../../utils/api';
import toast from 'react-hot-toast';

// Listar usuários
export function useUsers(filters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const response = await get(`/admin/users?${params}`);
      return response.data;
    },
  });
}

// Buscar usuário específico
export function useUser(userId) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await get(`/admin/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

// Atualizar status do usuário
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }) => {
      const response = await patch(`/admin/users/${userId}/status`, {
        is_active: isActive,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Status do usuário atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
    },
  });
}

// Buscar transações do usuário
export function useUserTransactions(userId, filters = {}) {
  return useQuery({
    queryKey: ['users', userId, 'transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const response = await get(`/admin/users/${userId}/transactions?${params}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

// Buscar apostas do usuário
export function useUserBets(userId, filters = {}) {
  return useQuery({
    queryKey: ['users', userId, 'bets', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const response = await get(`/admin/users/${userId}/bets?${params}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

