/**
 * ============================================================
 * useDashboardStats Hook - Dashboard Statistics
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '../../utils/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await get('/admin/dashboard/stats');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

