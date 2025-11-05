/**
 * ============================================================
 * API Client - SinucaBet
 * ============================================================
 * Funções para comunicação com o backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Classe para erros de API
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Função auxiliar para fazer requisições
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Headers padrão
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Adicionar token se existir (busca de cookies)
  if (typeof window !== 'undefined') {
    // Importação dinâmica para evitar problemas de SSR
    const Cookies = (await import('js-cookie')).default;
    const token = Cookies.get('sinucabet_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.message || 'Erro na requisição',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    console.error('Erro na requisição:', error);
    throw new APIError('Erro de conexão com o servidor', 500, null);
  }
}

// ============================================================
// AUTH
// ============================================================

export const auth = {
  /**
   * Faz login do usuário
   */
  login: async (email, password) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Salvar token nos cookies
    if (typeof window !== 'undefined' && data.data?.token) {
      const Cookies = (await import('js-cookie')).default;
      Cookies.set('sinucabet_token', data.data.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
    }
    
    return data.data;
  },

  /**
   * Registra novo usuário
   */
  register: async (userData) => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Faz logout
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      const Cookies = require('js-cookie').default;
      Cookies.remove('sinucabet_token', { path: '/' });
      Cookies.remove('sinucabet_user', { path: '/' });
    }
  },
};

// ============================================================
// PLAYERS
// ============================================================

export const players = {
  /**
   * Lista jogadores
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams({
      active: filters.active !== undefined ? filters.active : 'true',
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      ...(filters.search && { search: filters.search }),
    });

    const data = await fetchAPI(`/players?${params}`);
    return data.data;
  },

  /**
   * Busca jogador por ID
   */
  getById: async (id) => {
    const data = await fetchAPI(`/players/${id}`);
    return data.data;
  },

  /**
   * Busca estatísticas gerais
   */
  getStats: async () => {
    const data = await fetchAPI('/players/stats');
    return data.data;
  },
};

// ============================================================
// MATCHES
// ============================================================

