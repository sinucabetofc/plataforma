/**
 * ============================================================
 * Admin Service - Serviço de Administração
 * ============================================================
 * Lógica de negócio para operações administrativas
 */

const { supabase } = require('../config/supabase.config');

class AdminService {
  // ============================================================
  // DASHBOARD & ESTATÍSTICAS
  // ============================================================

  /**
   * Busca estatísticas gerais do dashboard
   */
  async getDashboardStats() {
    try {
      // 1. Total de usuários (ativos e inativos)
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // 2. Total de jogos/partidas por status
      const { data: matchesStats, error: matchesError } = await supabase
        .from('matches')
        .select('status');

      const matchesByStatus = {
        open: 0,
        in_progress: 0,
        finished: 0,
        cancelled: 0,
        total: matchesStats?.length || 0
      };

      matchesStats?.forEach(match => {
        if (matchesByStatus[match.status] !== undefined) {
          matchesByStatus[match.status]++;
        }
      });

      // 3. Total apostado (hoje, mês e total)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const { data: betsToday } = await supabase
        .from('bets')
        .select('amount')
        .gte('created_at', today.toISOString());

      const { data: betsMonth } = await supabase
        .from('bets')
        .select('amount')
        .gte('created_at', startOfMonth.toISOString());

      const { data: betsTotal } = await supabase
        .from('bets')
        .select('amount');

      // Valores em centavos, converter para reais
      const totalBetsToday = (betsToday?.reduce((sum, bet) => sum + parseFloat(bet.amount), 0) || 0) / 100;
      const totalBetsMonth = (betsMonth?.reduce((sum, bet) => sum + parseFloat(bet.amount), 0) || 0) / 100;
      const totalBetsAll = (betsTotal?.reduce((sum, bet) => sum + parseFloat(bet.amount), 0) || 0) / 100;

      // 4. Saques pendentes
      const { data: pendingWithdrawals } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'withdraw')
        .eq('status', 'pending');

      // Valores em centavos, converter para reais
      const totalPendingWithdrawals = (pendingWithdrawals?.reduce(
        (sum, w) => sum + parseFloat(w.amount), 
        0
      ) || 0) / 100;

      const pendingWithdrawalsCount = pendingWithdrawals?.length || 0;

      // 5. Lucro da plataforma (8% dos saques aprovados)
      const { data: completedWithdrawals } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'withdraw')
        .eq('status', 'completed');

      // Valores em centavos, converter para reais
      const totalWithdrawn = (completedWithdrawals?.reduce(
        (sum, w) => sum + parseFloat(w.amount), 
        0
      ) || 0) / 100;

      const platformProfit = totalWithdrawn * 0.08;

      // 6. Novos usuários (últimos 7 dias, por dia)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDate.toISOString());

