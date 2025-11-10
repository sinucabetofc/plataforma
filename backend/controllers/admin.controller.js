/**
 * ============================================================
 * Admin Controller - Controlador de Admin
 * ============================================================
 */

const { supabase } = require('../config/supabase.config');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/response.util');
const matchesService = require('../services/matches.service');
const fakeStatsService = require('../services/fake-stats.service');

class AdminController {
  /**
   * GET /api/admin/dashboard/stats
   * Retorna estatísticas do dashboard admin
   */
  async getDashboardStats(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Acesso negado. Apenas administradores.');
      }

      // 1. Estatísticas de Usuários
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, is_active, created_at');

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
      }

      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(u => u.is_active).length || 0;

      // 2. Estatísticas de Partidas
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('id, status');

      if (matchesError) {
        console.error('Erro ao buscar partidas:', matchesError);
      }

      const openMatches = matchesData?.filter(m => m.status === 'open').length || 0;
      const scheduledMatches = matchesData?.filter(m => m.status === 'agendada').length || 0;
      const inProgressMatches = matchesData?.filter(m => m.status === 'em_andamento').length || 0;
      const finishedMatches = matchesData?.filter(m => m.status === 'finalizada').length || 0;

      // 3. Estatísticas de Apostas
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select('id, amount, created_at, status');

      if (betsError) {
        console.error('Erro ao buscar apostas:', betsError);
      }

      // Somar valores em centavos e converter para reais
      const totalBetsInCents = betsData?.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0) || 0;
      const totalBets = totalBetsInCents / 100;

      // Calcular total de apostas CASADAS (status = 'aceita')
      const matchedBetsData = betsData?.filter(bet => bet.status === 'aceita') || [];
      const totalMatchedBetsInCents = matchedBetsData.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0) || 0;
      const totalMatchedBets = totalMatchedBetsInCents / 100;
      
      // Apostas do mês
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthBets = betsData?.filter(bet => {
        return new Date(bet.created_at) >= firstDayOfMonth;
      }) || [];
      const monthBetsTotalInCents = monthBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0) || 0;
      const monthBetsTotal = monthBetsTotalInCents / 100;

      // Apostas do dia
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayBets = betsData?.filter(bet => {
        return new Date(bet.created_at) >= startOfToday;
      }) || [];
      const todayBetsTotalInCents = todayBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0) || 0;
      const todayBetsTotal = todayBetsTotalInCents / 100;

      // Cadastros do dia
      const todayUsers = usersData?.filter(user => {
        return new Date(user.created_at) >= startOfToday;
      }) || [];
      const todayUsersCount = todayUsers.length;

      // 4. Estatísticas de Transações
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id, amount, status, type, created_at');

      if (transactionsError) {
        console.error('Erro ao buscar transações:', transactionsError);
      }

      // Filtrar saques de APOSTADORES
      const userWithdrawalsData = transactionsData?.filter(t => t.type === 'saque') || [];
      const pendingUserWithdrawals = userWithdrawalsData.filter(w => w.status === 'pending');
      const completedUserWithdrawals = userWithdrawalsData.filter(w => w.status === 'completed');

      // Buscar saques de PARCEIROS
      const { data: influencerWithdrawalsData, error: influencerWithdrawalsError } = await supabase
        .from('influencer_withdrawals')
        .select('id, amount, status, requested_at');

      if (influencerWithdrawalsError) {
        console.error('Erro ao buscar saques de parceiros:', influencerWithdrawalsError);
      }

      const pendingInfluencerWithdrawals = influencerWithdrawalsData?.filter(w => w.status === 'pending') || [];
      const completedInfluencerWithdrawals = influencerWithdrawalsData?.filter(w => w.status === 'approved') || [];

      // Combinar saques de apostadores e parceiros
      const pendingWithdrawals = [...pendingUserWithdrawals, ...pendingInfluencerWithdrawals];
      const completedWithdrawals = [...completedUserWithdrawals, ...completedInfluencerWithdrawals];

      // Depósitos do dia
      const todayDeposits = transactionsData?.filter(t => {
        return t.type === 'deposit' && 
               t.status === 'completed' &&
               new Date(t.created_at) >= startOfToday;
      }) || [];
      const todayDepositsTotalInCents = todayDeposits.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0) || 0;
      const todayDepositsTotal = todayDepositsTotalInCents / 100;

      // 5. Estatísticas de Carteiras (Wallets)
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallet')
        .select('balance, total_deposited, blocked_balance');

      if (walletsError) {
        console.error('Erro ao buscar carteiras:', walletsError);
      }

      // Saldo total dos jogadores (soma de todos os saldos)
      const totalPlayersBalanceInCents = walletsData?.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0) || 0;
      const totalPlayersBalance = totalPlayersBalanceInCents / 100;

      // Saldo total "casado" (soma de todos os depósitos reais feitos pelos jogadores)
      const totalRealDepositsInCents = walletsData?.reduce((sum, w) => sum + parseFloat(w.total_deposited || 0), 0) || 0;
      const totalRealDeposits = totalRealDepositsInCents / 100;

      // Saldo fake total (diferença entre saldo total e saldo de depósitos reais)
      // Isso representa o quanto foi adicionado manualmente pelo admin
      const totalFakeBalance = totalPlayersBalance - totalRealDeposits;

      // Calcular totais (apostadores em centavos, parceiros em reais)
      const pendingUserTotal = pendingUserWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0) / 100;
      const pendingInfluencerTotal = pendingInfluencerWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
      const pendingWithdrawalsTotal = pendingUserTotal + pendingInfluencerTotal;
      
      const completedUserTotal = completedUserWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0) / 100;
      const completedInfluencerTotal = completedInfluencerWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
      const completedWithdrawalsTotal = completedUserTotal + completedInfluencerTotal;

      // 6. Separar saques FAKE vs REAL
      // Buscar todos os saques (apostadores)
      const allUserWithdrawals = transactionsData?.filter(t => t.type === 'saque') || [];
      
      // Identificar saques fake (origem: admin_credit, saldo fake)
      const fakeWithdrawals = allUserWithdrawals.filter(w => w.metadata?.is_fake_balance === true);
      const realWithdrawals = allUserWithdrawals.filter(w => !w.metadata?.is_fake_balance);
      
      const totalFakeWithdrawn = fakeWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0) / 100;
      const totalRealWithdrawn = realWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0) / 100;

      // Saques por período (APENAS REAIS)
      const todayRealWithdrawals = realWithdrawals.filter(w => {
        return w.status === 'completed' && new Date(w.created_at) >= startOfToday;
      });
      const todayWithdrawnTotal = todayRealWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0) / 100;

      // Últimos 7 dias
      const last7DaysDate = new Date();
      last7DaysDate.setDate(last7DaysDate.getDate() - 7);
      const last7DaysWithdrawals = realWithdrawals.filter(w => {
        return w.status === 'completed' && new Date(w.created_at) >= last7DaysDate;
      });
      const last7DaysWithdrawnTotal = last7DaysWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0) / 100;

      // Este mês
      const monthWithdrawals = realWithdrawals.filter(w => {
        return w.status === 'completed' && new Date(w.created_at) >= firstDayOfMonth;
      });
      const monthWithdrawnTotal = monthWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0) / 100;

      // 7. Lucro da plataforma (APENAS VALORES REAIS)
      // - Taxa de 8% dos saques REAIS de apostadores
      // - NÃO inclui saldo fake
      const withdrawalFees = realWithdrawals
        .filter(w => w.status === 'completed')
        .reduce((sum, w) => sum + parseFloat(w.fee || 0), 0) / 100;
      
      // Buscar transações de lucro já contabilizadas
      const lucroTransactions = transactionsData?.filter(t => t.type === 'lucro' && t.status === 'completed') || [];
      const totalLucroInCents = lucroTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const totalLucro = totalLucroInCents / 100;
      
      // Lucro total = taxas de saque REAIS + outras transações de lucro
      const platformProfit = withdrawalFees + totalLucro;

      // 7. Gráficos - Últimos 7 dias
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        last7Days.push(date);
      }

      const betsLast7Days = last7Days.map(date => {
        // Formatar data de referência (sem conversão UTC)
        const refYear = date.getFullYear();
        const refMonth = date.getMonth();
        const refDay = date.getDate();
        
        const dayBets = betsData?.filter(bet => {
          // Converter created_at para data local e comparar apenas dia/mês/ano
          const betDate = new Date(bet.created_at);
          const betYear = betDate.getFullYear();
          const betMonth = betDate.getMonth();
          const betDay = betDate.getDate();
          
          // Comparar apenas dia, mês e ano (ignorar hora e timezone)
          return betYear === refYear && betMonth === refMonth && betDay === refDay;
        }) || [];
        
        const totalInCents = dayBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
        const total = totalInCents / 100; // Converter centavos para reais
        
        // Formatar data local (sem conversão UTC)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        return {
          date: dateStr,
          total
        };
      });

      const newUsersLast7Days = last7Days.map(date => {
        // Formatar data de referência (sem conversão UTC)
        const refYear = date.getFullYear();
        const refMonth = date.getMonth();
        const refDay = date.getDate();
        
        const dayUsers = usersData?.filter(user => {
          // Converter created_at para data local e comparar apenas dia/mês/ano
          const userDate = new Date(user.created_at);
          const userYear = userDate.getFullYear();
          const userMonth = userDate.getMonth();
          const userDay = userDate.getDate();
          
          // Comparar apenas dia, mês e ano (ignorar hora e timezone)
          return userYear === refYear && userMonth === refMonth && userDay === refDay;
        }) || [];
        
        // Formatar data local (sem conversão UTC)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        return {
          date: dateStr,
          count: dayUsers.length
        };
      });

      // 8. Montar resposta
      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          today: todayUsersCount
        },
        matches: {
          open: openMatches,
          scheduled: scheduledMatches, // Jogos agendados
          in_progress: inProgressMatches, // Jogos ao vivo
          finished: finishedMatches
        },
        bets: {
          total: totalBets,
          month: monthBetsTotal,
          today: todayBetsTotal,
          matched_count: matchedBetsData.length, // Quantidade de apostas casadas
          matched_total: totalMatchedBets // Valor total casado
        },
        deposits: {
          today: todayDepositsTotal
        },
        withdrawals: {
          pending: {
            count: pendingWithdrawals.length,
            total: pendingWithdrawalsTotal
          },
          completed: {
            total: completedWithdrawalsTotal
          },
          fake: {
            total: totalFakeWithdrawn,
            count: fakeWithdrawals.length
          },
          real: {
            total: totalRealWithdrawn,
            today: todayWithdrawnTotal,
            last7Days: last7DaysWithdrawnTotal,
            month: monthWithdrawnTotal,
            count: realWithdrawals.filter(w => w.status === 'completed').length
          }
        },
        wallets: {
          total_balance: totalPlayersBalance,
          real_balance: totalRealDeposits,
          fake_balance: totalFakeBalance,
          matched_bets_total: totalMatchedBets // Total de apostas casadas
        },
        platform: {
          profit: platformProfit
        },
        charts: {
          betsLast7Days,
          newUsersLast7Days
        }
      };

      return successResponse(res, 200, 'Estatísticas obtidas com sucesso', stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return errorResponse(res, 500, 'Erro ao buscar estatísticas do dashboard');
    }
  }

  /**
   * GET /api/admin/users
   * Retorna lista de usuários com filtros e paginação
   */
  async getUsers(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Acesso negado. Apenas administradores.');
      }

      const { search, status, page = 1, limit = 10 } = req.query;

      // Construir query base
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (search && search.trim() !== '') {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
      }

      if (status === 'active') {
        query = query.eq('is_active', true);
      } else if (status === 'inactive') {
        query = query.eq('is_active', false);
      }

      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + parseInt(limit) - 1);

      // Ordenar por data de criação (mais recentes primeiro)
      query = query.order('created_at', { ascending: false });

      const { data: users, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return errorResponse(res, 500, 'Erro ao buscar usuários');
      }

      // Buscar wallets para todos os usuários
      const userIds = users.map(u => u.id);
      const { data: wallets } = await supabase
        .from('wallet')
        .select('*')
        .in('user_id', userIds);

      // Criar um mapa de wallets por user_id
      const walletsMap = {};
      if (wallets) {
        wallets.forEach(wallet => {
          walletsMap[wallet.user_id] = wallet;
        });
      }

      // Formatar dados de retorno
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        is_active: user.is_active,
        role: user.role,
        created_at: user.created_at,
        wallet: walletsMap[user.id] || null
      }));

      const totalPages = Math.ceil(count / limit);

      return successResponse(res, 200, 'Usuários obtidos com sucesso', {
        users: formattedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages
        }
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return errorResponse(res, 500, 'Erro ao buscar usuários');
    }
  }

  /**
   * GET /api/admin/users/:userId
   * Retorna detalhes de um usuário específico
   */
  async getUserById(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Acesso negado. Apenas administradores.');
      }

      const { userId } = req.params;

      // Buscar usuário
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('Erro ao buscar usuário:', error);
        return notFoundResponse(res, 'Usuário não encontrado');
      }

      // Buscar wallet do usuário
      const { data: wallet } = await supabase
        .from('wallet')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Formatar resposta
      const formattedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        is_active: user.is_active,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
        wallet: wallet || null
      };

      return successResponse(res, 200, 'Usuário obtido com sucesso', formattedUser);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return errorResponse(res, 500, 'Erro ao buscar usuário');
    }
  }

  /**
   * PATCH /api/admin/users/:userId/status
   * Atualiza o status de um usuário (ativar/bloquear)
   */
  async updateUserStatus(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Acesso negado. Apenas administradores.');
      }

      const { userId } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== 'boolean') {
        return errorResponse(res, 400, 'Status inválido. Deve ser true ou false.');
      }

      // Verificar se o usuário existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', userId)
        .single();

      if (checkError || !existingUser) {
        return notFoundResponse(res, 'Usuário não encontrado');
      }

      // Não permitir bloquear outros admins
      if (existingUser.role === 'admin' && !is_active) {
        return errorResponse(res, 400, 'Não é possível bloquear um administrador');
      }

      // Atualizar status
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao atualizar status do usuário:', error);
        return errorResponse(res, 500, 'Erro ao atualizar status do usuário');
      }

      // Buscar wallet do usuário
      const { data: wallet } = await supabase
        .from('wallet')
        .select('*')
        .eq('user_id', userId)
        .single();

      return successResponse(res, 200, 'Status do usuário atualizado com sucesso', {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        is_active: updatedUser.is_active,
        wallet: wallet || null
      });
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      return errorResponse(res, 500, 'Erro ao atualizar status do usuário');
    }
  }

  /**
   * GET /api/admin/users/:userId/transactions
   * Retorna transações de um usuário específico
   */
  async getUserTransactions(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Acesso negado. Apenas administradores.');
      }

      const { userId } = req.params;
      const { page = 1, limit = 10, type } = req.query;

      // Verificar se o usuário existe
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return notFoundResponse(res, 'Usuário não encontrado');
      }

      // Buscar wallet do usuário
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (walletError || !wallet) {
        return successResponse(res, 200, 'Transações obtidas com sucesso', {
          transactions: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        });
      }

      // Buscar transações do usuário diretamente
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Aplicar filtro de tipo se fornecido
      if (type) {
        query = query.eq('type', type);
      }

      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + parseInt(limit) - 1);

      // Ordenar por data de criação (mais recentes primeiro)
      query = query.order('created_at', { ascending: false });

      const { data: transactions, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar transações:', error);
        return errorResponse(res, 500, 'Erro ao buscar transações');
      }

      const totalPages = Math.ceil(count / limit);

      return successResponse(res, 200, 'Transações obtidas com sucesso', {
        transactions: transactions || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages
        }
      });
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return errorResponse(res, 500, 'Erro ao buscar transações');
    }
  }

  /**
   * GET /api/admin/transactions
   * Retorna todas as transações do sistema
   */
  async getAllTransactions(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Acesso negado. Apenas administradores.');
      }

      const { page = 1, limit = 20, type, status, userId } = req.query;

      // Construir query base
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (type && type !== 'null') {
        query = query.eq('type', type);
      }

      if (status && status !== 'null') {
        query = query.eq('status', status);
      }

      if (userId && userId !== 'null') {
        query = query.eq('user_id', userId);
      }

      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query
        .range(offset, offset + parseInt(limit) - 1)
        .order('created_at', { ascending: false });

      const { data: transactions, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar transações:', error);
        return errorResponse(res, 500, 'Erro ao buscar transações');
      }

      // Buscar dados dos usuários únicos
      const userIds = [...new Set(transactions?.map(t => t.user_id).filter(Boolean))];
      
      let usersMap = {};
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', userIds);
        
        if (users) {
          usersMap = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});
        }
      }

      // Adicionar dados do usuário a cada transação
      const transactionsWithUsers = transactions?.map(transaction => ({
        ...transaction,
        user: transaction.user_id ? usersMap[transaction.user_id] || null : null
      })) || [];

      const totalPages = Math.ceil(count / limit);

      return successResponse(res, 200, 'Transações obtidas com sucesso', {
        transactions: transactionsWithUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages
        }
      });
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return errorResponse(res, 500, 'Erro ao buscar transações');
    }
  }

  /**
   * GET /api/admin/users/:userId/bets
   * Retorna apostas de um usuário específico
   */
  async getUserBets(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Acesso negado. Apenas administradores.');
      }

      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      // Verificar se o usuário existe
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return notFoundResponse(res, 'Usuário não encontrado');
      }

      // Construir query
      let query = supabase
        .from('bets')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Aplicar filtro de status se fornecido
      if (status) {
        query = query.eq('status', status);
      }

      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + parseInt(limit) - 1);

      // Ordenar por data de criação (mais recentes primeiro)
      query = query.order('created_at', { ascending: false });

      const { data: bets, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar apostas:', error);
        return errorResponse(res, 500, 'Erro ao buscar apostas');
      }

      // Buscar as séries relacionadas às apostas
      if (bets && bets.length > 0) {
        const serieIds = [...new Set(bets.map(bet => bet.serie_id).filter(Boolean))];
        
        if (serieIds.length > 0) {
          // Buscar séries
          const { data: series } = await supabase
            .from('series')
            .select('*')
            .in('id', serieIds);

          // Criar mapa de séries
          const seriesMap = {};
          if (series && series.length > 0) {
            series.forEach(serie => {
              seriesMap[serie.id] = serie;
            });

            // Buscar matches das séries
            const matchIds = [...new Set(series.map(s => s.match_id).filter(Boolean))];
            if (matchIds.length > 0) {
              const { data: matches } = await supabase
                .from('matches')
                .select('*')
                .in('id', matchIds);

              if (matches && matches.length > 0) {
                // Buscar jogadores
                const playerIds = [...new Set(matches.flatMap(m => [m.player1_id, m.player2_id]).filter(Boolean))];
                const { data: players } = await supabase
                  .from('players')
                  .select('id, name')
                  .in('id', playerIds);

                const playersMap = {};
                if (players) {
                  players.forEach(player => {
                    playersMap[player.id] = player;
                  });
                }

                // Adicionar título e jogadores aos matches
                const matchesMap = {};
                matches.forEach(match => {
                  const player1 = playersMap[match.player1_id];
                  const player2 = playersMap[match.player2_id];
                  match.title = `${player1?.name || 'Jogador 1'} vs ${player2?.name || 'Jogador 2'}`;
                  matchesMap[match.id] = match;
                });

                // Adicionar match a cada série
                series.forEach(serie => {
                  serie.match = matchesMap[serie.match_id] || null;
                });
              }
            }
          }

          // Formatar dados para o frontend
          bets.forEach(bet => {
            const serie = seriesMap[bet.serie_id];
            bet.match = serie?.match || null;
            
            // Odd sempre 2.0 (fixa)
            bet.odd = bet.odds || 2.0;
            
            // Ganho Potencial = valor apostado * odd (sempre o dobro)
            bet.potential_win = bet.potential_return || (bet.amount * 2);
          });
        }
      }

      const totalPages = Math.ceil(count / limit);

      return successResponse(res, 200, 'Apostas obtidas com sucesso', {
        bets: bets || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages
        }
      });
    } catch (error) {
      console.error('Erro ao buscar apostas:', error);
      return errorResponse(res, 500, 'Erro ao buscar apostas');
    }
  }

  /**
   * GET /api/admin/bets
   * Retorna todas as apostas (admin)
   */
  async getAllBets(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Acesso negado. Apenas administradores.');
      }

      const { page = 1, limit = 20, status } = req.query;

      // Construir query base
      let query = supabase
        .from('bets')
        .select('*', { count: 'exact' });

      // Aplicar filtro de status se fornecido
      if (status) {
        query = query.eq('status', status);
      }

      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + parseInt(limit) - 1);

      // Ordenar por data de criação (mais recentes primeiro)
      query = query.order('created_at', { ascending: false });

      const { data: bets, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar apostas:', error);
        return errorResponse(res, 500, 'Erro ao buscar apostas');
      }

      // Buscar dados relacionados (usuários, séries, matches, jogadores)
      if (bets && bets.length > 0) {
        // Buscar usuários
        const userIds = [...new Set(bets.map(bet => bet.user_id).filter(Boolean))];
        const { data: users } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', userIds);

        const usersMap = {};
        if (users) {
          users.forEach(user => {
            usersMap[user.id] = user;
          });
        }

        // Buscar séries
        const serieIds = [...new Set(bets.map(bet => bet.serie_id).filter(Boolean))];
        let seriesMap = {};
        
        if (serieIds.length > 0) {
          const { data: series } = await supabase
            .from('series')
            .select('id, serie_number, status, match_id')
            .in('id', serieIds);

          if (series && series.length > 0) {
            series.forEach(serie => {
              seriesMap[serie.id] = serie;
            });

            // Buscar matches das séries
            const matchIds = [...new Set(series.map(s => s.match_id).filter(Boolean))];
            if (matchIds.length > 0) {
              const { data: matches } = await supabase
                .from('matches')
                .select('id, player1_id, player2_id, status')
                .in('id', matchIds);

              if (matches && matches.length > 0) {
                // Buscar jogadores
                const playerIds = [...new Set(matches.flatMap(m => [m.player1_id, m.player2_id]).filter(Boolean))];
                const { data: players } = await supabase
                  .from('players')
                  .select('id, name, nickname')
                  .in('id', playerIds);

                const playersMap = {};
                if (players) {
                  players.forEach(player => {
                    playersMap[player.id] = player;
                  });
                }

                // Adicionar jogadores aos matches
                const matchesMap = {};
                matches.forEach(match => {
                  const player1 = playersMap[match.player1_id];
                  const player2 = playersMap[match.player2_id];
                  matchesMap[match.id] = {
                    ...match,
                    player_a: player1 ? { id: player1.id, name: player1.name || player1.nickname } : null,
                    player_b: player2 ? { id: player2.id, name: player2.name || player2.nickname } : null,
                  };
                });

                // Adicionar match a cada série
                series.forEach(serie => {
                  serie.match = matchesMap[serie.match_id] || null;
                });
              }
            }
          }
        }

        // Buscar jogadores escolhidos nas apostas
        const chosenPlayerIds = [...new Set(bets.map(bet => bet.chosen_player_id).filter(Boolean))];
        const { data: chosenPlayers } = await supabase
          .from('players')
          .select('id, name, nickname')
          .in('id', chosenPlayerIds);

        const chosenPlayersMap = {};
        if (chosenPlayers) {
          chosenPlayers.forEach(player => {
            chosenPlayersMap[player.id] = player;
          });
        }

        // Formatar dados para o frontend
        const formattedBets = bets.map(bet => {
          const user = usersMap[bet.user_id];
          const serie = seriesMap[bet.serie_id];
          const chosenPlayer = chosenPlayersMap[bet.chosen_player_id];
          const match = serie?.match;

          // Determinar se aposta é em player_a ou player_b
          let bet_on = null;
          if (match && bet.chosen_player_id) {
            if (bet.chosen_player_id === match.player_a?.id) {
              bet_on = 'player_a';
            } else if (bet.chosen_player_id === match.player_b?.id) {
              bet_on = 'player_b';
            }
          }

          return {
            id: bet.id,
            user: user || null,
            series: serie ? {
              id: serie.id,
              serie_number: serie.serie_number,
              status: serie.status,
              match: match || null
            } : null,
            amount: bet.amount,
            bet_on: bet_on,
            chosen_player: chosenPlayer ? {
              id: chosenPlayer.id,
              name: chosenPlayer.name || chosenPlayer.nickname
            } : null,
            status: bet.status,
            potential_return: bet.potential_return,
            placed_at: bet.placed_at || bet.created_at,
            created_at: bet.created_at || bet.placed_at,
            updated_at: bet.updated_at
          };
        });

        const totalPages = Math.ceil(count / limit);

        return successResponse(res, 200, 'Apostas obtidas com sucesso', {
          bets: formattedBets,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            totalPages
          }
        });
      }

      // Se não há apostas
      return successResponse(res, 200, 'Apostas obtidas com sucesso', {
        bets: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0
        }
      });
    } catch (error) {
      console.error('Erro ao buscar apostas:', error);
      return errorResponse(res, 500, 'Erro ao buscar apostas');
    }
  }

  /**
   * GET /api/admin/matches
   * Lista todas as partidas (adaptado para formato admin)
   */
  async getMatches(req, res) {
    try {
      const filters = {
        status: req.query.status,
        sport: req.query.sport,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await matchesService.listMatches(filters);

      // Mapear de player1/player2 para player_a/player_b (formato admin)
      const mappedMatches = result.matches.map(match => ({
        id: match.id,
        player_a: match.player1,
        player_b: match.player2,
        modality: match.sport,
        total_series: match.series?.length || 3,
        status: match.status,
        scheduled_at: match.scheduled_at,
        location: match.location,
        youtube_url: match.youtube_url,
        stream_active: match.stream_active,
        game_rules: match.game_rules,
        created_at: match.created_at,
        updated_at: match.updated_at
      }));

      return successResponse(res, 200, 'Partidas listadas com sucesso', {
        matches: mappedMatches,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
      return errorResponse(res, 500, 'Erro ao buscar partidas');
    }
  }

  /**
   * GET /api/admin/matches/:matchId
   * Obtém detalhes de uma partida específica
   */
  async getMatchById(req, res) {
    try {
      const { matchId } = req.params;
      const match = await matchesService.getMatchById(matchId);

      // Mapear para formato admin (mantendo dados completos dos jogadores)
      const mappedMatch = {
        id: match.id,
        player_a: match.player1,
        player_b: match.player2,
        player1: match.player1,  // Manter dados completos para componentes
        player2: match.player2,  // Manter dados completos para componentes
        modality: match.sport,
        total_series: match.series?.length || 3,
        status: match.status,
        scheduled_at: match.scheduled_at,
        location: match.location,
        youtube_url: match.youtube_url,
        stream_active: match.stream_active,
        game_rules: match.game_rules,
        series: match.series,
        created_by: match.created_by,
        influencer: match.influencer,
        influencer_commission: match.influencer_commission,
        created_at: match.created_at,
        updated_at: match.updated_at
      };

      return successResponse(res, 200, 'Partida encontrada', mappedMatch);
    } catch (error) {
      console.error('Erro ao buscar partida:', error);
      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }
      return errorResponse(res, 500, 'Erro ao buscar partida');
    }
  }

  /**
   * POST /api/admin/matches
   * Cria uma nova partida
   */
  async createMatch(req, res) {
    try {
      const matchData = req.body;
      const createdBy = req.user.id;

      const match = await matchesService.createMatch(matchData, createdBy);

      // Mapear resposta
      const mappedMatch = {
        id: match.id,
        player_a: match.player1,
        player_b: match.player2,
        modality: match.sport,
        total_series: match.series?.length || 3,
        status: match.status,
        scheduled_at: match.scheduled_at,
        location: match.location,
        youtube_url: match.youtube_url,
        stream_active: match.stream_active,
        game_rules: match.game_rules,
        created_at: match.created_at,
        updated_at: match.updated_at
      };

      return successResponse(res, 201, 'Partida criada com sucesso', mappedMatch);
    } catch (error) {
      console.error('Erro ao criar partida:', error);
      return errorResponse(res, 500, 'Erro ao criar partida');
    }
  }

  /**
   * PATCH /api/admin/matches/:matchId
   * Atualiza uma partida
   */
  async updateMatch(req, res) {
    try {
      const { matchId } = req.params;
      const updateData = req.body;

      const match = await matchesService.updateMatch(matchId, updateData);

      // Mapear resposta
      const mappedMatch = {
        id: match.id,
        player_a: match.player1,
        player_b: match.player2,
        modality: match.sport,
        total_series: match.series?.length || 3,
        status: match.status,
        scheduled_at: match.scheduled_at,
        location: match.location,
        youtube_url: match.youtube_url,
        stream_active: match.stream_active,
        game_rules: match.game_rules,
        created_at: match.created_at,
        updated_at: match.updated_at
      };

      return successResponse(res, 200, 'Partida atualizada com sucesso', mappedMatch);
    } catch (error) {
      console.error('Erro ao atualizar partida:', error);
      return errorResponse(res, 500, 'Erro ao atualizar partida');
    }
  }

  /**
   * DELETE /api/admin/matches/:matchId
   * Deleta uma partida
   */
  async deleteMatch(req, res) {
    try {
      const { matchId } = req.params;
      await matchesService.deleteMatch(matchId);

      return successResponse(res, 200, 'Partida deletada com sucesso');
    } catch (error) {
      console.error('Erro ao deletar partida:', error);
      return errorResponse(res, 500, 'Erro ao deletar partida');
    }
  }

  /**
   * Ajustar saldo do usuário manualmente
   */
  async adjustUserBalance(req, res) {
    try {
      const { userId } = req.params;
      const { amount, reason } = req.body;
      const adminId = req.user.id;

      // Validações
      if (!amount || typeof amount !== 'number') {
        return errorResponse(res, 400, 'Valor inválido');
      }

      if (!reason || !reason.trim()) {
        return errorResponse(res, 400, 'Motivo é obrigatório');
      }

      // Verificar se o usuário existe e buscar wallet
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return notFoundResponse(res, 'Usuário não encontrado');
      }

      let { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('id, balance')
        .eq('user_id', userId)
        .single();

      // Se carteira não existe, criar uma
      if (walletError || !wallet) {
        const { data: newWallet, error: createError } = await supabase
          .from('wallet')
          .insert({
            user_id: userId,
            balance: 0,
            blocked_balance: 0,
            total_deposited: 0,
            total_withdrawn: 0
          })
          .select('id, balance')
          .single();

        if (createError) {
          console.error('Erro ao criar carteira:', createError);
          console.error('Detalhes:', createError.message, createError.details);
          return errorResponse(res, 500, `Erro ao criar carteira: ${createError.message}`);
        }

        wallet = newWallet;
      }

      // Verificar se remoção não deixará saldo negativo
      const newBalance = wallet.balance + amount;
      if (newBalance < 0) {
        return errorResponse(res, 400, 'Saldo insuficiente para remoção');
      }

      // Atualizar saldo
      const { error: updateError } = await supabase
        .from('wallet')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Erro ao atualizar saldo:', updateError);
        return errorResponse(res, 500, 'Erro ao atualizar saldo');
      }

      // Registrar transação
      const transactionType = amount > 0 ? 'admin_credit' : 'admin_debit';
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: transactionType,
          amount: Math.abs(amount),
          status: 'completed',
          description: `Ajuste manual pelo admin: ${reason}`,
          metadata: {
            admin_id: adminId,
            reason: reason,
            previous_balance: wallet.balance,
            new_balance: newBalance
          }
        });

      if (transactionError) {
        console.error('Erro ao registrar transação:', transactionError);
      }

      return successResponse(res, 200, 'Saldo ajustado com sucesso', {
        user_id: userId,
        previous_balance: wallet.balance,
        adjustment: amount,
        new_balance: newBalance,
        reason: reason
      });
    } catch (error) {
      console.error('Erro ao ajustar saldo:', error);
      return errorResponse(res, 500, 'Erro ao ajustar saldo');
    }
  }

  /**
   * DELETE /api/admin/bets/:betId
   * Cancela uma aposta (admin pode cancelar qualquer aposta pendente ou aceita)
   */
  async cancelBet(req, res) {
    try {
      const { betId } = req.params;
      const betsService = require('../services/bets.service');

      // Buscar aposta
      const { data: bet, error: betError } = await require('../config/supabase.config').supabase
        .from('bets')
        .select(`
          *,
          serie:series(status),
          user:users(email)
        `)
        .eq('id', betId)
        .single();

      if (betError || !bet) {
        return notFoundResponse(res, 'Aposta não encontrada');
      }

      // Validar que aposta pode ser cancelada
      if (bet.status !== 'pendente' && bet.status !== 'aceita') {
        return errorResponse(res, 400, `Aposta com status "${bet.status}" não pode ser cancelada`);
      }

      // Validar que série não foi encerrada
      if (bet.serie.status === 'encerrada' || bet.serie.status === 'cancelada') {
        return errorResponse(res, 400, 'Não é possível cancelar aposta de série encerrada ou cancelada');
      }

      // Cancelar aposta (usa o mesmo serviço, mas com userId da aposta)
      const result = await betsService.cancelBet(betId, bet.user_id);

      return successResponse(res, 200, `Aposta cancelada pelo admin. Valor reembolsado: R$ ${bet.amount / 100}`, result);
    } catch (error) {
      console.error('Erro ao cancelar aposta (admin):', error);
      
      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      return errorResponse(res, 500, error.message || 'Erro ao cancelar aposta');
    }
  }

  /**
   * GET /api/admin/fake-stats
   * Retorna estatísticas de saldo fake (apenas para debug/testes)
   */
  async getFakeStats(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Acesso negado. Apenas administradores.');
      }

      const result = await fakeStatsService.getFakeStats();
      return successResponse(res, 200, 'Estatísticas fake obtidas com sucesso', result.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas fake:', error);
      return errorResponse(res, 500, 'Erro ao buscar estatísticas fake');
    }
  }
}

module.exports = new AdminController();


