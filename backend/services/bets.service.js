/**
 * ============================================================
 * Bets Service - Lógica de Negócio de Apostas (Nova Estrutura)
 * ============================================================
 * Nota: Esta versão usa séries e matching MANUAL por admin
 */

const { supabase } = require('../config/supabase.config');

class BetsService {
  /**
   * Cria uma nova aposta em uma série
   * @param {string} userId - ID do usuário
   * @param {Object} betData - Dados da aposta
   * @returns {Promise<Object>} Dados da aposta criada
   */
  async createBet(userId, betData) {
    try {
      // 🔍 DEBUG: Verificar valor recebido
      console.log('🎯 [BACKEND] Recebeu betData:', betData);
      
      const { serie_id, chosen_player_id, amount } = betData;
      
      console.log('🎯 [BACKEND] Amount extraído:', amount, 'tipo:', typeof amount);
      console.log('🎯 [BACKEND] Em reais:', amount / 100);

      // 1. Verificar se série existe e está liberada
      const { data: serie, error: serieError } = await supabase
        .from('series')
        .select(`
          *,
          match:matches(
            id,
            player1_id,
            player2_id,
            status,
            player1:players!matches_player1_id_fkey(id, name, nickname),
            player2:players!matches_player2_id_fkey(id, name, nickname)
          )
        `)
        .eq('id', serie_id)
        .single();

      if (serieError || !serie) {
        throw {
          code: 'NOT_FOUND',
          message: 'Série não encontrada'
        };
      }

      // Permitir apostas em séries liberadas OU em andamento (apostas ao vivo)
      if (serie.status !== 'liberada' && serie.status !== 'em_andamento') {
        throw {
          code: 'SERIE_NOT_AVAILABLE',
          message: 'Série não está disponível para apostas',
          details: { status: serie.status }
        };
      }

      if (!serie.betting_enabled) {
        throw {
          code: 'BETTING_DISABLED',
          message: 'Apostas não estão habilitadas para esta série'
        };
      }

      // 2. Validar que chosen_player é da partida
      const validPlayers = [serie.match.player1_id, serie.match.player2_id];
      if (!validPlayers.includes(chosen_player_id)) {
        throw {
          code: 'INVALID_PLAYER',
          message: 'Jogador escolhido não está nesta partida'
        };
      }

      // 3. Verificar saldo disponível
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (walletError || !wallet) {
        throw {
          code: 'WALLET_NOT_FOUND',
          message: 'Carteira não encontrada'
        };
      }

      if (wallet.balance < amount) {
        throw {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Saldo insuficiente',
          details: {
            balance: wallet.balance,
            required: amount
          }
        };
      }

      // 4. Criar aposta (trigger vai debitar automaticamente)
      const { data: bet, error: betError } = await supabase
        .from('bets')
        .insert({
          user_id: userId,
          serie_id,
          chosen_player_id,
          amount,
          status: 'pendente'
        })
        .select(`
          *,
          serie:series(
            id,
            serie_number,
            status
          ),
          chosen_player:players!bets_chosen_player_id_fkey(id, name, nickname)
        `)
        .single();

      if (betError) {
        console.error('Erro ao criar aposta:', betError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar aposta',
          details: betError.message
        };
      }

      // 5. Tentar matching automático com apostas pendentes do lado oposto
      const matchingResult = await this._performAutoMatching(bet, serie);

      // 6. Buscar aposta atualizada com valores de matching
      const { data: updatedBet } = await supabase
        .from('bets')
        .select('matched_amount, remaining_amount, status')
        .eq('id', bet.id)
        .single();

      // 7. Buscar saldo atualizado
      const { data: updatedWallet } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', userId)
        .single();

      // 8. Calcular porcentagem casada
      const matchPercentage = updatedBet 
        ? Math.round((updatedBet.matched_amount / bet.amount) * 100) 
        : 0;

      return {
        bet: {
          id: bet.id,
          serie_id: bet.serie_id,
          serie_number: bet.serie.serie_number,
          chosen_player: {
            id: bet.chosen_player.id,
            name: bet.chosen_player.name,
            nickname: bet.chosen_player.nickname
          },
          amount: bet.amount,
          matched_amount: updatedBet?.matched_amount || 0,
          remaining_amount: updatedBet?.remaining_amount || bet.amount,
          status: updatedBet?.status || matchingResult.status || bet.status,
          match_percentage: matchPercentage,
          placed_at: bet.placed_at
        },
        matching: {
          success: matchingResult.matched,
          total_matches: matchingResult.matches?.length || 0,
          matches: matchingResult.matches || [],
          total_matched: matchingResult.totalMatched || 0,
          remaining: matchingResult.remaining || bet.amount,
          message: matchingResult.message
        },
        wallet: {
          balance: updatedWallet ? updatedWallet.balance : wallet.balance - amount
        },
        match: {
          player1: serie.match.player1,
          player2: serie.match.player2
        }
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao criar aposta:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao criar aposta',
        details: error.message
      };
    }
  }

