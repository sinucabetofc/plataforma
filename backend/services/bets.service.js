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
      const { serie_id, chosen_player_id, amount } = betData;

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

      // 5. Buscar saldo atualizado
      const { data: updatedWallet } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', userId)
        .single();

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
          status: bet.status,
          placed_at: bet.placed_at
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
   * Busca apostas de uma série específica
   * @param {string} serieId - ID da série
   * @returns {Promise<Object>} Apostas da série
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

      // Calcular estatísticas
      const totalBets = bets.length;
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
            bets: []
          };
        }
        betsByPlayer[playerId].total_bets++;
        betsByPlayer[playerId].total_amount += bet.amount;
        betsByPlayer[playerId].bets.push({
          id: bet.id,
          user: {
            id: bet.user.id,
            name: bet.user.name
          },
          amount: bet.amount,
          status: bet.status,
          placed_at: bet.placed_at
        });
      });

      return {
        serie: bets[0] ? bets[0].serie : null,
        stats: {
          total_bets: totalBets,
          total_amount: totalAmount
        },
        by_player: betsByPlayer,
        all_bets: bets.map(bet => ({
          id: bet.id,
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
   * Cancela uma aposta (apenas pendente)
   * @param {string} betId - ID da aposta
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Confirmação
   */
  async cancelBet(betId, userId) {
    try {
      // Buscar aposta
      const { data: bet, error: betError } = await supabase
        .from('bets')
        .select(`
          *,
          serie:series(status)
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

      // Validar que aposta está pendente
      if (bet.status !== 'pendente') {
        throw {
          code: 'INVALID_STATUS',
          message: 'Apenas apostas pendentes podem ser canceladas'
        };
      }

      // Validar que série ainda não foi encerrada (permitir cancelar em "liberada" ou "em_andamento")
      if (bet.serie.status !== 'liberada' && bet.serie.status !== 'em_andamento') {
        throw {
          code: 'SERIE_ENDED',
          message: 'Não é possível cancelar aposta após série encerrar'
        };
      }

      // SISTEMA DE BLOQUEIO: Não reembolsamos porque nunca debitamos
      // O saldo estava apenas "bloqueado" virtualmente
      // Apenas atualizamos o status da aposta para "cancelada"
      
      const { error: updateError } = await supabase
        .from('bets')
        .update({
          status: 'cancelada',
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

      return {
        success: true,
        message: 'Aposta cancelada com sucesso',
        refunded_amount: bet.amount // Valor que foi reembolsado
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
}

module.exports = new BetsService();

