/**
 * Gerenciamento de autenticação JWT com Cookies
 */

import Cookies from 'js-cookie';

const TOKEN_KEY = 'sinucabet_token';
const USER_KEY = 'sinucabet_user';

// Configurações dos cookies
const COOKIE_OPTIONS = {
  expires: 7, // 7 dias
  secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
  sameSite: 'strict', // Proteção CSRF
  path: '/', // Disponível em todo o site
};

/**
 * Salvar token JWT nos cookies
 */
export const saveToken = (token) => {
  if (typeof window !== 'undefined') {
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
  }
};

/**
 * Obter token JWT dos cookies
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return Cookies.get(TOKEN_KEY);
  }
  return null;
};

/**
 * Remover token dos cookies
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    Cookies.remove(TOKEN_KEY, { path: '/' });
  }
};

/**
 * Salvar dados do usuário nos cookies
 */
export const saveUser = (user) => {
  if (typeof window !== 'undefined') {
    Cookies.set(USER_KEY, JSON.stringify(user), COOKIE_OPTIONS);
  }
};

/**
 * Obter dados do usuário dos cookies
 */
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = Cookies.get(USER_KEY);
    // Verificar se é null, undefined ou string "undefined"
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Erro ao fazer parse do usuário:', error);
      return null;
    }
  }
  return null;
};

/**
 * Remover dados do usuário dos cookies
 */
export const removeUser = () => {
  if (typeof window !== 'undefined') {
    Cookies.remove(USER_KEY, { path: '/' });
  }
};

/**
 * Verificar se o usuário está autenticado
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const token = getToken();
  return !!token && token !== 'undefined' && token !== 'null';
};

/**
 * Limpar toda autenticação (logout)
 */
export const clearAuth = () => {
  removeToken();
  removeUser();
};

/**
 * Fazer login (salvar token e dados do usuário)
 */
export const doLogin = (token, user) => {
  saveToken(token);
  saveUser(user);
};

/**
 * Fazer logout
 */
export const doLogout = () => {
  clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

/**
 * Verificar se precisa redirecionar para login
 * Usar em getServerSideProps ou useEffect
 */
export const requireAuth = () => {
  if (typeof window !== 'undefined' && !isAuthenticated()) {
    window.location.href = '/';
    return false;
  }
  return true;
};

/**
 * Redirecionar para página inicial se já estiver autenticado
 * Usar em páginas de login/register
 */
export const redirectIfAuthenticated = (router) => {
  if (typeof window !== 'undefined' && isAuthenticated()) {
    router.push('/wallet');
    return true;
  }
  return false;
};

