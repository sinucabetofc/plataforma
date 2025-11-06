/**
 * ============================================================
 * useBets Hooks - Gerenciamento de Apostas (Admin)
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '../../utils/api';

/**
 * Buscar apostas de uma série específica
 */
export function useSeriesBets(serieId) {
  return useQuery({
    queryKey: ['bets', 'serie', serieId],
    queryFn: async () => {
      const response = await get(`/bets/serie/${serieId}`);
      return response.data;
    },
    enabled: !!serieId,
    refetchInterval: 3000, // Atualizar a cada 3 segundos
  });
}

/**
 * Buscar apostas por partida
 */
export function useBets({ matchId, ...filters } = {}) {
  return useQuery({
    queryKey: ['bets', 'match', matchId, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(matchId && { match_id: matchId }),
        ...filters,
      });
      const response = await get(`/admin/bets?${params}`);
      return response.data;
    },
    enabled: !!matchId,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });
}

/**
 * Buscar todas as apostas (admin)
 */
export function useAllBets(filters = {}) {
  return useQuery({
    queryKey: ['bets', 'all', filters],
    queryFn: async () => {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null)
      );
      const params = new URLSearchParams(cleanFilters).toString();
      const endpoint = params ? `/admin/bets?${params}` : '/admin/bets';
      const response = await get(endpoint);
      return response.data;
    },
  });
}

/**
 * Buscar apostas recentes
 */
export function useRecentBets(limit = 10) {
  return useQuery({
    queryKey: ['bets', 'recent', limit],
    queryFn: async () => {
      const response = await get(`/bets/recent?limit=${limit}`);
      return response.data;
    },
    refetchInterval: 5000,
  });
}