        last7Days.push({
          date: date.toISOString().split('T')[0],
          count: count || 0
        });
      }

      // 7. Apostas por dia (últimos 7 dias)
      const betsLast7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const { data: dayBets } = await supabase
          .from('bets')
          .select('amount')
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDate.toISOString());

        // Valores em centavos, converter para reais
        const total = (dayBets?.reduce((sum, bet) => sum + parseFloat(bet.amount), 0) || 0) / 100;

        betsLast7Days.push({
          date: date.toISOString().split('T')[0],
          total: total,
          count: dayBets?.length || 0
        });
      }

      return {
        users: {
          total: totalUsers || 0,
          active: activeUsers || 0,
          inactive: (totalUsers || 0) - (activeUsers || 0)
        },
        matches: matchesByStatus,
        bets: {
          today: totalBetsToday,
          month: totalBetsMonth,
          total: totalBetsAll
        },
        withdrawals: {
          pending: {
            count: pendingWithdrawalsCount,
            total: totalPendingWithdrawals
          },
          completed: {
            total: totalWithdrawn
          }
        },
        platform: {
          profit: platformProfit,
          profitPercentage: 8
        },
        charts: {
          newUsersLast7Days: last7Days,
          betsLast7Days: betsLast7Days
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar estatísticas',
        details: error.message
      };
    }
  }

  // ============================================================
  // USUÁRIOS
  // ============================================================

  /**
   * Lista todos os usuários com paginação e filtros
   */
  async getUsers({ page = 1, limit = 20, search = '', status = null }) {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          phone,
          cpf,
          is_active,
          role,
          created_at,
          wallet:wallet(balance, blocked_balance)
        `, { count: 'exact' });

      // Filtro de busca
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
      }

      // Filtro de status (ignorar se for null ou "null")
      if (status && status !== 'null' && status !== null) {
        query = query.eq('is_active', status === 'active');
      }

      // Paginação
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        users: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao listar usuários',
        details: error.message
      };
    }
  }

  /**
   * Busca detalhes de um usuário específico
   */
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          wallet:wallet(*)
        `)
        .eq('id', userId)
        .single();

      if (error || !data) {
        throw {
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado'
        };
      }

      return data;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao buscar usuário:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar usuário',
        details: error.message
      };
    }
  }

  /**
   * Atualiza status do usuário (bloquear/desbloquear)
   */
  async updateUserStatus(userId, isActive) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw {
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado'
        };
      }

      return data;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao atualizar status do usuário:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao atualizar status do usuário',
        details: error.message
      };
    }
  }

  /**
   * Busca transações de um usuário
   */
  async getUserTransactions(userId, { page = 1, limit = 20 }) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        transactions: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar transações do usuário:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar transações',
        details: error.message
      };
    }
  }

  /**
   * Busca apostas de um usuário
   */
  async getUserBets(userId, { page = 1, limit = 20 }) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('bets')
        .select(`
          *,
          series:series(
            id,
            series_number,
            match:matches(
              id,
              player_a_id,
              player_b_id
            )
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        bets: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar apostas do usuário:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar apostas',
        details: error.message
      };
    }
  }

  // ============================================================
  // SAQUES (WITHDRAWALS)
  // ============================================================

  /**
   * Lista solicitações de saque
   */
  async getWithdrawals({ page = 1, limit = 20, status = null }) {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('transactions')
        .select(`
          *,
          user:users(id, name, email, cpf, phone, pix_key, pix_type)
        `, { count: 'exact' })
        .eq('type', 'withdraw');

      // Filtro por status
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      // Calcular taxa e líquido para cada saque
      const withdrawalsWithFee = data.map(withdrawal => {
        const amount = parseFloat(withdrawal.amount);
        const fee = amount * 0.08;
        const netAmount = amount - fee;

        return {
          ...withdrawal,
          fee,
          netAmount
        };
      });

      return {
        withdrawals: withdrawalsWithFee,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao listar saques:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao listar saques',
        details: error.message
      };
    }
  }

  /**
   * Busca detalhes de um saque específico
   */
  async getWithdrawalById(withdrawalId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          user:users(id, name, email, cpf, phone, pix_key, pix_type)
        `)
        .eq('id', withdrawalId)
        .eq('type', 'withdraw')
        .single();

      if (error || !data) {
        throw {
          code: 'NOT_FOUND',
          message: 'Saque não encontrado'
        };
      }

      const amount = parseFloat(data.amount);
      const fee = amount * 0.08;
      const netAmount = amount - fee;

      return {
        ...data,
        fee,
        netAmount
      };
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao buscar saque:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar saque',
        details: error.message
      };
    }
  }

  /**
   * Aprova um saque
   */
  async approveWithdrawal(withdrawalId) {
    try {
      // Atualizar status para completed
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawalId)
        .eq('type', 'withdraw')
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw {
          code: 'NOT_FOUND',
          message: 'Saque não encontrado ou já processado'
        };
      }

      return data;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao aprovar saque:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao aprovar saque',
        details: error.message
      };
    }
  }

  /**
   * Recusa um saque
   */
  async rejectWithdrawal(withdrawalId, reason) {
    try {
      // 1. Buscar dados do saque
      const { data: withdrawal, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', withdrawalId)
        .eq('type', 'withdraw')
        .eq('status', 'pending')
        .single();

      if (fetchError || !withdrawal) {
        throw {
          code: 'NOT_FOUND',
          message: 'Saque não encontrado ou já processado'
        };
      }

      // 2. Atualizar status para failed
      const { data: updatedWithdrawal, error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          description: `Recusado: ${reason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawalId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // 3. Devolver valor para saldo disponível do usuário
      const { error: walletError } = await supabase
        .from('wallet')
        .update({
          balance: supabase.raw(`balance + ${withdrawal.amount}`)
        })
        .eq('user_id', withdrawal.user_id);

      if (walletError) {
        throw walletError;
      }

      return updatedWithdrawal;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao recusar saque:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao recusar saque',
        details: error.message
      };
    }
  }

  // ============================================================
  // PARTIDAS/JOGOS
  // ============================================================

  /**
   * Lista partidas com filtros
   */
  async getMatches({ page = 1, limit = 20, status = null }) {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('matches')
        .select(`
          *,
          player_a:players!player_a_id(id, name),
          player_b:players!player_b_id(id, name)
        `, { count: 'exact' });

      // Filtro por status
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        matches: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao listar partidas:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao listar partidas',
        details: error.message
      };
    }
  }

  /**
   * Busca detalhes de uma partida
   */
  async getMatchById(matchId) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player_a:players!player_a_id(*),
          player_b:players!player_b_id(*),
          series:series(*)
        `)
        .eq('id', matchId)
        .single();

      if (error || !data) {
        throw {
          code: 'NOT_FOUND',
          message: 'Partida não encontrada'
        };
      }

      return data;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao buscar partida:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar partida',
        details: error.message
      };
    }
  }

  /**
   * Cria uma nova partida
   */
  async createMatch(matchData) {
    try {
      // 1. Criar ou buscar jogadores
      const playerAData = await this.findOrCreatePlayer(matchData.player_a_name);
      const playerBData = await this.findOrCreatePlayer(matchData.player_b_name);

      // 2. Criar partida
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          player_a_id: playerAData.id,
          player_b_id: playerBData.id,
          modality: matchData.modality,
          advantages: matchData.advantages || null,
          total_series: matchData.total_series || 1,
          youtube_url: matchData.youtube_url || null,
          status: 'open'
        })
        .select()
        .single();

      if (matchError) {
        throw matchError;
      }

      // 3. Criar séries
      const series = [];
      for (let i = 1; i <= matchData.total_series; i++) {
        const { data: serie, error: serieError } = await supabase
          .from('series')
          .insert({
            match_id: match.id,
            series_number: i,
            status: 'open'
          })
          .select()
          .single();

        if (serieError) {
          throw serieError;
        }

        series.push(serie);
      }

      return {
        ...match,
        series
      };
    } catch (error) {
      console.error('Erro ao criar partida:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao criar partida',
        details: error.message
      };
    }
  }

  /**
   * Encontra ou cria um jogador
   */
  async findOrCreatePlayer(playerName) {
    try {
      // Tentar encontrar jogador existente
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('name', playerName)
        .single();

      if (existingPlayer) {
        return existingPlayer;
      }

      // Criar novo jogador
      const { data: newPlayer, error } = await supabase
        .from('players')
        .insert({ name: playerName })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return newPlayer;
    } catch (error) {
      console.error('Erro ao buscar/criar jogador:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao processar jogador',
        details: error.message
      };
    }
  }

  /**
   * Atualiza uma partida
   */
  async updateMatch(matchId, updateData) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw {
          code: 'NOT_FOUND',
          message: 'Partida não encontrada'
        };
      }

      return data;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao atualizar partida:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao atualizar partida',
        details: error.message
      };
    }
  }

  /**
   * Deleta uma partida
   */
  async deleteMatch(matchId) {
    try {
      // Verificar se há apostas na partida
      const { data: bets } = await supabase
        .from('bets')
        .select('id')
        .eq('match_id', matchId)
        .limit(1);

      if (bets && bets.length > 0) {
        throw {
          code: 'CONFLICT',
          message: 'Não é possível deletar partida com apostas associadas'
        };
      }

      // Deletar séries primeiro (cascade)
      await supabase
        .from('series')
        .delete()
        .eq('match_id', matchId);

      // Deletar partida
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      if (error.code === 'CONFLICT') throw error;
      
      console.error('Erro ao deletar partida:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao deletar partida',
        details: error.message
      };
    }
  }

  /**
   * Finaliza uma partida
   */
  async finalizeMatch(matchId, winnerId) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({
          status: 'finished',
          winner_id: winnerId,
          finished_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw {
          code: 'NOT_FOUND',
          message: 'Partida não encontrada'
        };
      }

      return data;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao finalizar partida:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao finalizar partida',
        details: error.message
      };
    }
  }

  // ============================================================
  // APOSTAS
  // ============================================================

  /**
   * Lista todas as apostas
   */
  async getBets({ page = 1, limit = 20, status = null, matchId = null }) {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('bets')
        .select(`
          *,
          user:users(id, name, email),
          series:series(
            id,
            series_number,
            match:matches(
              id,
              player_a:players!player_a_id(id, name),
              player_b:players!player_b_id(id, name)
            )
          )
        `, { count: 'exact' });

      // Filtros
      if (status) {
        query = query.eq('status', status);
      }

      if (matchId) {
        query = query.eq('match_id', matchId);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        bets: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao listar apostas:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao listar apostas',
        details: error.message
      };
    }
  }

  // ============================================================
  // TRANSAÇÕES
  // ============================================================

  /**
   * Lista todas as transações
   */
  async getTransactions({ page = 1, limit = 20, type = null, status = null, userId = null }) {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('transactions')
        .select(`
          *,
          user:users(id, name, email)
        `, { count: 'exact' });

      // Filtros
      if (type) {
        query = query.eq('type', type);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        transactions: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao listar transações:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao listar transações',
        details: error.message
      };
    }
  }
}

module.exports = new AdminService();

