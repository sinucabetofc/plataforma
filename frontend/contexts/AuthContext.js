import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { getProfile } from '../utils/api';
import { getToken, getUser, doLogin as saveAuth, doLogout as clearAuth } from '../utils/auth';

/**
 * Context de Autenticação
 * Sistema otimizado para múltiplos acessos simultâneos
 */
const AuthContext = createContext({});

/**
 * Provider de Autenticação
 * Gerencia estado global do usuário autenticado
 */
export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  /**
   * Carrega usuário do localStorage e valida no backend
   * Otimizado para não fazer múltiplas requisições
   * CORRIGIDO: Não limpa auth em erros de rede
   */
  const loadUser = useCallback(async () => {
    try {
      const token = getToken();
      const savedUser = getUser();

      // Se não tem token, não está autenticado
      if (!token) {
        console.log('🔓 [AUTH] Nenhum token encontrado - usuário não logado');
        setUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      // Se tem token e usuário salvo, usa o cache primeiro (UX)
      // Isso mantém o usuário logado durante o carregamento
      if (savedUser) {
        console.log('✅ [AUTH] Carregando sessão:', savedUser.email);
        setUser(savedUser);
        setLoading(false);
        setInitialized(true);
      }

      // Valida token no backend em background (não bloqueia a UI)
      try {
        const result = await getProfile();
        
        if (result.success) {
          const userData = result.data.data || result.data;
          setUser(userData);
          // Atualiza localStorage com dados mais recentes
          saveAuth(token, userData);
          console.log('✅ [AUTH] Usuário validado:', userData.email);
        } else if (result.statusCode === 401) {
          // Token inválido - fazer logout silencioso
          console.log('🔓 [AUTH] Token expirado, fazendo logout');
          setUser(null);
          clearAuth();
        } else if (result.isNetworkError) {
          // Em erro de rede, mantém o usuário logado
          console.log('🌐 [AUTH] Sem conexão, mantendo usuário logado');
          // Mantém savedUser
        }
      } catch (error) {
        // Erros 401 são normais quando não logado - não logar como erro
        if (error.status === 401) {
          console.log('🔓 [AUTH] Não autenticado');
          setUser(null);
          clearAuth();
        } else {
          // Apenas logar erros inesperados
          console.log('⚠️ [AUTH] Mantendo sessão local:', error.message);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      // Não limpa auth aqui, apenas em caso de token explicitamente inválido
    } finally {
      if (!initialized) {
        setLoading(false);
        setInitialized(true);
      }
    }
  }, [initialized]);

  /**
   * Inicializa autenticação apenas uma vez
   */
  useEffect(() => {
    if (!initialized) {
      loadUser();
    }
  }, [initialized, loadUser]);

  /**
   * Monitora mudanças de rota para revalidar autenticação
   */
  useEffect(() => {
    const handleRouteChange = () => {
      // Revalida usuário a cada mudança de rota (sem loading)
      const token = getToken();
      const savedUser = getUser();
      
      if (token && savedUser) {
        setUser(savedUser);
      } else {
        setUser(null);
      }
    };

    router.events?.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  /**
   * Função de login
   * Salva token e usuário, atualiza estado global
   */
  const login = useCallback((token, userData) => {
    saveAuth(token, userData);
    setUser(userData);
  }, []);

  /**
   * Atualiza dados do usuário
   * Útil após edição de perfil
   */
  const updateUser = useCallback((userData) => {
    const token = getToken();
    if (token && userData) {
      saveAuth(token, userData);
      setUser(userData);
    }
  }, []);

  /**
   * Função de logout
   * Limpa token e usuário, redireciona
   */
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/');
  }, [router]);

  /**
   * Recarrega dados do usuário do backend
   * CORRIGIDO: Não limpa auth em erros de rede
   */
  const refreshUser = useCallback(async () => {
    try {
      const result = await getProfile();
      if (result.success) {
        const userData = result.data.data || result.data;
        updateUser(userData);
        console.log('🔄 [AUTH] Dados atualizados:', userData.email);
        return userData;
      } else if (result.statusCode === 401) {
        // Token inválido - fazer logout silencioso
        console.log('🔓 [AUTH] Sessão expirada, redirecionando...');
        logout();
        return null;
      } else {
        // Outros erros (incluindo rede) - mantém usuário
        console.log('🌐 [AUTH] Mantendo dados locais');
        return user;
      }
    } catch (error) {
      // Não logar 401 como erro
      if (error.status !== 401) {
        console.log('⚠️ [AUTH] Mantendo sessão:', error.message);
      }
      return user; // Retorna usuário atual em vez de null
    }
  }, [updateUser, user, logout]);

  const value = {
    user,
    loading,
    authenticated: !!user,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar autenticação
 * @example
 * const { user, authenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

/**
 * HOC para proteger rotas que requerem autenticação
 * @example
 * export default withAuth(MinhaPage);
 */
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { authenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !authenticated) {
        router.push('/');
      }
    }, [loading, authenticated, router]);

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-verde-neon" />
        </div>
      );
    }

    if (!authenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * HOC para redirecionar usuários autenticados
 * Útil para páginas de login
 * @example
 * export default withGuest(LoginPage);
 */
export function withGuest(Component) {
  return function GuestComponent(props) {
    const { authenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && authenticated) {
        router.push('/home');
      }
    }, [loading, authenticated, router]);

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-verde-neon" />
        </div>
      );
    }

    if (authenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

export default AuthContext;

