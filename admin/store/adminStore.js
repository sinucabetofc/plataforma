import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useAdminStore = create((set) => ({
  // Estado de autenticação
  isAuthenticated: false,
  admin: null,
  token: null,

  // Função de login
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Verificar se o usuário é admin
        if (user.role !== 'admin') {
          return false;
        }

        // Salvar no localStorage
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));

        set({
          isAuthenticated: true,
          admin: user,
          token,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  },

  // Função de logout
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    set({
      isAuthenticated: false,
      admin: null,
      token: null,
    });
  },

  // Função para restaurar sessão
  restoreSession: () => {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        if (user.role === 'admin') {
          set({
            isAuthenticated: true,
            admin: user,
            token,
          });
          return true;
        }
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
      }
    }

    return false;
  },
}));

export default useAdminStore;
