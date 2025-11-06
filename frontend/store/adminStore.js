/**
 * ============================================================
 * Admin Store - Estado Global Admin
 * ============================================================
 * Zustand store para gerenciamento de estado
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
  persist(
    (set, get) => ({
      // ============================================================
      // ESTADO INICIAL
      // ============================================================
      
      // Dados do admin logado
      admin: null,
      
      // Contadores de notificações
      pendingWithdrawalsCount: 0,
      
      // Filtros persistidos
      filters: {
        users: {
          search: '',
          status: null,
          page: 1,
        },
        withdrawals: {
          status: null,
          page: 1,
        },
        matches: {
          status: null,
          page: 1,
        },
        bets: {
          status: null,
          matchId: null,
          page: 1,
        },
        transactions: {
          type: null,
          status: null,
          userId: null,
          page: 1,
        },
      },
      
      // Estado da sidebar (aberta/fechada em mobile)
      sidebarOpen: true,
      
      // ============================================================
      // AÇÕES - Admin
      // ============================================================
      
      setAdmin: (admin) => set({ admin }),
      
      clearAdmin: () => set({ admin: null }),
      
      // ============================================================
      // AÇÕES - Contadores
      // ============================================================
      
      setPendingWithdrawalsCount: (count) => set({ pendingWithdrawalsCount: count }),
      
      incrementPendingWithdrawals: () => set((state) => ({
        pendingWithdrawalsCount: state.pendingWithdrawalsCount + 1,
      })),
      
      decrementPendingWithdrawals: () => set((state) => ({
        pendingWithdrawalsCount: Math.max(0, state.pendingWithdrawalsCount - 1),
      })),
      
      // ============================================================
      // AÇÕES - Filtros
      // ============================================================
      
      setUsersFilters: (filters) => set((state) => ({
        filters: {
          ...state.filters,
          users: { ...state.filters.users, ...filters },
        },
      })),
      
      resetUsersFilters: () => set((state) => ({
        filters: {
          ...state.filters,
          users: {
            search: '',
            status: null,
            page: 1,
          },
        },
      })),
      
      setWithdrawalsFilters: (filters) => set((state) => ({
        filters: {
          ...state.filters,
          withdrawals: { ...state.filters.withdrawals, ...filters },
        },
      })),
      
      resetWithdrawalsFilters: () => set((state) => ({
        filters: {
          ...state.filters,
          withdrawals: {
            status: null,
            page: 1,
          },
        },
      })),
      
      setMatchesFilters: (filters) => set((state) => ({
        filters: {
          ...state.filters,
          matches: { ...state.filters.matches, ...filters },
        },
      })),
      
      resetMatchesFilters: () => set((state) => ({
        filters: {
          ...state.filters,
          matches: {
            status: null,
            page: 1,
          },
        },
      })),
      
      setBetsFilters: (filters) => set((state) => ({
        filters: {
          ...state.filters,
          bets: { ...state.filters.bets, ...filters },
        },
      })),
      
      resetBetsFilters: () => set((state) => ({
        filters: {
          ...state.filters,
          bets: {
            status: null,
            matchId: null,
            page: 1,
          },
        },
      })),
      
      setTransactionsFilters: (filters) => set((state) => ({
        filters: {
          ...state.filters,
          transactions: { ...state.filters.transactions, ...filters },
        },
      })),
      
      resetTransactionsFilters: () => set((state) => ({
        filters: {
          ...state.filters,
          transactions: {
            type: null,
            status: null,
            userId: null,
            page: 1,
          },
        },
      })),
      
      // Resetar todos os filtros
      resetAllFilters: () => set((state) => ({
        filters: {
          users: { search: '', status: null, page: 1 },
          withdrawals: { status: null, page: 1 },
          matches: { status: null, page: 1 },
          bets: { status: null, matchId: null, page: 1 },
          transactions: { type: null, status: null, userId: null, page: 1 },
        },
      })),
      
      // ============================================================
      // AÇÕES - Sidebar
      // ============================================================
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // ============================================================
      // UTILITÁRIOS
      // ============================================================
      
      // Limpar todo o estado (útil no logout)
      clearStore: () => set({
        admin: null,
        pendingWithdrawalsCount: 0,
        filters: {
          users: { search: '', status: null, page: 1 },
          withdrawals: { status: null, page: 1 },
          matches: { status: null, page: 1 },
          bets: { status: null, matchId: null, page: 1 },
          transactions: { type: null, status: null, userId: null, page: 1 },
        },
        sidebarOpen: true,
      }),
    }),
    {
      name: 'sinucabet-admin-store',
      // Persistir apenas alguns campos
      partialize: (state) => ({
        admin: state.admin,
        filters: state.filters,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

export default useAdminStore;