  /**
   * Busca apostas de uma série específica (COM MATCHING FRACIONADO)
   * @param {string} serieId - ID da série
   * @returns {Promise<Object>} Apostas da série com info de matches
   */
  async getSerieBets(serieId) {
    try {
      // Buscar apostas com dados de usuário e jogador
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select(`
          *,
          user:users(id, name, email),
          chosen_player:players!bets_chosen_player_id_fkey(id, name, nickname),
          serie:series(
            id,
            serie_number,
            status,
            match_id
          )
        `)
        .eq('serie_id', serieId)
        .order('placed_at', { ascending: false });

      if (betsError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar apostas da série',
          details: betsError.message
        };
      }

      // Calcular estatísticas (baseado em matched_amount)
      const totalBets = bets.length;
      const totalMatched = bets.reduce((sum, b) => sum + (b.matched_amount || 0), 0);
      const totalAmount = bets.reduce((sum, b) => sum + b.amount, 0);
      
      // Agrupar por jogador
      const betsByPlayer = {};
      bets.forEach(bet => {
        const playerId = bet.chosen_player_id;
        if (!betsByPlayer[playerId]) {
          betsByPlayer[playerId] = {
            player: bet.chosen_player,
            total_bets: 0,
            total_amount: 0,
            total_matched: 0,
            total_remaining: 0,
            bets: []
          };
        }
        betsByPlayer[playerId].total_bets++;
        betsByPlayer[playerId].total_amount += bet.amount;
        betsByPlayer[playerId].total_matched += (bet.matched_amount || 0);
        betsByPlayer[playerId].total_remaining += (bet.remaining_amount || 0);
        betsByPlayer[playerId].bets.push({
          id: bet.id,
          user_id: bet.user_id,
          user: {
            id: bet.user.id,
            name: bet.user.name
          },
          amount: bet.amount,
          matched_amount: bet.matched_amount || 0,
          remaining_amount: bet.remaining_amount || 0,
          match_percentage: bet.amount > 0 
            ? Math.round(((bet.matched_amount || 0) / bet.amount) * 100) 
            : 0,
          status: bet.status,
          placed_at: bet.placed_at
        });
      });

      return {
        serie: bets[0] ? bets[0].serie : null,
        stats: {
          total_bets: totalBets,
          total_amount: totalAmount,
          total_matched: totalMatched,
          total_remaining: totalAmount - totalMatched,
          match_percentage: totalAmount > 0 
            ? Math.round((totalMatched / totalAmount) * 100) 
            : 0
        },
        by_player: betsByPlayer,
        all_bets: bets.map(bet => ({
          id: bet.id,
          user_id: bet.user_id,
          user: {
            id: bet.user.id,
            name: bet.user.name
          },
          chosen_player: {
            id: bet.chosen_player.id,
            name: bet.chosen_player.name,
            nickname: bet.chosen_player.nickname
          },
          amount: bet.amount,
          matched_amount: bet.matched_amount || 0,
          remaining_amount: bet.remaining_amount || 0,
          match_percentage: bet.amount > 0 
            ? Math.round(((bet.matched_amount || 0) / bet.amount) * 100) 
            : 0,
          status: bet.status,
          placed_at: bet.placed_at,
          resolved_at: bet.resolved_at
        }))
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar apostas da série:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar apostas da série',
        details: error.message
      };
    }
  }

  /**
   * Busca os matches de uma aposta específica
   * @param {string} betId - ID da aposta
   * @returns {Promise<Object>} Matches da aposta
   */
  async getBetMatches(betId) {
    try {
      // Buscar matches onde esta aposta aparece
      const { data: matches, error: matchesError } = await supabase
        .from('bet_matches')
        .select(`
          *,
          bet_a:bets!bet_matches_bet_a_id_fkey(
            id,
            user_id,
            amount,
            matched_amount,
            user:users(id, name)
          ),
          bet_b:bets!bet_matches_bet_b_id_fkey(
            id,
            user_id,
            amount,
            matched_amount,
            user:users(id, name)
          )
        `)
        .or(`bet_a_id.eq.${betId},bet_b_id.eq.${betId}`)
        .order('created_at', { ascending: true });

      if (matchesError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar matches da aposta',
          details: matchesError.message
        };
      }

      const formattedMatches = matches.map(match => ({
        id: match.id,
        matched_amount: match.matched_amount,
        created_at: match.created_at,
        opposite_bet: match.bet_a_id === betId ? {
          id: match.bet_b.id,
          user_id: match.bet_b.user_id,
          user_name: match.bet_b.user.name,
          amount: match.bet_b.amount,
          matched_amount: match.bet_b.matched_amount
        } : {
          id: match.bet_a.id,
          user_id: match.bet_a.user_id,
          user_name: match.bet_a.user.name,
          amount: match.bet_a.amount,
          matched_amount: match.bet_a.matched_amount
        }
      }));

      const totalMatched = matches.reduce((sum, m) => sum + m.matched_amount, 0);

      return {
        bet_id: betId,
        total_matches: matches.length,
        total_matched: totalMatched,
        matches: formattedMatches
      };

    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar matches:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar matches da aposta',
        details: error.message
      };
    }
  }

  /**
   * Busca apostas de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Object>} Apostas do usuário
   */
  async getUserBets(userId, filters = {}) {
    try {
      const { status, limit = 50, offset = 0 } = filters;

      // Construir query
      let query = supabase
        .from('bets')
        .select(`
          *,
          serie:series(
            id,
            serie_number,
            status,
            winner_player_id,
            match:matches(
              id,
              scheduled_at,
              status,
              game_rules,
              player1:players!matches_player1_id_fkey(id, name, nickname, photo_url),
              player2:players!matches_player2_id_fkey(id, name, nickname, photo_url)
            )
          ),
          chosen_player:players!bets_chosen_player_id_fkey(id, name, nickname, photo_url)
        `, { count: 'exact' })
        .eq('user_id', userId);

      // Filtro de status
      if (status) {
        query = query.eq('status', status);
      }

      // Ordenação e paginação
      query = query
        .order('placed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: bets, error: betsError, count } = await query;

      if (betsError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar apostas do usuário',
          details: betsError.message
        };
      }

      // Calcular estatísticas
      const stats = {
        total_bets: count || 0,
        pendente: bets.filter(b => b.status === 'pendente').length,
        aceita: bets.filter(b => b.status === 'aceita').length,
        ganha: bets.filter(b => b.status === 'ganha').length,
        perdida: bets.filter(b => b.status === 'perdida').length,
        cancelada: bets.filter(b => b.status === 'cancelada').length,
        total_wagered: bets.reduce((sum, b) => sum + b.amount, 0),
        total_won: bets
          .filter(b => b.status === 'ganha')
          .reduce((sum, b) => sum + (b.actual_return || 0), 0)
      };

      // Formatar apostas
      const formattedBets = bets.map(bet => ({
        id: bet.id,
        serie: {
          id: bet.serie.id,
          serie_number: bet.serie.serie_number,
          status: bet.serie.status
        },
        match: {
          id: bet.serie.match.id,
          scheduled_at: bet.serie.match.scheduled_at,
          status: bet.serie.match.status,
          game_rules: bet.serie.match.game_rules,
          player1: bet.serie.match.player1,
          player2: bet.serie.match.player2
        },
        chosen_player: {
          id: bet.chosen_player.id,
          name: bet.chosen_player.name,
          nickname: bet.chosen_player.nickname,
          photo_url: bet.chosen_player.photo_url
        },
        amount: bet.amount,
        potential_return: bet.potential_return,
        actual_return: bet.actual_return,
        status: bet.status,
        is_winner: bet.status === 'ganha',
        placed_at: bet.placed_at,
        resolved_at: bet.resolved_at
      }));

      return {
        bets: formattedBets,
        stats,
        pagination: {
          total: count || 0,
          limit,
          offset,
          has_more: (offset + limit) < (count || 0)
        }
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar apostas do usuário:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar apostas do usuário',
        details: error.message
      };
    }
  }

  /**
   * Cancela uma aposta (apenas valor não casado)
   * Com matching fracionado, só é possível cancelar o valor ainda pendente
   * 
   * @param {string} betId - ID da aposta
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Confirmação
   */
  async cancelBet(betId, userId) {
    try {
      console.log('========================================');
      console.log('🚫 [CANCEL FRACIONADO] INÍCIO');
      console.log('========================================');
      console.log('Bet ID:', betId);
      console.log('User ID:', userId);
      
      // Buscar aposta com valores de matching
      const { data: bet, error: betError } = await supabase
        .from('bets')
        .select(`
          *,
          serie:series(id, serie_number, status)
        `)
        .eq('id', betId)
        .eq('user_id', userId)
        .single();

      if (betError || !bet) {
        throw {
          code: 'NOT_FOUND',
          message: 'Aposta não encontrada'
        };
      }

      console.log('Aposta encontrada:');
      console.log('  - Valor total:', bet.amount / 100, 'reais');
      console.log('  - Valor casado:', bet.matched_amount / 100, 'reais');
      console.log('  - Valor restante:', bet.remaining_amount / 100, 'reais');
      console.log('  - Status atual:', bet.status);

      // Validar se há valor disponível para cancelar
      if (bet.remaining_amount <= 0) {
        throw {
          code: 'FULLY_MATCHED',
          message: 'Não é possível cancelar: aposta já foi totalmente casada',
          details: {
            matched_amount: bet.matched_amount,
            total_amount: bet.amount
          }
        };
      }

      // Validar que série ainda não foi encerrada
      if (bet.serie.status !== 'liberada' && bet.serie.status !== 'em_andamento') {
        throw {
          code: 'SERIE_ENDED',
          message: 'Não é possível cancelar aposta após série encerrar'
        };
      }

      // 1. Buscar wallet do usuário
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('id, balance')
        .eq('user_id', userId)
        .single();

      if (walletError || !wallet) {
        throw {
          code: 'WALLET_NOT_FOUND',
          message: 'Carteira não encontrada'
        };
      }

      const refundAmount = bet.remaining_amount; // Só reembolsa o que não foi casado

      console.log('\n💰 [CANCEL] Cálculo de reembolso:');
      console.log('  - Saldo atual:', wallet.balance / 100, 'reais');
      console.log('  - Valor a reembolsar:', refundAmount / 100, 'reais');
      console.log('  - Saldo após reembolso:', (wallet.balance + refundAmount) / 100, 'reais');

      // 2. Reembolsar o valor restante (não casado)
      const { error: updateWalletError } = await supabase
        .from('wallet')
        .update({
          balance: wallet.balance + refundAmount
        })
        .eq('user_id', userId);

      if (updateWalletError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao reembolsar saldo',
          details: updateWalletError.message
        };
      }

      console.log('✅ Wallet atualizada com sucesso');

      // 3. Criar transação de reembolso
      console.log('Criando transação de reembolso...');
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          bet_id: betId,
          type: 'reembolso',
          amount: refundAmount,
          balance_before: wallet.balance,
          balance_after: wallet.balance + refundAmount,
          fee: 0,
          net_amount: refundAmount,
          description: `Reembolso parcial de aposta - Série ${bet.serie.serie_number}`,
          status: 'completed',
          metadata: {
            serie_id: bet.serie_id,
            serie_number: bet.serie.serie_number,
            total_amount: bet.amount,
            matched_amount: bet.matched_amount,
            refunded_amount: refundAmount,
            cancellation_type: bet.matched_amount > 0 ? 'partial' : 'full',
            cancelled_at: new Date().toISOString(),
            reason: 'Aposta cancelada pelo usuário'
          }
        });

      if (transactionError) {
        console.error('❌ Erro ao criar transação:', transactionError);
      } else {
        console.log('✅ Transação de reembolso criada');
      }

      // 4. Atualizar status da aposta
      // Se tinha valor casado, marca como 'cancelada' mas mantém matched_amount
      // Se não tinha nada casado, cancela totalmente
      const newStatus = bet.matched_amount > 0 ? 'cancelada_parcial' : 'cancelada';
      
      console.log('Atualizando aposta...');
      const { error: updateError } = await supabase
        .from('bets')
        .update({
          status: 'cancelada',
          remaining_amount: 0, // Zera o valor restante
          resolved_at: new Date().toISOString()
        })
        .eq('id', betId);

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao cancelar aposta',
          details: updateError.message
        };
      }

      console.log('✅ Aposta atualizada');

      // 5. Verificar saldo final
      const { data: walletFinal } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', userId)
        .single();
      
      console.log('\n========================================');
      console.log('🎯 [CANCEL] RESUMO FINAL');
      console.log('========================================');
      console.log('Tipo:', bet.matched_amount > 0 ? 'CANCELAMENTO PARCIAL' : 'CANCELAMENTO TOTAL');
      console.log('Valor total da aposta:', bet.amount / 100, 'reais');
      console.log('Valor já casado:', bet.matched_amount / 100, 'reais (não reembolsado)');
      console.log('Valor reembolsado:', refundAmount / 100, 'reais');
      console.log('Saldo final:', walletFinal?.balance / 100, 'reais');
      console.log('========================================\n');

      return {
        success: true,
        message: bet.matched_amount > 0 
          ? 'Aposta parcialmente cancelada (parte casada mantida)' 
          : 'Aposta cancelada com sucesso',
        refunded_amount: refundAmount,
        cancellation_type: bet.matched_amount > 0 ? 'partial' : 'full',
        details: {
          total_amount: bet.amount,
          matched_amount: bet.matched_amount,
          refunded_amount: refundAmount
        }
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao cancelar aposta:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao cancelar aposta',
        details: error.message
      };
    }
  }

  /**
   * Busca apostas recentes (últimas apostas realizadas)
   * @param {number} limit - Limite de apostas
   * @returns {Promise<Array>} Apostas recentes
   */
  async getRecentBets(limit = 10) {
    try {
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select(`
          id,
          amount,
          status,
          placed_at,
          user:users(id, name),
          chosen_player:players!bets_chosen_player_id_fkey(id, name, nickname),
          serie:series(
            id,
            serie_number,
            match:matches(
              id,
              player1:players!matches_player1_id_fkey(id, name, nickname),
              player2:players!matches_player2_id_fkey(id, name, nickname)
            )
          )
        `)
        .order('placed_at', { ascending: false })
        .limit(limit);

      if (betsError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar apostas recentes',
          details: betsError.message
        };
      }

      return bets.map(bet => ({
        id: bet.id,
        user: {
          id: bet.user.id,
          name: bet.user.name
        },
        match: {
          id: bet.serie.match.id,
          player1: bet.serie.match.player1,
          player2: bet.serie.match.player2
        },
        serie_number: bet.serie.serie_number,
        chosen_player: {
          id: bet.chosen_player.id,
          name: bet.chosen_player.name,
          nickname: bet.chosen_player.nickname
        },
        amount: bet.amount,
        status: bet.status,
        placed_at: bet.placed_at
      }));
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar apostas recentes:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar apostas recentes',
        details: error.message
      };
    }
  }

  /**
   * Realiza matching automático FRACIONADO de apostas (FIFO)
   * Uma aposta pode casar com múltiplas apostas opostas
   * Exemplo: R$ 20 pode casar com 2x R$ 10
   * 
   * @param {Object} newBet - Nova aposta criada
   * @param {Object} serie - Dados da série
   * @returns {Promise<Object>} Resultado do matching
   */
  async _performAutoMatching(newBet, serie) {
    try {
      console.log('========================================');
      console.log('🔄 [MATCHING FRACIONADO] INICIANDO');
      console.log('========================================');
      console.log(`Aposta ID: ${newBet.id}`);
      console.log(`Usuário: ${newBet.user_id}`);
      console.log(`Valor: R$ ${newBet.amount / 100}`);
      console.log(`Jogador escolhido: ${newBet.chosen_player_id}`);

      // 1. Buscar ID do jogador oposto
      const opponentPlayerId = newBet.chosen_player_id === serie.match.player1_id 
        ? serie.match.player2_id 
        : serie.match.player1_id;

      console.log(`\n🎯 [MATCHING] Buscando apostas opostas em ${opponentPlayerId}...`);

      // 2. Buscar apostas disponíveis para matching (FIFO)
      const oppositeBets = await this._findOppositeBets(newBet.serie_id, opponentPlayerId);

      if (oppositeBets.length === 0) {
        console.log('⏳ [MATCHING] Nenhuma aposta oposta disponível.');
        console.log('   Status: PENDENTE (aguardando apostas opostas)');
        console.log('========================================\n');
        return { 
          matched: false, 
          status: 'pendente',
          matches: [],
          message: 'Aguardando apostas opostas' 
        };
      }

      console.log(`✅ [MATCHING] Encontradas ${oppositeBets.length} apostas disponíveis (FIFO)`);

      // 3. Realizar matching fracionado
      const matchingResult = await this._performFractionalMatching(newBet, oppositeBets);

      console.log('\n========================================');
      console.log('🎉 [MATCHING FRACIONADO] CONCLUÍDO');
      console.log('========================================');
      console.log(`Total de matches criados: ${matchingResult.matches.length}`);
      console.log(`Valor total casado: R$ ${matchingResult.totalMatched / 100}`);
      console.log(`Valor restante: R$ ${matchingResult.remaining / 100}`);
      console.log(`Status final: ${matchingResult.finalStatus}`);
      console.log('========================================\n');

      return matchingResult;

    } catch (error) {
      console.error('❌ [MATCHING] Erro no processo de matching:', error);
        return { 
          matched: false, 
          status: 'pendente',
        matches: [],
        message: 'Erro no matching, aposta ficará pendente' 
      };
    }
  }

  /**
   * Busca apostas opostas disponíveis para matching (FIFO)
   * @param {string} serieId - ID da série
   * @param {string} opponentPlayerId - ID do jogador oposto
   * @returns {Promise<Array>} Lista de apostas disponíveis (ordenadas por data)
   */
  async _findOppositeBets(serieId, opponentPlayerId) {
    try {
      // Buscar apostas com remaining_amount > 0 (FIFO)
      const { data: bets, error } = await supabase
        .from('bets')
        .select('id, user_id, amount, matched_amount, remaining_amount, chosen_player_id, placed_at, status')
        .eq('serie_id', serieId)
        .eq('chosen_player_id', opponentPlayerId)
        .gt('remaining_amount', 0) // Só apostas com valor disponível
        .in('status', ['pendente', 'parcialmente_aceita']) // Estados válidos
        .order('placed_at', { ascending: true }); // FIFO: mais antigas primeiro!

      if (error) {
        console.error('❌ [FIND] Erro ao buscar apostas opostas:', error);
        return [];
      }

      console.log(`   → Apostas disponíveis: ${bets?.length || 0}`);
      if (bets && bets.length > 0) {
        bets.forEach((bet, idx) => {
          console.log(`   ${idx + 1}. Aposta ${bet.id.substring(0, 8)}... - R$ ${bet.remaining_amount / 100} disponível`);
        });
      }

      return bets || [];
    } catch (error) {
      console.error('❌ [FIND] Erro:', error);
      return [];
    }
  }

  /**
   * Realiza matching fracionado entre nova aposta e apostas opostas
   * @param {Object} newBet - Nova aposta
   * @param {Array} oppositeBets - Apostas opostas disponíveis
   * @returns {Promise<Object>} Resultado do matching
   */
  async _performFractionalMatching(newBet, oppositeBets) {
    try {
      let remainingToMatch = newBet.amount;
      const matches = [];

      console.log(`\n💰 [FRACTIONAL] Tentando casar R$ ${remainingToMatch / 100}...`);

      // Percorrer apostas opostas (FIFO) e tentar casar
      for (const oppositeBet of oppositeBets) {
        if (remainingToMatch <= 0) break;

        const availableAmount = oppositeBet.remaining_amount;
        const matchAmount = Math.min(availableAmount, remainingToMatch);

        console.log(`\n   🔗 Casando com aposta ${oppositeBet.id.substring(0, 8)}...`);
        console.log(`      Disponível: R$ ${availableAmount / 100}`);
        console.log(`      Vai casar: R$ ${matchAmount / 100}`);

        matches.push({
          oppositeBet,
          matchAmount
        });

        remainingToMatch -= matchAmount;
        console.log(`      Restante para casar: R$ ${remainingToMatch / 100}`);
      }

      // Processar os matches encontrados
      if (matches.length > 0) {
        await this._processBetMatches(newBet, matches);
      }

      // Determinar status final
      const totalMatched = newBet.amount - remainingToMatch;
      let finalStatus = 'pendente';
      
      if (totalMatched === newBet.amount) {
        finalStatus = 'aceita'; // 100% casada
      } else if (totalMatched > 0) {
        finalStatus = 'parcialmente_aceita'; // Parcialmente casada
      }

      return {
        matched: totalMatched > 0,
        status: finalStatus,
        finalStatus,
        matches: matches.map(m => ({
          bet_id: m.oppositeBet.id,
          user_id: m.oppositeBet.user_id,
          amount: m.matchAmount
        })),
        totalMatched,
        remaining: remainingToMatch,
        message: finalStatus === 'aceita' 
          ? `Aposta totalmente casada com ${matches.length} aposta(s)!`
          : finalStatus === 'parcialmente_aceita'
          ? `Aposta parcialmente casada (${Math.round((totalMatched / newBet.amount) * 100)}%)`
          : 'Aguardando apostas opostas'
      };

    } catch (error) {
      console.error('❌ [FRACTIONAL] Erro:', error);
      throw error;
    }
  }

  /**
   * Processa e salva os matches no banco de dados
   * @param {Object} newBet - Nova aposta
   * @param {Array} matches - Lista de matches a processar
   */
  async _processBetMatches(newBet, matches) {
    try {
      console.log(`\n💾 [PROCESS] Salvando ${matches.length} match(es)...`);

      for (const match of matches) {
        const { oppositeBet, matchAmount } = match;

        // 1. Criar registro na tabela bet_matches
        const { error: matchError } = await supabase
          .from('bet_matches')
          .insert({
            serie_id: newBet.serie_id,
            bet_a_id: newBet.id,
            bet_b_id: oppositeBet.id,
            matched_amount: matchAmount
          });

        if (matchError) {
          console.error('❌ [PROCESS] Erro ao criar bet_match:', matchError);
          throw matchError;
        }

        // 2. Atualizar matched_amount da nova aposta (incrementar)
        const { data: currentNew } = await supabase
          .from('bets')
          .select('matched_amount')
          .eq('id', newBet.id)
          .single();

        const { error: updateNewError } = await supabase
        .from('bets')
        .update({ 
            matched_amount: (currentNew?.matched_amount || 0) + matchAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', newBet.id);

        if (updateNewError) {
          console.error('❌ [PROCESS] Erro ao atualizar nova aposta:', updateNewError);
          throw updateNewError;
        }

        // 3. Atualizar matched_amount da aposta oposta (incrementar)
        const { data: currentOpp } = await supabase
          .from('bets')
          .select('matched_amount')
          .eq('id', oppositeBet.id)
          .single();

        const { error: updateOppError } = await supabase
        .from('bets')
        .update({ 
            matched_amount: (currentOpp?.matched_amount || 0) + matchAmount,
          updated_at: new Date().toISOString()
        })
          .eq('id', oppositeBet.id);

        if (updateOppError) {
          console.error('❌ [PROCESS] Erro ao atualizar aposta oposta:', updateOppError);
          throw updateOppError;
      }

        console.log(`   ✅ Match salvo: R$ ${matchAmount / 100}`);
      }

      console.log('💾 [PROCESS] Todos os matches salvos com sucesso!');

    } catch (error) {
      console.error('❌ [PROCESS] Erro ao processar matches:', error);
      throw error;
    }
  }
}

module.exports = new BetsService();

