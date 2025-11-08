import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const useInfluencerStore = create(
  persist(
    (set, get) => ({
      influencer: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login do influencer
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post(`${API_URL}/api/influencers/auth/login`, {
            email,
            password
          });

          const { influencer, token } = response.data.data;

          set({
            influencer,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
          
          set({
            influencer: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage
          });

          return { success: false, error: errorMessage };
        }
      },

      /**
       * Logout do influencer
       */
      logout: () => {
        set({
          influencer: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      /**
       * Buscar dados do influencer autenticado
       */
      fetchInfluencer: async () => {
        const { token } = get();
        
        if (!token) {
          return { success: false, error: 'Não autenticado' };
        }

        set({ isLoading: true, error: null });

        try {
          const response = await axios.get(`${API_URL}/api/influencers/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const influencer = response.data.data;

          set({
            influencer,
            isLoading: false,
            error: null
          });

          return { success: true, data: influencer };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Erro ao buscar dados';
          
          // Se token inválido/expirado, fazer logout
          if (error.response?.status === 401) {
            get().logout();
          }

          set({
            isLoading: false,
            error: errorMessage
          });

          return { success: false, error: errorMessage };
        }
      },

      /**
       * Atualizar perfil
       */
      updateProfile: async (data) => {
        const { token } = get();
        
        if (!token) {
          return { success: false, error: 'Não autenticado' };
        }

        set({ isLoading: true, error: null });

        try {
          const response = await axios.patch(
            `${API_URL}/api/influencers/auth/profile`,
            data,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          const influencer = response.data.data;

          set({
            influencer,
            isLoading: false,
            error: null
          });

          return { success: true, data: influencer };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Erro ao atualizar perfil';
          
          set({
            isLoading: false,
            error: errorMessage
          });

          return { success: false, error: errorMessage };
        }
      },

      /**
       * Limpar erro
       */
      clearError: () => set({ error: null })
    }),
    {
      name: 'influencer-auth-storage',
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);

export default useInfluencerStore;

