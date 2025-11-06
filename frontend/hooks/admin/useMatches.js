/**
 * ============================================================
 * useMatches Hooks - Gerenciamento de Partidas/Jogos
 * ============================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../../utils/api';
import toast from 'react-hot-toast';

// Listar partidas
export function useMatches(filters = {}) {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: async () => {
      // Filtrar valores null/undefined antes de criar URLSearchParams
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null)
      );
      const params = new URLSearchParams(cleanFilters).toString();
      const endpoint = params ? `/admin/matches?${params}` : '/admin/matches';
      const response = await get(endpoint);
      return response.data;
    },
  });
}

// Buscar partida específica
export function useMatch(matchId) {
  return useQuery({
    queryKey: ['matches', matchId],
    queryFn: async () => {
      const response = await get(`/admin/matches/${matchId}`);
      return response.data;
    },
    enabled: !!matchId,
  });
}

// Criar partida
export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchData) => {
      const response = await post('/admin/matches', matchData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Partida criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar partida:', error);
    },
  });
}

// Atualizar partida
export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, data }) => {
      const response = await patch(`/admin/matches/${matchId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Partida atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar partida:', error);
      toast.error(error.message || 'Erro ao atualizar partida');
    },
  });
}

// Atualizar status da partida
export function useUpdateMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, status }) => {
      const response = await patch(`/matches/${matchId}/status`, { status });
      return response.data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['series'] });
      
      const messages = {
        em_andamento: 'Partida iniciada! Agora está ao vivo.',
        finalizada: 'Partida finalizada com sucesso!',
        cancelada: 'Partida cancelada. Apostas reembolsadas.',
      };
      
      toast.success(messages[status] || 'Status atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error(error.message || 'Erro ao atualizar status');
    },
  });
}

// Deletar partida
export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId) => {
      const response = await del(`/admin/matches/${matchId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Partida deletada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao deletar partida:', error);
    },
  });
}

// Finalizar partida
export function useFinalizeMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, winnerId }) => {
      const response = await patch(`/admin/matches/${matchId}/finalize`, {
        winner_id: winnerId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      toast.success('Partida finalizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao finalizar partida:', error);
    },
  });
}

