/**
 * ============================================================
 * useTransactions Hooks - Gerenciamento de Transações
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '../../utils/api';

// Listar transações
export function useTransactions(filters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const response = await get(`/admin/transactions?${params}`);
      return response.data;
    },
  });
}

