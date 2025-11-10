/**
 * ============================================================
 * API Client - SinucaBet
 * ============================================================
 * Funções para comunicação com o backend
 */

// Normalizar API_BASE_URL para garantir que termina com /api
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  // Se já termina com /api, retorna como está
  if (baseUrl.endsWith('/api')) {
    return baseUrl;
  }
  // Se não, adiciona /api no final
  return `${baseUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

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
      // Não logar erros 401 como erro (são normais quando não logado)
      if (response.status === 401) {
        // Silencioso - apenas lança o erro
      } else if (response.status >= 500) {
        console.error(`❌ [API] Erro ${response.status} em ${endpoint}:`, data.message);
      } else if (response.status >= 400) {
        console.log(`⚠️ [API] ${response.status} em ${endpoint}:`, data.message);
      }
      
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
    
    // Erro de rede ou parsing
    console.error('❌ [API] Erro de conexão:', error.message);
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
    
    // Retornar resposta completa com success (padronizado)
    return data;
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
   * Busca perfil do usuário autenticado
   */
  getProfile: async () => {
    return fetchAPI('/auth/profile');
  },

  /**
   * Atualiza perfil do usuário autenticado
   */
  updateProfile: async (profileData) => {
    return fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
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
    return data; // Retorna objeto completo { success, data }
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
    return data; // Retorna estrutura completa { success, message, data }
  },

  /**
   * Cria depósito
   */
  deposit: async (amount) => {
    const data = await fetchAPI('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return data; // Retorna estrutura completa
  },

  /**
   * Solicita saque
   */
  withdraw: async (amount, pixData) => {
    const data = await fetchAPI('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, ...pixData }),
    });
    return data; // Retorna estrutura completa
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
    return data; // Retorna estrutura completa
  },
};

// ============================================================
// Exportar tudo junto também
// ============================================================

// ============================================================
// FUNÇÕES GENÉRICAS PARA ADMIN PANEL
// ============================================================

/**
 * GET request genérico
 */
export const get = async (endpoint) => {
  return fetchAPI(endpoint, {
    method: 'GET',
  });
};

/**
 * POST request genérico
 */
export const post = async (endpoint, data = {}) => {
  return fetchAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request genérico
 */
export const patch = async (endpoint, data = {}) => {
  return fetchAPI(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request genérico
 */
export const put = async (endpoint, data = {}) => {
  return fetchAPI(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request genérico
 */
export const del = async (endpoint) => {
  return fetchAPI(endpoint, {
    method: 'DELETE',
  });
};

// ============================================================
// GAMES (usando a nova API de matches)
// ============================================================

/**
 * Busca jogos/partidas (usa nova API /api/matches)
 */
export const getGames = async (filters = {}) => {
  try {
    const params = new URLSearchParams({
      limit: filters.limit || 20,
      offset: filters.offset || 0,
      ...(filters.status && { status: filters.status }),
      ...(filters.sport && { sport: filters.sport }),
    });

    const data = await fetchAPI(`/matches?${params}`);
    
    // Mapear para formato esperado pelo frontend (GameCard e FeaturedGame)
    // Adaptando de player1/player2 para o formato que os componentes esperam
    const mappedGames = data.data.matches.map(match => {
      // Contar séries para exibir
      const totalSeries = match.series?.length || match.game_rules?.total_series || 3;
      
      return {
        id: match.id,
        // Nomes dos jogadores para compatibilidade com componentes
        player_a: match.player1?.name || 'Jogador 1',
        player_b: match.player2?.name || 'Jogador 2',
        player_a_name: match.player1?.nickname || match.player1?.name || 'Jogador 1',
        player_b_name: match.player2?.nickname || match.player2?.name || 'Jogador 2',
        // Dados completos dos jogadores
        player1: match.player1,
        player2: match.player2,
        // Modalidade e série
        modality: match.sport || 'sinuca',
        series: totalSeries,
        // Vantagens (se houver nas regras)
        player_a_advantage: 0,
        player_b_advantage: 0,
        // Total apostado por jogador (será preenchido quando tivermos apostas)
        player_a_total_bets: 0,
        player_b_total_bets: 0,
        // Status mapeado
        status: match.status === 'agendada' ? 'open' : 
                match.status === 'em_andamento' ? 'in_progress' : 
                match.status === 'finalizada' ? 'finished' : 'open',
        // Outros dados
        scheduled_at: match.scheduled_at,
        location: match.location,
        youtube_url: match.youtube_url,
        stream_active: match.stream_active,
        game_rules: match.game_rules,
        series_data: match.series || [],
        created_at: match.created_at,
        updated_at: match.updated_at
      };
    });

    return {
      success: true,
      data: {
        games: mappedGames,
        pagination: data.data.pagination
      }
    };
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    return {
      success: false,
      message: error.message || 'Erro ao buscar jogos'
    };
  }
};

// ============================================================
// Exportar tudo junto também
// ============================================================

// Exportar funções separadamente para compatibilidade
export const login = auth.login;
export const register = auth.register;
export const getProfile = auth.getProfile;
export const updateProfile = auth.updateProfile;
export const getWallet = wallet.get;
export const createDeposit = wallet.deposit;
export const createWithdraw = wallet.withdraw;
export const getTransactions = wallet.getTransactions;
export const getUserBets = bets.getUserBets;

// Aliases para compatibilidade com páginas antigas
export const getGame = matches.getById;
export const createBet = bets.create;

// ============================================================
// ADMIN
// ============================================================

export const admin = {
  /**
   * Cancela uma aposta (admin)
   */
  cancelBet: async (betId) => {
    const data = await fetchAPI(`/admin/bets/${betId}`, {
      method: 'DELETE',
    });
    return data;
  },
};

const api = {
  auth,
  players,
  matches,
  series,
  bets,
  wallet,
  admin,
};

export default api;
