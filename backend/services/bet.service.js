/**
 * ============================================================
 * Bet Service - Lógica de Negócio de Apostas
 * ============================================================
 */

const { supabase } = require('../config/supabase.config');
const walletService = require('./wallet.service');

class BetService {
  /**
   * Cria uma nova aposta com casamento automático
   * @param {string} userId - ID do usuário
   * @param {string} gameId - ID do jogo
   * @param {string} side - Lado da aposta (player_a ou player_b)
   * @param {number} amount - Valor da aposta
   * @returns {Promise<Object>} Dados da aposta e matching
   */
  async createBet(userId, gameId, side, amount) {
    try {
      // 1. Verificar se o jogo existe e está open
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id, status, player_a, player_b, modality, total_bet_player_a, total_bet_player_b')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        throw {
          code: 'NOT_FOUND',
          message: 'Jogo não encontrado'
        };
      }

      // Permitir apostas em jogos "open" ou "in_progress" (apostas ao vivo)
      if (game.status !== 'open' && game.status !== 'in_progress') {
        throw {
          code: 'GAME_NOT_ACCEPTING_BETS',
          message: 'Este jogo não está mais aceitando apostas',
          details: { status: game.status }
        };
      }

      // 2. Verificar saldo disponível e bloquear
      const available = await walletService.blockBalance(userId, amount);

      // 3. Criar a aposta com status pending
      const { data: bet, error: betError } = await supabase
        .from('bets')
        .insert({
          game_id: gameId,
          user_id: userId,
          side: side,
          amount: amount,
          status: 'pending'
        })
        .select('id, game_id, user_id, side, amount, status, created_at')
        .single();

