/**
 * ============================================================
 * Game Service - Lógica de Negócio de Jogos
 * ============================================================
 */

const { supabase } = require('../config/supabase.config');

class GameService {
  /**
   * Cria um novo jogo
   * @param {Object} gameData - Dados do jogo
   * @returns {Promise<Object>} Dados do jogo criado
   */
  async createGame(gameData) {
    try {
      const { player_a, player_b, modality, advantages, series, bet_limit } = gameData;

      // Inserir jogo no banco
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({
          player_a: player_a.trim(),
          player_b: player_b.trim(),
          modality: modality.trim(),
          advantages: advantages || null,
          series: series || 1,
          status: 'open',
          bet_limit: bet_limit || null,
          total_bet_player_a: 0.00,
          total_bet_player_b: 0.00
        })
        .select('*')
        .single();

      if (gameError) {
        console.error('Erro ao criar jogo:', gameError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar jogo',
          details: gameError.message
        };
      }

      return {
        id: game.id,
        player_a: game.player_a,
        player_b: game.player_b,
        modality: game.modality,
        advantages: game.advantages,
        series: game.series,
        status: game.status,
        bet_limit: game.bet_limit ? parseFloat(game.bet_limit) : null,
        total_bet_player_a: parseFloat(game.total_bet_player_a),
        total_bet_player_b: parseFloat(game.total_bet_player_b),
        created_at: game.created_at,
        updated_at: game.updated_at
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao criar jogo:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao criar jogo',
        details: error.message
      };
    }
  }

