/**
 * ============================================================
 * Series Service - Lógica de Negócio de Séries
 * ============================================================
 */

const { supabase } = require('../config/supabase.config');

class SeriesService {
  /**
   * Busca séries de uma partida
   * @param {string} matchId - ID da partida
   * @returns {Promise<Array>} Lista de séries
   */
  async getSeriesByMatch(matchId) {
    try {
      const { data: series, error: seriesError } = await supabase
        .from('series')
        .select(`
          *,
          match:matches(
            id,
            player1_id,
            player2_id,
            status
          ),
          winner:players!series_winner_player_id_fkey(id, name, nickname)
        `)
        .eq('match_id', matchId)
        .order('serie_number', { ascending: true });

      if (seriesError) {
        console.error('Erro ao buscar séries:', seriesError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar séries',
          details: seriesError.message
        };
      }

      return series.map(serie => ({
        id: serie.id,
        match_id: serie.match_id,
        serie_number: serie.serie_number,
        status: serie.status,
        betting_enabled: serie.betting_enabled,
        betting_locked_at: serie.betting_locked_at,
        started_at: serie.started_at,
        ended_at: serie.ended_at,
        player1_score: serie.player1_score,
        player2_score: serie.player2_score,
        winner: serie.winner ? {
          id: serie.winner.id,
          name: serie.winner.name,
          nickname: serie.winner.nickname
        } : null,
        created_at: serie.created_at,
        updated_at: serie.updated_at
      }));
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar séries:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar séries',
        details: error.message
      };
    }
  }

  /**
   * Busca séries finalizadas (últimos resultados)
   * @param {Object} filters - Filtros (limit, offset)
   * @returns {Promise<Array>} Array de séries finalizadas
   */
  async getFinishedSeries(filters = {}) {
    try {
      const { limit = 5, offset = 0 } = filters;

      const { data: series, error: seriesError } = await supabase
        .from('series')
        .select(`
          *,
          match:matches(
            id,
            scheduled_at,
            game_rules,
            player1:players!matches_player1_id_fkey(id, name, nickname, photo_url),
            player2:players!matches_player2_id_fkey(id, name, nickname, photo_url)
          ),
          winner:players!series_winner_player_id_fkey(id, name, nickname, photo_url)
        `)
        .eq('status', 'encerrada')
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (seriesError) {
        console.error('Erro ao buscar séries finalizadas:', seriesError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar séries finalizadas',
          details: seriesError
        };
      }

      return series || [];
    } catch (error) {
      if (error.code) throw error;
      
      console.error('Erro no serviço getFinishedSeries:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno ao buscar séries finalizadas'
      };
    }
  }

  /**
   * Busca uma série por ID
   * @param {string} serieId - ID da série
   * @returns {Promise<Object>} Dados da série
   */
  async getSerieById(serieId) {
    try {
      const { data: serie, error: serieError } = await supabase
        .from('series')
        .select(`
          *,
          match:matches(
            id,
            player1_id,
            player2_id,
            player1:players!matches_player1_id_fkey(id, name, nickname, photo_url),
            player2:players!matches_player2_id_fkey(id, name, nickname, photo_url)
          ),
          winner:players!series_winner_player_id_fkey(id, name, nickname)
        `)
        .eq('id', serieId)
        .single();

      if (serieError || !serie) {
        throw {
          code: 'NOT_FOUND',
          message: 'Série não encontrada'
        };
      }

      return {
        id: serie.id,
        match_id: serie.match_id,
        serie_number: serie.serie_number,
        status: serie.status,
        betting_enabled: serie.betting_enabled,
        betting_locked_at: serie.betting_locked_at,
        started_at: serie.started_at,
        ended_at: serie.ended_at,
        player1_score: serie.player1_score,
        player2_score: serie.player2_score,
        winner: serie.winner ? {
          id: serie.winner.id,
          name: serie.winner.name,
          nickname: serie.winner.nickname
        } : null,
        match: {
          id: serie.match.id,
          player1: {
            id: serie.match.player1.id,
            name: serie.match.player1.name,
            nickname: serie.match.player1.nickname,
            photo_url: serie.match.player1.photo_url
          },
          player2: {
            id: serie.match.player2.id,
            name: serie.match.player2.name,
            nickname: serie.match.player2.nickname,
            photo_url: serie.match.player2.photo_url
          }
        },
        created_at: serie.created_at,
        updated_at: serie.updated_at
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar série:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar série',
        details: error.message
      };
    }
  }

  /**
   * Libera uma série para apostas
   * @param {string} serieId - ID da série
   * @returns {Promise<Object>} Dados da série atualizada
   */
  async releaseSerie(serieId) {
    try {
      const serie = await this.getSerieById(serieId);

      // Validar que série está pendente
      if (serie.status !== 'pendente') {
        throw {
          code: 'INVALID_STATUS',
          message: `Série deve estar pendente. Status atual: ${serie.status}`
        };
      }

      // Atualizar série
      const { error: updateError } = await supabase
        .from('series')
        .update({
          status: 'liberada',
          betting_enabled: true
        })
        .eq('id', serieId);

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao liberar série',
          details: updateError.message
        };
      }

      // Buscar dados atualizados
      const updatedSerie = await this.getSerieById(serieId);
      return updatedSerie;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao liberar série:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao liberar série',
        details: error.message
      };
    }
  }

  /**
   * Inicia uma série (travar apostas)
   * @param {string} serieId - ID da série
   * @returns {Promise<Object>} Dados da série atualizada
   */
  async startSerie(serieId) {
    try {
      const serie = await this.getSerieById(serieId);

      // Validar que série está liberada
      if (serie.status !== 'liberada') {
        throw {
          code: 'INVALID_STATUS',
          message: `Série deve estar liberada. Status atual: ${serie.status}`
        };
      }

      // Atualizar status das apostas para 'aceita'
      const { error: betsError } = await supabase
        .from('bets')
        .update({ status: 'aceita' })
        .eq('serie_id', serieId)
        .eq('status', 'pendente');

      if (betsError) {
        console.error('Erro ao atualizar apostas:', betsError);
      }

      // Atualizar série
      const { error: updateError } = await supabase
        .from('series')
        .update({
          status: 'em_andamento'
          // Trigger vai setar started_at e betting_locked_at
        })
        .eq('id', serieId);

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao iniciar série',
          details: updateError.message
        };
      }

      // Buscar dados atualizados
      const updatedSerie = await this.getSerieById(serieId);
      return updatedSerie;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao iniciar série:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao iniciar série',
        details: error.message
      };
    }
  }

  /**
   * Finaliza uma série com vencedor
   * @param {string} serieId - ID da série
   * @param {Object} resultData - Dados do resultado
   * @returns {Promise<Object>} Dados da série finalizada
   */
  async finishSerie(serieId, resultData) {
    try {
      const { winner_player_id, player1_score, player2_score } = resultData;

      const serie = await this.getSerieById(serieId);

      // Validar que série está em andamento
      if (serie.status !== 'em_andamento') {
        throw {
          code: 'INVALID_STATUS',
          message: `Série deve estar em andamento. Status atual: ${serie.status}`
        };
      }

      // Validar que vencedor é um dos jogadores
      const validPlayers = [serie.match.player1.id, serie.match.player2.id];
      if (!validPlayers.includes(winner_player_id)) {
        throw {
          code: 'INVALID_WINNER',
          message: 'Vencedor deve ser um dos jogadores da partida'
        };
      }

      // Atualizar série
      const { error: updateError } = await supabase
        .from('series')
        .update({
          status: 'encerrada',
          winner_player_id,
          player1_score: player1_score || 0,
          player2_score: player2_score || 0
          // Trigger vai:
          // 1. Setar ended_at
          // 2. Atualizar apostas (ganhas/perdidas)
          // 3. Creditar ganhos nas wallets
        })
        .eq('id', serieId);

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao finalizar série',
          details: updateError.message
        };
      }

      // Buscar dados atualizados
      const updatedSerie = await this.getSerieById(serieId);
      
      // Buscar estatísticas das apostas
      const betsStats = await this._getSeriesBetsStats(serieId);

      return {
        ...updatedSerie,
        bets_stats: betsStats
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao finalizar série:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao finalizar série',
        details: error.message
      };
    }
  }

  /**
   * Cancela uma série e reembolsa apostas
   * @param {string} serieId - ID da série
   * @returns {Promise<Object>} Confirmação
   */
  async cancelSerie(serieId) {
    try {
      const serie = await this.getSerieById(serieId);

      // Não pode cancelar série já encerrada
      if (serie.status === 'encerrada') {
        throw {
          code: 'SERIE_FINISHED',
          message: 'Não é possível cancelar série já encerrada'
        };
      }

      // Buscar apostas da série
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('id, user_id, amount')
        .eq('serie_id', serieId)
        .in('status', ['pendente', 'aceita']);

      if (betsError) {
        console.error('Erro ao buscar apostas:', betsError);
      }

      // Reembolsar apostas
      if (bets && bets.length > 0) {
        for (const bet of bets) {
          // Creditar saldo de volta
          await supabase
            .from('wallet')
            .update({
              balance: supabase.sql`balance + ${bet.amount}`
            })
            .eq('user_id', bet.user_id);

          // Criar transação de reembolso
          const { data: wallet } = await supabase
            .from('wallet')
            .select('id, balance')
            .eq('user_id', bet.user_id)
            .single();

          if (wallet) {
            await supabase
              .from('transactions')
              .insert({
                wallet_id: wallet.id,
                bet_id: bet.id,
                type: 'reembolso',
                amount: bet.amount,
                balance_before: wallet.balance - bet.amount,
                balance_after: wallet.balance,
                description: `Reembolso - Série ${serie.serie_number} cancelada`
              });
          }

          // Atualizar aposta
          await supabase
            .from('bets')
            .update({ 
              status: 'reembolsada',
              resolved_at: new Date().toISOString()
            })
            .eq('id', bet.id);
        }
      }

      // Atualizar série
      const { error: updateError } = await supabase
        .from('series')
        .update({
          status: 'cancelada',
          betting_enabled: false
        })
        .eq('id', serieId);

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao cancelar série',
          details: updateError.message
        };
      }

      return {
        success: true,
        message: 'Série cancelada com sucesso',
        bets_refunded: bets ? bets.length : 0
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao cancelar série:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao cancelar série',
        details: error.message
      };
    }
  }

  /**
   * Atualiza placar de uma série em andamento
   * @param {string} serieId - ID da série
   * @param {Object} scoreData - Dados do placar
   * @returns {Promise<Object>} Dados da série atualizada
   */
  async updateScore(serieId, scoreData) {
    try {
      const { player1_score, player2_score } = scoreData;

      const serie = await this.getSerieById(serieId);

      // Validar que série está em andamento
      if (serie.status !== 'em_andamento') {
        throw {
          code: 'INVALID_STATUS',
          message: `Série deve estar em andamento. Status atual: ${serie.status}`
        };
      }

      // Atualizar placar
      const { error: updateError } = await supabase
        .from('series')
        .update({
          player1_score: player1_score !== undefined ? player1_score : serie.player1_score,
          player2_score: player2_score !== undefined ? player2_score : serie.player2_score
        })
        .eq('id', serieId);

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar placar',
          details: updateError.message
        };
      }

      // Buscar dados atualizados
      const updatedSerie = await this.getSerieById(serieId);
      return updatedSerie;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao atualizar placar:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao atualizar placar',
        details: error.message
      };
    }
  }

  /**
   * Busca estatísticas de apostas de uma série (privado)
   * @param {string} serieId - ID da série
   * @returns {Promise<Object>} Estatísticas
   */
  async _getSeriesBetsStats(serieId) {
    try {
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('status, amount')
        .eq('serie_id', serieId);

      if (betsError || !bets) {
        return {
          total_bets: 0,
          total_amount: 0,
          winners: 0,
          losers: 0
        };
      }

      const totalBets = bets.length;
      const totalAmount = bets.reduce((sum, b) => sum + b.amount, 0);
      const winners = bets.filter(b => b.status === 'ganha').length;
      const losers = bets.filter(b => b.status === 'perdida').length;

      return {
        total_bets: totalBets,
        total_amount: totalAmount,
        winners,
        losers
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de apostas:', error);
      return {
        total_bets: 0,
        total_amount: 0,
        winners: 0,
        losers: 0
      };
    }
  }
}

module.exports = new SeriesService();

