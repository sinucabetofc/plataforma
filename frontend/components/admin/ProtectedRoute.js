/**
 * ============================================================
 * ProtectedRoute Component - HOC para proteção de rotas
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, getToken, getUser, saveUser, clearAuth } from '../../utils/auth';
import { get } from '../../utils/api';
import toast from 'react-hot-toast';
import Loader from './Loader';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [router]);

  const checkAuth = async () => {
    try {
      // 1. Verificar se há token
      if (!isAuthenticated()) {
        console.log('❌ Não autenticado');
        router.replace('/admin/login');
        return;
      }

      // 2. Verificar se já tem usuário salvo nos cookies
      const savedUser = getUser();
      console.log('👤 Usuário salvo:', savedUser);
      
      if (savedUser && savedUser.role === 'admin') {
        console.log('✅ Usuário já é admin (cookies)');
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // 3. Se não tem nos cookies, verificar via API
      console.log('🔍 Verificando role via API...');
      const response = await get('/auth/profile');
      console.log('📡 Resposta da API:', response);
      
      if (!response.success || !response.data) {
        console.error('❌ Resposta inválida da API');
        // Limpar cookies inválidos
        clearAuth();
        router.replace('/admin/login');
        return;
      }

      const user = response.data;

      // 4. Verificar se é admin
      if (user.role !== 'admin') {
        console.warn('❌ Usuário não é admin:', user.role);
        toast.error('Acesso negado. Você não tem permissão de administrador.');
        clearAuth();
        router.replace('/');
        return;
      }

      console.log('✅ Usuário é admin!');
      
      // 5. Salvar dados do usuário
      saveUser(user);
      setAuthorized(true);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      // Limpar cookies em caso de erro (token expirado, inválido, etc)
      clearAuth();
      router.replace('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-admin-black flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-admin-text-secondary">
            Verificando permissões...
          </p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-Order Component para proteção de páginas
 */
export function withAdminAuth(Component) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