export const matches = {
  /**
   * Lista partidas com filtros
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams({
      limit: filters.limit || 20,
      offset: filters.offset || 0,
      ...(filters.status && { status: filters.status }),
      ...(filters.sport && { sport: filters.sport }),
      ...(filters.player_id && { player_id: filters.player_id }),
      ...(filters.created_by && { created_by: filters.created_by }),
      ...(filters.influencer_id && { influencer_id: filters.influencer_id }),
    });

    const data = await fetchAPI(`/matches?${params}`);
    return data.data;
  },

  /**
   * Busca partida por ID (com séries)
   */
  getById: async (id) => {
    const data = await fetchAPI(`/matches/${id}`);
    return data.data;
  },

  /**
   * Cria nova partida (Admin/Parceiro)
   */
  create: async (matchData) => {
    const data = await fetchAPI('/matches', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
    return data.data;
  },

  /**
   * Atualiza partida
   */
  update: async (id, updateData) => {
    const data = await fetchAPI(`/matches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    return data.data;
  },

  /**
   * Atualiza status da partida
   */
  updateStatus: async (id, status) => {
    const data = await fetchAPI(`/matches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return data.data;
  },
};

// ============================================================
// SERIES
// ============================================================

export const series = {
  /**
   * Busca séries de uma partida
   */
  getByMatch: async (matchId) => {
    const data = await fetchAPI(`/series/match/${matchId}`);
    return data.data;
  },

  /**
   * Busca série por ID
   */
  getById: async (id) => {
    const data = await fetchAPI(`/series/${id}`);
    return data.data;
  },

  /**
   * Libera série para apostas (Admin)
   */
  release: async (id) => {
    const data = await fetchAPI(`/series/${id}/release`, {
      method: 'POST',
    });
    return data.data;
  },

  /**
   * Inicia série (Admin)
   */
  start: async (id) => {
    const data = await fetchAPI(`/series/${id}/start`, {
      method: 'POST',
    });
    return data.data;
  },

  /**
   * Finaliza série com vencedor (Admin)
   */
  finish: async (id, resultData) => {
    const data = await fetchAPI(`/series/${id}/finish`, {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
    return data.data;
  },

  /**
   * Atualiza placar (Admin)
   */
  updateScore: async (id, scoreData) => {
    const data = await fetchAPI(`/series/${id}/score`, {
      method: 'PATCH',
      body: JSON.stringify(scoreData),
    });
    return data.data;
  },

  /**
   * Cancela série (Admin)
   */
  cancel: async (id) => {
    const data = await fetchAPI(`/series/${id}/cancel`, {
      method: 'POST',
    });
    return data.data;
  },

  /**
   * Busca séries finalizadas (últimos resultados)
   */
  getFinished: async (filters = {}) => {
    const params = new URLSearchParams({
      limit: filters.limit || 5,
      offset: filters.offset || 0,
    });
    const data = await fetchAPI(`/series/finished?${params}`);
    return data.data;
  },
};

// ============================================================
// BETS
// ============================================================

export const bets = {
  /**
   * Cria nova aposta
   */
  create: async (betData) => {
    const data = await fetchAPI('/bets', {
      method: 'POST',
      body: JSON.stringify(betData),
    });
    return data.data;
  },

  /**
   * Busca apostas de uma série
   */
  getBySerie: async (serieId) => {
    const data = await fetchAPI(`/bets/serie/${serieId}`);
    return data.data;
  },

  /**
   * Busca apostas do usuário
   */
  getUserBets: async (filters = {}) => {
    const params = new URLSearchParams({
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      ...(filters.status && { status: filters.status }),
    });

    const data = await fetchAPI(`/bets/user?${params}`);
    return data.data;
  },

  /**
   * Busca apostas recentes
   */
  getRecent: async (limit = 10) => {
    const data = await fetchAPI(`/bets/recent?limit=${limit}`);
    return data.data;
  },

  /**
   * Cancela aposta
   */
  cancel: async (id) => {
    const data = await fetchAPI(`/bets/${id}`, {
      method: 'DELETE',
    });
    return data.data;
  },
};

// ============================================================
// WALLET
// ============================================================

export const wallet = {
  /**
   * Busca carteira do usuário
   */
  get: async () => {
    const data = await fetchAPI('/wallet');
    return data.data;
  },

  /**
   * Cria depósito
   */
  deposit: async (amount) => {
    const data = await fetchAPI('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return data.data;
  },

  /**
   * Solicita saque
   */
  withdraw: async (amount, pixData) => {
    const data = await fetchAPI('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, ...pixData }),
    });
    return data.data;
  },

  /**
   * Busca extrato de transações
   */
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams({
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      ...(filters.type && { type: filters.type }),
    });

    const data = await fetchAPI(`/wallet/transactions?${params}`);
    return data.data;
  },
};

// ============================================================
// Exportar tudo junto também
// ============================================================

// ============================================================
// FUNÇÕES DE COMPATIBILIDADE (API Antiga)
// ============================================================

/**
 * @deprecated Use api.matches.getAll() instead
 */
export async function getGames(filters = {}) {
  return matches.getAll(filters);
}

/**
 * @deprecated Use api.bets.getRecent() instead
 */
export async function getRecentBets(limit = 10) {
  return bets.getRecent(limit);
}

/**
 * @deprecated Use api.wallet.get() instead
 */
export async function getWallet() {
  const data = await wallet.get();
  return { success: true, data };
}

/**
 * @deprecated Use api.wallet.deposit() instead
 */
export async function createDeposit(amount) {
  const data = await wallet.deposit(amount);
  return { success: true, data };
}

/**
 * @deprecated Use api.auth.register() instead
 */
export async function register(userData) {
  const data = await auth.register(userData);
  return data;
}

/**
 * Função de login compatível com o AuthModal
 */
export async function login(credentials) {
  try {
    const data = await auth.login(credentials.email, credentials.password);
    return { success: true, data: { data } };
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Erro ao fazer login',
      statusCode: error.status || 500
    };
  }
}

/**
 * Função getProfile para o AuthContext
 */
export async function getProfile() {
  try {
    const response = await fetchAPI('/auth/profile');
    // A API retorna { success, message, data }, então pegamos apenas response.data
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Erro ao buscar perfil',
      statusCode: error.status || 500,
      isNetworkError: error.status === 500
    };
  }
}

/**
 * Função updateProfile para atualizar dados do perfil
 */
export async function updateProfile(data) {
  try {
    const response = await fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    // A API retorna { success, message, data }, então pegamos apenas response.data
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Erro ao atualizar perfil',
      statusCode: error.status || 500
    };
  }
}

/**
 * Função getUserBets para buscar apostas do usuário
 */
export async function getUserBets(filters = {}) {
  try {
    const params = new URLSearchParams({
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      ...(filters.status && { status: filters.status }),
    });

    const response = await fetchAPI(`/bets/user?${params}`);
    
    // A API retorna { success, message, data }, então pegamos apenas response.data
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Erro ao buscar apostas',
      statusCode: error.status || 500
    };
  }
}

// ============================================================
// Exportar tudo junto também
// ============================================================

const api = {
  auth,
  players,
  matches,
  series,
  bets,
  wallet,
};

export default api;
