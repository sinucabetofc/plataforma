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
      // Função auxiliar para obter data no timezone do Brasil
      // Retorna data em UTC que representa o início do dia no Brasil
      const getBrazilDate = (daysAgo = 0) => {
        const now = new Date();
        // Ajustar para timezone do Brasil (UTC-3)
        const brazilNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        // Obter início do dia (00:00:00) no Brasil
        const year = brazilNow.getUTCFullYear();
        const month = brazilNow.getUTCMonth();
        const day = brazilNow.getUTCDate() - daysAgo;
        // Retornar em UTC mas representando 00:00 no Brasil (03:00 UTC)
        return new Date(Date.UTC(year, month, day, 3, 0, 0, 0));
      };

      // 1. Total de usuários (ativos e inativos)
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Usuários cadastrados hoje
      const { count: usersToday } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

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
      const today = getBrazilDate(0); // Início do dia de hoje no Brasil
      
      // Início do mês no Brasil
      const now = new Date();
      const brazilNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      const startOfMonth = new Date(Date.UTC(brazilNow.getUTCFullYear(), brazilNow.getUTCMonth(), 1, 3, 0, 0, 0));

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

      // 4. Saques pendentes (APENAS de apostadores - tabela transactions)
      const { data: pendingWithdrawals } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'saque') // Tipo correto do ENUM
        .eq('status', 'pending');

      // Valores em centavos, converter para reais
      const totalPendingWithdrawals = (pendingWithdrawals?.reduce(
        (sum, w) => sum + parseFloat(w.amount), 
        0
      ) || 0) / 100;

      const pendingWithdrawalsCount = pendingWithdrawals?.length || 0;

      // 5. Lucro da plataforma (8% dos saques aprovados de APOSTADORES)
      console.error('\n' + '='.repeat(80));
      console.error('💵 [DASHBOARD - LUCRO] Calculando lucro da plataforma...');
      console.error('💵 [DASHBOARD - LUCRO] Hora UTC agora:', new Date().toISOString());
      console.error('💵 [DASHBOARD - LUCRO] Data "hoje" Brasil (UTC):', today.toISOString());
      console.error('='.repeat(80));
      
      // 5.1 Saques aprovados HOJE (APENAS apostadores - tabela transactions)
      const { data: completedWithdrawalsToday, error: withdrawalsTodayError } = await supabase
        .from('transactions')
        .select('id, amount, created_at, status')
        .eq('type', 'saque')
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());

      console.error('💵 [DASHBOARD - LUCRO] ✅ Saques HOJE encontrados:', completedWithdrawalsToday?.length || 0);
      
      if (completedWithdrawalsToday && completedWithdrawalsToday.length > 0) {
        console.error('💵 [DASHBOARD - LUCRO] Detalhes dos saques:');
        completedWithdrawalsToday.forEach((w, i) => {
          console.error(`   ${i + 1}. R$ ${(parseFloat(w.amount) / 100).toFixed(2)} - ${w.created_at} (ID: ${w.id.substring(0, 8)}...)`);
        });
      } else {
        console.error('💵 [DASHBOARD - LUCRO] ⚠️  NENHUM saque encontrado!');
      }
      
      if (withdrawalsTodayError) {
        console.error('❌ [DASHBOARD - LUCRO] Erro ao buscar saques:', withdrawalsTodayError);
      }

      const totalWithdrawnToday = (completedWithdrawalsToday?.reduce(
        (sum, w) => sum + parseFloat(w.amount), 
        0
      ) || 0) / 100;

      const platformProfitToday = totalWithdrawnToday * 0.08;
      
      console.error('💵 [DASHBOARD - LUCRO] Total sacado HOJE: R$', totalWithdrawnToday.toFixed(2));
      console.error('💵 [DASHBOARD - LUCRO] 💰 Lucro HOJE (8%): R$', platformProfitToday.toFixed(2));

      // 5.2 Saques aprovados na SEMANA (últimos 7 dias - APENAS apostadores)
      const weekAgo = getBrazilDate(7);

      const { data: completedWithdrawalsWeek } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('type', 'saque') // Tipo correto do ENUM
        .eq('status', 'completed')
        .gte('created_at', weekAgo.toISOString());

      console.error('💵 [DASHBOARD - LUCRO] Saques SEMANA encontrados:', completedWithdrawalsWeek?.length || 0);

      const totalWithdrawnWeek = (completedWithdrawalsWeek?.reduce(
        (sum, w) => sum + parseFloat(w.amount), 
        0
      ) || 0) / 100;

      const platformProfitWeek = totalWithdrawnWeek * 0.08;
      
      console.error('💵 [DASHBOARD - LUCRO] Total sacado SEMANA: R$', totalWithdrawnWeek.toFixed(2));
      console.error('💵 [DASHBOARD - LUCRO] Lucro SEMANA (8%): R$', platformProfitWeek.toFixed(2));

      // 5.3 Saques aprovados no MÊS (APENAS apostadores)
      const { data: completedWithdrawalsMonth } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('type', 'saque') // Tipo correto do ENUM
        .eq('status', 'completed')
        .gte('created_at', startOfMonth.toISOString());

      console.error('💵 [DASHBOARD - LUCRO] Saques MÊS encontrados:', completedWithdrawalsMonth?.length || 0);

      const totalWithdrawnMonth = (completedWithdrawalsMonth?.reduce(
        (sum, w) => sum + parseFloat(w.amount), 
        0
      ) || 0) / 100;

      const platformProfitMonth = totalWithdrawnMonth * 0.08;
      
      console.error('💵 [DASHBOARD - LUCRO] Total sacado MÊS: R$', totalWithdrawnMonth.toFixed(2));
      console.error('💵 [DASHBOARD - LUCRO] Lucro MÊS (8%): R$', platformProfitMonth.toFixed(2));

      // 5.4 Saques aprovados TOTAL (APENAS apostadores)
      // Usar coluna total_withdrawn das carteiras para maior eficiência
      const { data: walletsWithdrawn } = await supabase
        .from('wallet')
        .select('total_withdrawn');

      const totalWithdrawnTotal = (walletsWithdrawn?.reduce(
        (sum, w) => sum + parseFloat(w.total_withdrawn || 0), 
        0
      ) || 0) / 100;

      const platformProfitTotal = totalWithdrawnTotal * 0.08;
      
      console.error('\n💵 [DASHBOARD - LUCRO] Total sacado GERAL: R$', totalWithdrawnTotal.toFixed(2));
      console.error('💵 [DASHBOARD - LUCRO] Lucro TOTAL (8%): R$', platformProfitTotal.toFixed(2));
      console.error('='.repeat(80));
      console.error('💵 [DASHBOARD - LUCRO] 📊 RESUMO FINAL DOS LUCROS:');
      console.error('   💰 Hoje: R$', platformProfitToday.toFixed(2));
      console.error('   💰 Semana: R$', platformProfitWeek.toFixed(2));
      console.error('   💰 Mês: R$', platformProfitMonth.toFixed(2));
      console.error('   💰 Total: R$', platformProfitTotal.toFixed(2));
      console.error('='.repeat(80) + '\n');

      // 6. Depósitos hoje
      const { data: depositsToday } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());

      const totalDepositsToday = (depositsToday?.reduce(
        (sum, d) => sum + parseFloat(d.amount), 
        0
      ) || 0) / 100;

      // 7. Saldo total das carteiras (apenas saldo real, não fake)
      const { data: wallets } = await supabase
        .from('wallet')
        .select('balance, fake_balance');

      // Saldo real = balance - fake_balance (pois balance inclui fake)
      const totalRealBalance = (wallets?.reduce(
        (sum, w) => {
          const balance = parseFloat(w.balance || 0);
          const fakeBalance = parseFloat(w.fake_balance || 0);
          return sum + (balance - fakeBalance);
        }, 
        0
      ) || 0) / 100;

      const totalFakeBalance = (wallets?.reduce(
        (sum, w) => sum + parseFloat(w.fake_balance || 0), 
        0
      ) || 0) / 100;

      const totalBalance = totalRealBalance + totalFakeBalance; // Saldo total (real + fake)

      // 8. Total de apostas emparceiradas (matched)
      const { data: matchedBets } = await supabase
        .from('bets')
        .select('amount')
        .eq('status', 'matched');

      const totalMatchedBets = (matchedBets?.reduce(
        (sum, bet) => sum + parseFloat(bet.amount), 
        0
      ) || 0) / 100;

      const matchedBetsCount = matchedBets?.length || 0;

      // 9. Novos usuários (últimos 7 dias, por dia)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = getBrazilDate(i);
        const nextDate = getBrazilDate(i - 1);

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

      // 10. Apostas por dia (últimos 7 dias)
      const betsLast7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = getBrazilDate(i);
        const nextDate = getBrazilDate(i - 1);

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
          inactive: (totalUsers || 0) - (activeUsers || 0),
          today: usersToday || 0
        },
        matches: {
          ...matchesByStatus,
          scheduled: matchesByStatus.open
        },
        bets: {
          today: totalBetsToday,
          month: totalBetsMonth,
          total: totalBetsAll,
          matched_count: matchedBetsCount
        },
        deposits: {
          today: totalDepositsToday
        },
        wallets: {
          real_balance: totalRealBalance,
          fake_balance: totalFakeBalance,
          total_balance: totalBalance,
          matched_bets_total: totalMatchedBets
        },
        withdrawals: {
          pending: {
            count: pendingWithdrawalsCount,
            total: totalPendingWithdrawals
          },
          completed: {
            total: totalWithdrawnTotal,
            today: totalWithdrawnToday,
            week: totalWithdrawnWeek,
            month: totalWithdrawnMonth
          }
        },
        platform: {
          profit: {
            today: platformProfitToday,
            week: platformProfitWeek,
            month: platformProfitMonth,
            total: platformProfitTotal
          },
          withdrawals: {
            today: totalWithdrawnToday,
            week: totalWithdrawnWeek,
            month: totalWithdrawnMonth,
            total: totalWithdrawnTotal
          },
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
      console.log('='.repeat(80));
      console.log('💰 [APPROVE_WITHDRAWAL] Iniciando aprovação de saque');
      console.log('💰 [APPROVE_WITHDRAWAL] ID do saque:', withdrawalId);
      console.log('='.repeat(80));

      // 1. Buscar dados do saque
      console.log('📋 [APPROVE_WITHDRAWAL] Passo 1: Buscando dados do saque...');
      const { data: withdrawal, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', withdrawalId)
        .eq('type', 'saque')
        .eq('status', 'pending')
        .single();

      if (fetchError) {
        console.error('❌ [APPROVE_WITHDRAWAL] Erro ao buscar saque:', fetchError);
        throw fetchError;
      }

      if (!withdrawal) {
        console.error('❌ [APPROVE_WITHDRAWAL] Saque não encontrado!');
        throw {
          code: 'NOT_FOUND',
          message: 'Saque não encontrado ou já processado'
        };
      }

      console.log('✅ [APPROVE_WITHDRAWAL] Saque encontrado:');
      console.log('   - User ID:', withdrawal.user_id);
      console.log('   - Valor:', parseFloat(withdrawal.amount) / 100, 'reais');
      console.log('   - Status atual:', withdrawal.status);
      console.log('   - Data criação:', withdrawal.created_at);

      // 2. Atualizar status para completed
      console.log('📝 [APPROVE_WITHDRAWAL] Passo 2: Atualizando status para completed...');
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId)
        .select()
        .single();

      if (error) {
        console.error('❌ [APPROVE_WITHDRAWAL] Erro ao atualizar transação:', error);
        throw error;
      }

      console.log('✅ [APPROVE_WITHDRAWAL] Status atualizado para completed');
      console.log('   - Processado em:', data.processed_at);

      // 3. Atualizar total_withdrawn na carteira
      console.log('💳 [APPROVE_WITHDRAWAL] Passo 3: Atualizando total_withdrawn da carteira...');
      const { data: wallet, error: walletFetchError } = await supabase
        .from('wallet')
        .select('total_withdrawn')
        .eq('user_id', withdrawal.user_id)
        .single();

      if (walletFetchError) {
        console.error('❌ [APPROVE_WITHDRAWAL] Erro ao buscar carteira:', walletFetchError);
      } else if (!wallet) {
        console.error('❌ [APPROVE_WITHDRAWAL] Carteira não encontrada!');
      } else {
        const currentTotalWithdrawn = parseFloat(wallet.total_withdrawn || 0);
        const withdrawalAmount = parseFloat(withdrawal.amount);
        const newTotalWithdrawn = currentTotalWithdrawn + withdrawalAmount;
        
        console.log('💰 [APPROVE_WITHDRAWAL] Valores:');
        console.log('   - total_withdrawn anterior:', currentTotalWithdrawn / 100, 'reais');
        console.log('   - Valor do saque:', withdrawalAmount / 100, 'reais');
        console.log('   - total_withdrawn novo:', newTotalWithdrawn / 100, 'reais');

        const { error: updateError } = await supabase
          .from('wallet')
          .update({
            total_withdrawn: newTotalWithdrawn
          })
          .eq('user_id', withdrawal.user_id);

        if (updateError) {
          console.error('❌ [APPROVE_WITHDRAWAL] Erro ao atualizar total_withdrawn:', updateError);
        } else {
          console.log('✅ [APPROVE_WITHDRAWAL] total_withdrawn atualizado com sucesso!');
          console.log('   - Novo total_withdrawn:', newTotalWithdrawn / 100, 'reais');
          
          // Calcular taxa de 8%
          const fee = (withdrawalAmount / 100) * 0.08;
          console.log('💵 [APPROVE_WITHDRAWAL] Taxa da plataforma (8%):', fee, 'reais');
        }
      }

      console.log('='.repeat(80));
      console.log('✅ [APPROVE_WITHDRAWAL] Saque aprovado com sucesso!');
      console.log('='.repeat(80));

      return data;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('='.repeat(80));
      console.error('❌ [APPROVE_WITHDRAWAL] ERRO ao aprovar saque:', error);
      console.error('='.repeat(80));
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
      console.log('='.repeat(80));
      console.log('❌ [REJECT_WITHDRAWAL] Iniciando rejeição de saque');
      console.log('❌ [REJECT_WITHDRAWAL] ID do saque:', withdrawalId);
      console.log('❌ [REJECT_WITHDRAWAL] Motivo:', reason);
      console.log('='.repeat(80));

      // 1. Buscar dados do saque
      console.log('📋 [REJECT_WITHDRAWAL] Passo 1: Buscando dados do saque...');
      const { data: withdrawal, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', withdrawalId)
        .eq('type', 'saque')
        .eq('status', 'pending')
        .single();

      if (fetchError) {
        console.error('❌ [REJECT_WITHDRAWAL] Erro ao buscar saque:', fetchError);
        throw fetchError;
      }

      if (!withdrawal) {
        console.error('❌ [REJECT_WITHDRAWAL] Saque não encontrado!');
        throw {
          code: 'NOT_FOUND',
          message: 'Saque não encontrado ou já processado'
        };
      }

      console.log('✅ [REJECT_WITHDRAWAL] Saque encontrado:');
      console.log('   - User ID:', withdrawal.user_id);
      console.log('   - Valor:', parseFloat(withdrawal.amount) / 100, 'reais');
      console.log('   - Status atual:', withdrawal.status);

      // 2. Atualizar status para failed
      console.log('📝 [REJECT_WITHDRAWAL] Passo 2: Atualizando status para failed...');
      const { data: updatedWithdrawal, error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          description: `${withdrawal.description || 'Saque via Pix'} - Rejeitado: ${reason}`,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [REJECT_WITHDRAWAL] Erro ao atualizar transação:', updateError);
        throw updateError;
      }

      console.log('✅ [REJECT_WITHDRAWAL] Status atualizado para failed');

      // 3. Buscar saldo atual do usuário
      console.log('💳 [REJECT_WITHDRAWAL] Passo 3: Buscando saldo da carteira...');
      const { data: wallet, error: walletFetchError } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', withdrawal.user_id)
        .single();

      if (walletFetchError || !wallet) {
        console.error('❌ [REJECT_WITHDRAWAL] Erro ao buscar carteira:', walletFetchError);
        throw {
          code: 'NOT_FOUND',
          message: 'Carteira do usuário não encontrada'
        };
      }

      // 4. Calcular novo saldo (devolver o valor do saque)
      const currentBalance = parseFloat(wallet.balance);
      const withdrawalAmount = parseFloat(withdrawal.amount);
      const newBalance = currentBalance + withdrawalAmount;

      console.log('💰 [REJECT_WITHDRAWAL] Devolvendo saldo:');
      console.log('   - Saldo atual:', currentBalance / 100, 'reais');
      console.log('   - Valor a devolver:', withdrawalAmount / 100, 'reais');
      console.log('   - Novo saldo:', newBalance / 100, 'reais');

      // 5. Atualizar saldo da carteira
      console.log('💳 [REJECT_WITHDRAWAL] Passo 4: Atualizando saldo da carteira...');
      const { error: walletError } = await supabase
        .from('wallet')
        .update({
          balance: newBalance
        })
        .eq('user_id', withdrawal.user_id);

      if (walletError) {
        console.error('❌ [REJECT_WITHDRAWAL] Erro ao atualizar carteira:', walletError);
        throw walletError;
      }

      console.log('✅ [REJECT_WITHDRAWAL] Saldo devolvido com sucesso!');
      console.log('   - Novo saldo disponível:', newBalance / 100, 'reais');

      console.log('='.repeat(80));
      console.log('✅ [REJECT_WITHDRAWAL] Saque rejeitado com sucesso!');
      console.log('='.repeat(80));

      return updatedWithdrawal;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('='.repeat(80));
      console.error('❌ [REJECT_WITHDRAWAL] ERRO ao rejeitar saque:', error);
      console.error('='.repeat(80));
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao recusar saque',
        details: error.message
      };
    }
  }

  // ============================================================
  // DEPÓSITOS (DEPOSITS)
  // ============================================================

  /**
   * Lista depósitos com filtros
   */
  async getDeposits({ page = 1, limit = 20, status = null }) {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('transactions')
        .select(`
          *,
          user:users(id, name, email, cpf, phone)
        `, { count: 'exact' })
        .eq('type', 'deposit');

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
        deposits: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao listar depósitos:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao listar depósitos',
        details: error.message
      };
    }
  }

  /**
   * Busca detalhes de um depósito específico
   */
  async getDepositById(depositId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          user:users(id, name, email, cpf, phone)
        `)
        .eq('id', depositId)
        .eq('type', 'deposit')
        .single();

      if (error || !data) {
        throw {
          code: 'NOT_FOUND',
          message: 'Depósito não encontrado'
        };
      }

      return data;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao buscar depósito:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar depósito',
        details: error.message
      };
    }
  }

  /**
   * Aprova um depósito manualmente (marca como completed)
   */
  async approveDeposit(depositId) {
    try {
      // 1. Buscar dados do depósito
      const { data: deposit, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', depositId)
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .single();

      if (fetchError || !deposit) {
        throw {
          code: 'NOT_FOUND',
          message: 'Depósito não encontrado ou já processado'
        };
      }

      // 2. Buscar carteira do usuário
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance, total_deposited')
        .eq('user_id', deposit.user_id)
        .single();

      if (walletError || !wallet) {
        throw {
          code: 'NOT_FOUND',
          message: 'Carteira do usuário não encontrada'
        };
      }

      // 3. Calcular novos valores
      const depositAmount = parseFloat(deposit.amount);
      const newBalance = parseFloat(wallet.balance) + depositAmount;
      const newTotalDeposited = parseFloat(wallet.total_deposited || 0) + depositAmount;

      // 4. Atualizar carteira
      const { error: updateWalletError } = await supabase
        .from('wallet')
        .update({
          balance: newBalance,
          total_deposited: newTotalDeposited
        })
        .eq('user_id', deposit.user_id);

      if (updateWalletError) {
        throw updateWalletError;
      }

      // 5. Atualizar status do depósito
      const { data: updatedDeposit, error: updateDepositError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          balance_after: newBalance,
          processed_at: new Date().toISOString(),
          metadata: {
            ...deposit.metadata,
            approved_manually: true,
            approved_at: new Date().toISOString()
          }
        })
        .eq('id', depositId)
        .select()
        .single();

      if (updateDepositError) {
        throw updateDepositError;
      }

      return updatedDeposit;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao aprovar depósito:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao aprovar depósito',
        details: error.message
      };
    }
  }

  /**
   * Rejeita um depósito (marca como failed)
   */
  async rejectDeposit(depositId, reason) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          status: 'failed',
          description: `Depósito rejeitado: ${reason}`,
          metadata: {
            rejected_at: new Date().toISOString(),
            rejection_reason: reason
          }
        })
        .eq('id', depositId)
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw {
          code: 'NOT_FOUND',
          message: 'Depósito não encontrado ou já processado'
        };
      }

      return data;
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao rejeitar depósito:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao rejeitar depósito',
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