  /**
   * Lista jogos com filtros opcionais
   * @param {Object} filters - Filtros de busca
   * @returns {Promise<Object>} Lista de jogos e metadados
   */
  async listGames(filters = {}) {
    try {
      const { status, modality, limit = 20, offset = 0 } = filters;

      // Construir query base
      let query = supabase
        .from('games')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (status) {
        query = query.eq('status', status);
      }

      if (modality) {
        query = query.ilike('modality', `%${modality}%`);
      }

      // Ordenação e paginação
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: games, error: gamesError, count } = await query;

      if (gamesError) {
        console.error('Erro ao listar jogos:', gamesError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao listar jogos',
          details: gamesError.message
        };
      }

      // Formatar dados
      const formattedGames = games.map(game => ({
        id: game.id,
        player_a: game.player_a,
        player_b: game.player_b,
        modality: game.modality,
        advantages: game.advantages,
        series: game.series,
        status: game.status,
        result: game.result,
        bet_limit: game.bet_limit ? parseFloat(game.bet_limit) : null,
        total_bet_player_a: parseFloat(game.total_bet_player_a),
        total_bet_player_b: parseFloat(game.total_bet_player_b),
        started_at: game.started_at,
        finished_at: game.finished_at,
        created_at: game.created_at,
        updated_at: game.updated_at
      }));

      return {
        games: formattedGames,
        pagination: {
          total: count,
          limit,
          offset,
          has_more: offset + limit < count
        }
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao listar jogos:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao listar jogos',
        details: error.message
      };
    }
  }

  /**
   * Busca um jogo por ID
   * @param {string} gameId - ID do jogo
   * @returns {Promise<Object>} Dados do jogo
   */
  async getGameById(gameId) {
    try {
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        throw {
          code: 'NOT_FOUND',
          message: 'Jogo não encontrado'
        };
      }

      return {
        id: game.id,
        player_a: game.player_a,
        player_b: game.player_b,
        modality: game.modality,
        advantages: game.advantages,
        series: game.series,
        status: game.status,
        result: game.result,
        bet_limit: game.bet_limit ? parseFloat(game.bet_limit) : null,
        total_bet_player_a: parseFloat(game.total_bet_player_a),
        total_bet_player_b: parseFloat(game.total_bet_player_b),
        started_at: game.started_at,
        finished_at: game.finished_at,
        created_at: game.created_at,
        updated_at: game.updated_at
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar jogo:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar jogo',
        details: error.message
      };
    }
  }

  /**
   * Atualiza o status de um jogo
   * @param {string} gameId - ID do jogo
   * @param {string} status - Novo status
   * @param {string} result - Resultado do jogo (opcional)
   * @returns {Promise<Object>} Dados do jogo atualizado
   */
  async updateGameStatus(gameId, status, result = null) {
    try {
      // Verificar se jogo existe
      const game = await this.getGameById(gameId);

      // Construir dados de atualização
      const updateData = {
        status
      };

      if (status === 'in_progress' && !game.started_at) {
        updateData.started_at = new Date().toISOString();
      }

      if (status === 'finished') {
        updateData.result = result;
        updateData.finished_at = new Date().toISOString();
      } else {
        updateData.result = null;
      }

      // Atualizar jogo
      const { data: updatedGame, error: updateError } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', gameId)
        .select('*')
        .single();

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar status do jogo',
          details: updateError.message
        };
      }

      return {
        id: updatedGame.id,
        player_a: updatedGame.player_a,
        player_b: updatedGame.player_b,
        modality: updatedGame.modality,
        advantages: updatedGame.advantages,
        series: updatedGame.series,
        status: updatedGame.status,
        result: updatedGame.result,
        bet_limit: updatedGame.bet_limit ? parseFloat(updatedGame.bet_limit) : null,
        total_bet_player_a: parseFloat(updatedGame.total_bet_player_a),
        total_bet_player_b: parseFloat(updatedGame.total_bet_player_b),
        started_at: updatedGame.started_at,
        finished_at: updatedGame.finished_at,
        created_at: updatedGame.created_at,
        updated_at: updatedGame.updated_at
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao atualizar status do jogo:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao atualizar status do jogo',
        details: error.message
      };
    }
  }

  /**
   * Finaliza um jogo e distribui ganhos
   * @param {string} gameId - ID do jogo
   * @param {string} result - Resultado (player_a, player_b ou draw)
   * @returns {Promise<Object>} Resultado da finalização
   */
  async finishGameAndDistributeWinnings(gameId, result) {
    try {
      // 1. Verificar se jogo existe e está in_progress
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        throw {
          code: 'NOT_FOUND',
          message: 'Jogo não encontrado'
        };
      }

      if (game.status === 'finished') {
        throw {
          code: 'GAME_ALREADY_FINISHED',
          message: 'Este jogo já foi finalizado'
        };
      }

      if (game.status === 'open') {
        throw {
          code: 'GAME_NOT_STARTED',
          message: 'Este jogo ainda não foi iniciado'
        };
      }

      // 2. Atualizar jogo para finished
      const { error: updateGameError } = await supabase
        .from('games')
        .update({
          status: 'finished',
          result: result,
          finished_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (updateGameError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar jogo',
          details: updateGameError.message
        };
      }

      // 3. Buscar todas as apostas matched do jogo
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('id, user_id, side, amount, potential_return')
        .eq('game_id', gameId)
        .eq('status', 'matched');

      if (betsError) {
        console.error('Erro ao buscar apostas:', betsError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar apostas do jogo',
          details: betsError.message
        };
      }

      if (!bets || bets.length === 0) {
        // Sem apostas matched, apenas finalizar o jogo
        return {
          game_id: gameId,
          result: result,
          total_winners: 0,
          total_losers: 0,
          total_distributed: 0,
          message: 'Jogo finalizado sem apostas para distribuir'
        };
      }

      // 4. Separar vencedores e perdedores
      const winners = [];
      const losers = [];

      for (const bet of bets) {
        if (result === 'draw') {
          // Em caso de empate, todos recebem o valor apostado de volta
          winners.push(bet);
        } else if (bet.side === result) {
          // Vencedores
          winners.push(bet);
        } else {
          // Perdedores
          losers.push(bet);
        }
      }

      // 5. Distribuir ganhos para vencedores
      let totalDistributed = 0;
      const winnersProcessed = [];

      for (const winner of winners) {
        const winAmount = result === 'draw' 
          ? parseFloat(winner.amount) // Empate: devolve valor apostado
          : parseFloat(winner.potential_return); // Vitória: devolve potential_return

        try {
          // Creditar na carteira
          const { data: wallet, error: walletError } = await supabase
            .from('wallet')
            .select('balance')
            .eq('user_id', winner.user_id)
            .single();

          if (walletError || !wallet) {
            console.error(`Erro ao buscar carteira do usuário ${winner.user_id}`);
            continue;
          }

          const newBalance = parseFloat(wallet.balance) + winAmount;

          const { error: updateWalletError } = await supabase
            .from('wallet')
            .update({ balance: newBalance })
            .eq('user_id', winner.user_id);

          if (updateWalletError) {
            console.error(`Erro ao atualizar carteira do usuário ${winner.user_id}`);
            continue;
          }

          // Criar transação de ganho
          const { error: txError } = await supabase
            .from('transactions')
            .insert({
              user_id: winner.user_id,
              bet_id: winner.id,
              type: 'win',
              amount: winAmount,
              fee: 0,
              net_amount: winAmount,
              status: 'completed',
              description: result === 'draw' 
                ? `Empate no jogo ${gameId} - Valor devolvido`
                : `Ganho da aposta no jogo ${gameId}`,
              metadata: {
                game_id: gameId,
                bet_side: winner.side,
                result: result,
                original_bet: parseFloat(winner.amount)
              },
              processed_at: new Date().toISOString()
            });

          if (txError) {
            console.error(`Erro ao criar transação de ganho:`, txError);
          }

          // Atualizar status da aposta
          await supabase
            .from('bets')
            .update({
              status: result === 'draw' ? 'cancelled' : 'won',
              settled_at: new Date().toISOString()
            })
            .eq('id', winner.id);

          totalDistributed += winAmount;
          winnersProcessed.push({
            user_id: winner.user_id,
            amount: winAmount
          });
        } catch (error) {
          console.error(`Erro ao processar vencedor:`, error);
        }
      }

      // 6. Atualizar status das apostas perdedoras
      for (const loser of losers) {
        await supabase
          .from('bets')
          .update({
            status: 'lost',
            settled_at: new Date().toISOString()
          })
          .eq('id', loser.id);
      }

      // 7. Retornar resultado
      return {
        game_id: gameId,
        result: result,
        total_bets: bets.length,
        total_winners: winners.length,
        total_losers: losers.length,
        total_distributed: totalDistributed,
        winners_processed: winnersProcessed.length,
        message: result === 'draw' 
          ? 'Jogo empatado. Valores devolvidos aos apostadores.'
          : `Jogo finalizado. ${winners.length} vencedores, ${losers.length} perdedores. Total distribuído: R$ ${totalDistributed.toFixed(2)}`
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao finalizar jogo:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao finalizar jogo e distribuir ganhos',
        details: error.message
      };
    }
  }
}

module.exports = new GameService();

