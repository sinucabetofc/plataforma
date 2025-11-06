/**
 * ============================================================
 * useSeries Hooks - Gerenciamento de Séries
 * ============================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../../utils/api';
import toast from 'react-hot-toast';

/**
 * Buscar séries de uma partida
 */
export function useSeries(matchId) {
  return useQuery({
    queryKey: ['series', matchId],
    queryFn: async () => {
      const response = await get(`/series/match/${matchId}`);
      return response.data;
    },
    enabled: !!matchId,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });
}

/**
 * Criar nova série
 */
export function useCreateSerie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId) => {
      const response = await post('/series/create', { match_id: matchId });
      return response.data;
    },
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ['series', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Nova série adicionada!');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar série');
      console.error('Erro ao criar série:', error);
    },
  });
}

/**
 * Buscar série específica
 */
export function useSerie(serieId) {
  return useQuery({
    queryKey: ['serie', serieId],
    queryFn: async () => {
      const response = await get(`/series/${serieId}`);
      return response.data;
    },
    enabled: !!serieId,
    refetchInterval: 3000, // Atualizar a cada 3 segundos (placar ao vivo)
  });
}

/**
 * Liberar série para apostas
 */
export function useReleaseSerie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serieId) => {
      const response = await post(`/series/${serieId}/release`);
      return response.data;
    },
    onSuccess: (_, serieId) => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['serie', serieId] });
      toast.success('Série liberada para apostas!');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao liberar série');
      console.error('Erro ao liberar série:', error);
    },
  });
}

/**
 * Iniciar série
 */
export function useStartSerie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serieId) => {
      const response = await post(`/series/${serieId}/start`);
      return response.data;
    },
    onSuccess: (_, serieId) => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['serie', serieId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Série iniciada! Apostas travadas.');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao iniciar série');
      console.error('Erro ao iniciar série:', error);
    },
  });
}

/**
 * Finalizar série
 */
export function useFinishSerie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serieId, winner_player_id, player1_score, player2_score }) => {
      const response = await post(`/series/${serieId}/finish`, {
        winner_player_id,
        player1_score,
        player2_score,
      });
      return response.data;
    },
    onSuccess: (_, { serieId }) => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['serie', serieId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      toast.success('Série finalizada! Prêmios distribuídos.');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao finalizar série');
      console.error('Erro ao finalizar série:', error);
    },
  });
}

/**
 * Cancelar série
 */
export function useCancelSerie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serieId) => {
      const response = await post(`/series/${serieId}/cancel`);
      return response.data;
    },
    onSuccess: (_, serieId) => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['serie', serieId] });
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      toast.success('Série cancelada. Apostas reembolsadas.');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao cancelar série');
      console.error('Erro ao cancelar série:', error);
    },
  });
}

/**
 * Atualizar placar
 */
export function useUpdateScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serieId, player1_score, player2_score }) => {
      const response = await patch(`/series/${serieId}/score`, {
        player1_score,
        player2_score,
      });
      return response.data;
    },
    onSuccess: (_, { serieId }) => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['serie', serieId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar placar');
      console.error('Erro ao atualizar placar:', error);
    },
  });
}

/**
 * Deletar série
 */
export function useDeleteSerie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serieId) => {
      const response = await del(`/series/${serieId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Série deletada com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao deletar série');
      console.error('Erro ao deletar série:', error);
    },
  });
}

/**
 * Atualizar série (editar número, etc)
 */
export function useUpdateSerie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serieId, data }) => {
      const response = await patch(`/series/${serieId}`, data);
      return response.data;
    },
    onSuccess: (_, { serieId }) => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['serie', serieId] });
      toast.success('Série atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar série');
      console.error('Erro ao atualizar série:', error);
    },
  });
}