      if (betError) {
        // Rollback: desbloquear saldo
        await this._unblockBalance(userId, amount);
        
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar aposta',
          details: betError.message
        };
      }

      // 4. Criar transação de aposta
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          bet_id: bet.id,
          type: 'bet',
          amount: amount,
          fee: 0,
          net_amount: amount,
          status: 'completed',
          description: `Aposta no jogo ${gameId} - ${side}`,
          metadata: {
            game_id: gameId,
            side: side,
            player: side === 'player_a' ? game.player_a : game.player_b
          }
        });

      if (txError) {
        console.error('Erro ao criar transação de aposta:', txError);
      }

      // 5. Tentar matching automático
      const matchResult = await this._performMatching(bet.id, gameId, side, amount);

      // 6. Buscar saldo atualizado
      const walletData = await walletService.getWallet(userId);

      // 7. Retornar resultado
      return {
        bet: {
          id: bet.id,
          game_id: bet.game_id,
          side: bet.side,
          amount: parseFloat(bet.amount),
          status: matchResult.status,
          matched: matchResult.matched,
          potential_return: matchResult.potential_return,
          created_at: bet.created_at
        },
        matching: {
          status: matchResult.matched ? 'matched' : 'pending',
          matched_bets: matchResult.matched_bets || 0,
          pending_amount: matchResult.pending_amount || 0,
          message: matchResult.message
        },
        wallet: {
          balance: walletData.wallet.balance,
          blocked_balance: walletData.wallet.blocked_balance,
          available_balance: walletData.wallet.available_balance
        },
        game: {
          player_a: game.player_a,
          player_b: game.player_b,
          modality: game.modality
        }
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao criar aposta:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao processar aposta',
        details: error.message
      };
    }
  }

  /**
   * Realiza matching automático de apostas
   * @param {string} betId - ID da aposta atual
   * @param {string} gameId - ID do jogo
   * @param {string} side - Lado da aposta
   * @param {number} amount - Valor da aposta
   * @returns {Promise<Object>} Resultado do matching
   */
  async _performMatching(betId, gameId, side, amount) {
    try {
      // Lado oposto para matching
      const oppositeSide = side === 'player_a' ? 'player_b' : 'player_a';

      // Buscar apostas pendentes do lado oposto
      const { data: pendingBets, error: pendingError } = await supabase
        .from('bets')
        .select('id, amount, user_id')
        .eq('game_id', gameId)
        .eq('side', oppositeSide)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (pendingError) {
        console.error('Erro ao buscar apostas pendentes:', pendingError);
        return {
          status: 'pending',
          matched: false,
          message: 'Aposta criada, aguardando matching'
        };
      }

      if (!pendingBets || pendingBets.length === 0) {
        return {
          status: 'pending',
          matched: false,
          message: 'Aposta criada, aguardando apostas do lado oposto'
        };
      }

      // Tentar matching 1x1 ou emparceirado
      let remainingAmount = amount;
      const matchedBets = [];
      let totalMatched = 0;

      for (const oppBet of pendingBets) {
        if (remainingAmount <= 0) break;

        const oppAmount = parseFloat(oppBet.amount);
        const matchAmount = Math.min(remainingAmount, oppAmount);

        matchedBets.push({
          bet_id: oppBet.id,
          match_amount: matchAmount,
          user_id: oppBet.user_id
        });

        totalMatched += matchAmount;
        remainingAmount -= matchAmount;

        // Se a aposta oposta foi totalmente matchada
        if (matchAmount === oppAmount) {
          // Atualizar status para matched
          await supabase
            .from('bets')
            .update({
              status: 'matched',
              matched_at: new Date().toISOString(),
              potential_return: matchAmount * 2 // 1:1, sem taxa (taxa de 8% só no saque)
            })
            .eq('id', oppBet.id);

          // Desbloquear saldo da aposta oposta
          await this._unblockBalance(oppBet.user_id, oppAmount);
        } else {
          // Aposta oposta foi parcialmente matchada
          // Criar nova aposta com o resto
          const remainingOppAmount = oppAmount - matchAmount;
          
          await supabase
            .from('bets')
            .update({
              amount: matchAmount,
              status: 'matched',
              matched_at: new Date().toISOString(),
              potential_return: matchAmount * 2 // 1:1, sem taxa
            })
            .eq('id', oppBet.id);

          // Criar nova aposta pending com o resto
          await supabase
            .from('bets')
            .insert({
              game_id: gameId,
              user_id: oppBet.user_id,
              side: oppositeSide,
              amount: remainingOppAmount,
              status: 'pending'
            });

          // Ajustar saldo bloqueado
          await this._unblockBalance(oppBet.user_id, matchAmount);
        }
      }

      // Atualizar aposta atual
      if (totalMatched === amount) {
        // Totalmente matchada
        await supabase
          .from('bets')
          .update({
            status: 'matched',
            matched_at: new Date().toISOString(),
            potential_return: amount * 2 // 1:1, sem taxa
          })
          .eq('id', betId);

        // Desbloquear saldo
        const { data: currentBet } = await supabase
          .from('bets')
          .select('user_id')
          .eq('id', betId)
          .single();

        if (currentBet) {
          await this._unblockBalance(currentBet.user_id, amount);
        }

        // Atualizar totais do jogo
        await this._updateGameTotals(gameId, side, amount);

        return {
          status: 'matched',
          matched: true,
          matched_bets: matchedBets.length,
          potential_return: amount * 2, // 1:1, sem taxa
          message: 'Aposta totalmente matchada!'
        };
      } else if (totalMatched > 0) {
        // Parcialmente matchada
        await supabase
          .from('bets')
          .update({
            amount: totalMatched,
            status: 'matched',
            matched_at: new Date().toISOString(),
            potential_return: totalMatched * 2 // 1:1, sem taxa
          })
          .eq('id', betId);

        // Criar nova aposta pending com o resto
        const { data: currentBet } = await supabase
          .from('bets')
          .select('user_id')
          .eq('id', betId)
          .single();

        if (currentBet) {
          await supabase
            .from('bets')
            .insert({
              game_id: gameId,
              user_id: currentBet.user_id,
              side: side,
              amount: remainingAmount,
              status: 'pending'
            });

          // Desbloquear apenas a parte matched
          await this._unblockBalance(currentBet.user_id, totalMatched);
        }

        // Atualizar totais do jogo
        await this._updateGameTotals(gameId, side, totalMatched);

        return {
          status: 'partially_matched',
          matched: true,
          matched_bets: matchedBets.length,
          matched_amount: totalMatched,
          pending_amount: remainingAmount,
          potential_return: totalMatched * 2, // 1:1, sem taxa
          message: `Aposta parcialmente matchada: R$ ${totalMatched.toFixed(2)} matched, R$ ${remainingAmount.toFixed(2)} aguardando`
        };
      } else {
        return {
          status: 'pending',
          matched: false,
          message: 'Aposta criada, aguardando matching'
        };
      }
    } catch (error) {
      console.error('Erro no matching:', error);
      return {
        status: 'pending',
        matched: false,
        message: 'Aposta criada, erro no matching automático'
      };
    }
  }

  /**
   * Atualiza totais de apostas no jogo
   * @param {string} gameId - ID do jogo
   * @param {string} side - Lado da aposta
   * @param {number} amount - Valor
   */
  async _updateGameTotals(gameId, side, amount) {
    try {
      const field = side === 'player_a' ? 'total_bet_player_a' : 'total_bet_player_b';
      
      const { data: game } = await supabase
        .from('games')
        .select(field)
        .eq('id', gameId)
        .single();

      if (game) {
        const currentTotal = parseFloat(game[field]) || 0;
        const newTotal = currentTotal + amount;

        await supabase
          .from('games')
          .update({ [field]: newTotal })
          .eq('id', gameId);
      }
    } catch (error) {
      console.error('Erro ao atualizar totais do jogo:', error);
    }
  }

  /**
   * Desbloqueia saldo do usuário
   * @param {string} userId - ID do usuário
   * @param {number} amount - Valor a desbloquear
   */
  async _unblockBalance(userId, amount) {
    try {
      const { data: wallet } = await supabase
        .from('wallet')
        .select('blocked_balance')
        .eq('user_id', userId)
        .single();

      if (wallet) {
        const newBlocked = Math.max(0, parseFloat(wallet.blocked_balance) - amount);
        
        await supabase
          .from('wallet')
          .update({ blocked_balance: newBlocked })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Erro ao desbloquear saldo:', error);
    }
  }

  /**
   * Lista apostas de um jogo específico
   * @param {string} gameId - ID do jogo
   * @returns {Promise<Object>} Apostas e totais
   */
  async getGameBets(gameId) {
    try {
      // 1. Verificar se jogo existe
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id, player_a, player_b, modality, status, total_bet_player_a, total_bet_player_b')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        throw {
          code: 'NOT_FOUND',
          message: 'Jogo não encontrado'
        };
      }

      // 2. Buscar apostas do jogo
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select(`
          id,
          user_id,
          side,
          amount,
          potential_return,
          status,
          matched_at,
          created_at,
          users (name, email)
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (betsError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar apostas',
          details: betsError.message
        };
      }

      // 3. Calcular estatísticas
      const playerABets = bets.filter(b => b.side === 'player_a');
      const playerBBets = bets.filter(b => b.side === 'player_b');

      const totalPlayerA = parseFloat(game.total_bet_player_a) || 0;
      const totalPlayerB = parseFloat(game.total_bet_player_b) || 0;
      const totalBets = totalPlayerA + totalPlayerB;

      // 4. Criar labels anônimos para apostas (por lado, em ordem de criação)
      const playerABetsWithLabels = playerABets.map((bet, index) => ({
        ...bet,
        label: `Aposta #${index + 1}`
      }));
      
      const playerBBetsWithLabels = playerBBets.map((bet, index) => ({
        ...bet,
        label: `Aposta #${index + 1}`
      }));

      // 5. Formatar resposta
      return {
        game: {
          id: game.id,
          player_a: game.player_a,
          player_b: game.player_b,
          modality: game.modality,
          status: game.status
        },
        totals: {
          player_a: {
            total: totalPlayerA,
            bets_count: playerABets.length,
            percentage: totalBets > 0 ? ((totalPlayerA / totalBets) * 100).toFixed(2) : 0
          },
          player_b: {
            total: totalPlayerB,
            bets_count: playerBBets.length,
            percentage: totalBets > 0 ? ((totalPlayerB / totalBets) * 100).toFixed(2) : 0
          },
          total: totalBets,
          total_bets_count: bets.length
        },
        bets: {
          player_a: playerABetsWithLabels.map(bet => ({
            id: bet.id,
            label: bet.label,
            amount: parseFloat(bet.amount),
            potential_return: bet.potential_return ? parseFloat(bet.potential_return) : null,
            status: bet.status,
            matched_at: bet.matched_at,
            created_at: bet.created_at
          })),
          player_b: playerBBetsWithLabels.map(bet => ({
            id: bet.id,
            label: bet.label,
            amount: parseFloat(bet.amount),
            potential_return: bet.potential_return ? parseFloat(bet.potential_return) : null,
            status: bet.status,
            matched_at: bet.matched_at,
            created_at: bet.created_at
          }))
        }
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar apostas do jogo:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar apostas do jogo',
        details: error.message
      };
    }
  }

  /**
   * Lista apostas do usuário autenticado
   * @param {string} userId - ID do usuário
   * @param {number} limit - Número máximo de apostas
   * @param {number} offset - Offset para paginação
   * @returns {Promise<Object>} Apostas do usuário
   */
  async getUserBets(userId, limit = 50, offset = 0) {
    try {
      // Buscar apostas do usuário com informações do jogo
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select(`
          id,
          game_id,
          side,
          amount,
          potential_return,
          status,
          matched_at,
          result,
          payout_amount,
          created_at,
          games (
            id,
            player_a,
            player_b,
            modality,
            status,
            result,
            finished_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (betsError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar apostas do usuário',
          details: betsError.message
        };
      }

      // Contar total de apostas
      const { count, error: countError } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Calcular estatísticas
      const stats = {
        total_bets: count || 0,
        pending: bets.filter(b => b.status === 'pending').length,
        matched: bets.filter(b => b.status === 'matched').length,
        won: bets.filter(b => b.status === 'won').length,
        lost: bets.filter(b => b.status === 'lost').length,
        total_wagered: bets.reduce((sum, b) => sum + parseFloat(b.amount), 0),
        total_won: bets.filter(b => b.status === 'won').reduce((sum, b) => sum + parseFloat(b.payout_amount || 0), 0),
      };

      // Formatar resposta
      return {
        bets: bets.map(bet => ({
          id: bet.id,
          game: {
            id: bet.games?.id,
            player_a: bet.games?.player_a,
            player_b: bet.games?.player_b,
            modality: bet.games?.modality,
            status: bet.games?.status,
            result: bet.games?.result,
            finished_at: bet.games?.finished_at
          },
          side: bet.side,
          amount: parseFloat(bet.amount),
          potential_return: bet.potential_return ? parseFloat(bet.potential_return) : null,
          status: bet.status,
          result: bet.result,
          payout_amount: bet.payout_amount ? parseFloat(bet.payout_amount) : null,
          matched_at: bet.matched_at,
          created_at: bet.created_at
        })),
        stats,
        pagination: {
          limit,
          offset,
          total: count || 0,
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
   * Lista apostas recentes de todos os usuários
   * @param {number} limit - Número máximo de apostas a retornar (padrão: 10)
   * @returns {Promise<Object>} Últimas apostas com informações do jogo e usuário
   */
  async getRecentBets(limit = 10) {
    try {
      // Buscar últimas apostas com informações do jogo e usuário
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select(`
          id,
          user_id,
          game_id,
          side,
          amount,
          potential_return,
          status,
          matched_at,
          created_at,
          users (name, email),
          games (
            id,
            player_a,
            player_b,
            modality,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (betsError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar apostas recentes',
          details: betsError.message
        };
      }

      // Formatar resposta
      return {
        bets: bets.map(bet => ({
          id: bet.id,
          user: {
            id: bet.user_id,
            name: bet.users?.name || 'Anônimo'
          },
          game: {
            id: bet.games?.id,
            player_a: bet.games?.player_a,
            player_b: bet.games?.player_b,
            modality: bet.games?.modality,
            status: bet.games?.status
          },
          side: bet.side,
          amount: parseFloat(bet.amount),
          potential_return: bet.potential_return ? parseFloat(bet.potential_return) : null,
          status: bet.status,
          matched_at: bet.matched_at,
          created_at: bet.created_at
        })),
        count: bets.length
      };
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
}

module.exports = new BetService();

