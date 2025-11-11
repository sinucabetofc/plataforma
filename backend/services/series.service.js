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

      // Se já está liberada, retornar sucesso sem fazer nada (idempotência)
      if (serie.status === 'liberada') {
        console.log(`⚠️ Série ${serieId} já está liberada, retornando sem alterações`);
        return serie;
      }

      // Validar que série está pendente
      if (serie.status !== 'pendente') {
        throw {
          code: 'INVALID_STATUS',
          message: `Não é possível liberar série. Status atual: ${serie.status}`
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

      // Se já está em andamento, retornar sucesso sem fazer nada (idempotência)
      if (serie.status === 'em_andamento') {
        console.log(`⚠️ Série ${serieId} já está em andamento, retornando sem alterações`);
        return serie;
      }

      // Validar que série está liberada
      if (serie.status !== 'liberada') {
        throw {
          code: 'INVALID_STATUS',
          message: `Não é possível iniciar série. Status atual: ${serie.status}`
        };
      }

      // Atualizar status das apostas pendentes para 'aceita'
      const { error: betsError } = await supabase
        .from('bets')
        .update({ status: 'aceita' })
        .eq('serie_id', serieId)
        .eq('status', 'pendente');

      if (betsError) {
        console.error('Erro ao atualizar apostas:', betsError);
      }

      // Atualizar série - MANTÉM betting_enabled = true para apostas ao vivo
      const { error: updateError } = await supabase
        .from('series')
        .update({
          status: 'em_andamento'
          // Trigger vai setar started_at mas NÃO trava apostas
          // betting_enabled permanece true para permitir apostas ao vivo
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

      // Se já está encerrada, retornar sucesso sem fazer nada (idempotência)
      if (serie.status === 'encerrada') {
        console.log(`⚠️ Série ${serieId} já está encerrada, retornando sem alterações`);
        const betsStats = await this._getSeriesBetsStats(serieId);
        return {
          ...serie,
          bets_stats: betsStats
        };
      }

      // Validar que série está em andamento
      if (serie.status !== 'em_andamento') {
        throw {
          code: 'INVALID_STATUS',
          message: `Não é possível finalizar série. Status atual: ${serie.status}`
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

      // Se já está cancelada, retornar sucesso sem fazer nada (idempotência)
      if (serie.status === 'cancelada') {
        console.log(`⚠️ Série ${serieId} já está cancelada, retornando sem alterações`);
        return {
          serie,
          refunded_bets: 0,
          refunded_amount: 0
        };
      }

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

  /**
   * Cria uma nova série para uma partida
   * @param {string} matchId - ID da partida
   * @returns {Promise<Object>} Dados da série criada
   */
  async createSerie(matchId) {
    try {
      // Verificar se partida existe
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('id, status')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        throw {
          code: 'NOT_FOUND',
          message: 'Partida não encontrada'
        };
      }

      // Não permitir adicionar série se partida já foi finalizada
      if (match.status === 'finalizada' || match.status === 'cancelada') {
        throw {
          code: 'INVALID_STATUS',
          message: 'Não é possível adicionar série em partida finalizada ou cancelada'
        };
      }

      // Buscar número da última série
      const { data: lastSerie } = await supabase
        .from('series')
        .select('serie_number')
        .eq('match_id', matchId)
        .order('serie_number', { ascending: false })
        .limit(1)
        .single();

      const nextSerieNumber = lastSerie ? lastSerie.serie_number + 1 : 1;

      // Criar nova série
      const { data: newSerie, error: createError } = await supabase
        .from('series')
        .insert({
          match_id: matchId,
          serie_number: nextSerieNumber,
          status: 'pendente',
          betting_enabled: false,
          player1_score: 0,
          player2_score: 0
        })
        .select('*')
        .single();

      if (createError) {
        console.error('Erro ao criar série:', createError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar série',
          details: createError.message
        };
      }

      return {
        id: newSerie.id,
        match_id: newSerie.match_id,
        serie_number: newSerie.serie_number,
        status: newSerie.status,
        betting_enabled: newSerie.betting_enabled,
        betting_locked_at: newSerie.betting_locked_at,
        started_at: newSerie.started_at,
        ended_at: newSerie.ended_at,
        player1_score: newSerie.player1_score,
        player2_score: newSerie.player2_score,
        winner_player_id: newSerie.winner_player_id,
        created_at: newSerie.created_at,
        updated_at: newSerie.updated_at
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao criar série:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao criar série',
        details: error.message
      };
    }
  }

  /**
   * Deleta uma série
   * @param {string} serieId - ID da série
   * @returns {Promise<void>}
   */
  async deleteSerie(serieId) {
    try {
      // Verificar se série existe
      const serie = await this.getSerieById(serieId);

      // Não permitir deletar série com apostas
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('id')
        .eq('serie_id', serieId)
        .limit(1);

      if (betsError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao verificar apostas',
          details: betsError.message
        };
      }

      if (bets && bets.length > 0) {
        throw {
          code: 'HAS_BETS',
          message: 'Não é possível deletar série com apostas. Cancele a série para reembolsar.'
        };
      }

      // Não permitir deletar série finalizada
      if (serie.status === 'encerrada') {
        throw {
          code: 'INVALID_STATUS',
          message: 'Não é possível deletar série já encerrada'
        };
      }

      // Deletar série
      const { error: deleteError } = await supabase
        .from('series')
        .delete()
        .eq('id', serieId);

      if (deleteError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao deletar série',
          details: deleteError.message
        };
      }

      return { success: true };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao deletar série:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao deletar série',
        details: error.message
      };
    }
  }

  /**
   * Atualiza informações de uma série (número, etc)
   * @param {string} serieId - ID da série
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Série atualizada
   */
  async updateSerie(serieId, updateData) {
    try {
      // Verificar se série existe
      await this.getSerieById(serieId);

      // Não permitir editar série finalizada ou em andamento
      const { data: currentSerie } = await supabase
        .from('series')
        .select('status')
        .eq('id', serieId)
        .single();

      if (currentSerie.status === 'em_andamento') {
        throw {
          code: 'INVALID_STATUS',
          message: 'Não é possível editar série em andamento'
        };
      }

      if (currentSerie.status === 'encerrada') {
        throw {
          code: 'INVALID_STATUS',
          message: 'Não é possível editar série já encerrada'
        };
      }

      // Atualizar apenas campos permitidos
      const allowedFields = ['serie_number'];
      const dataToUpdate = {};
      
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          dataToUpdate[key] = updateData[key];
        }
      });

      if (Object.keys(dataToUpdate).length === 0) {
        throw {
          code: 'VALIDATION_ERROR',
          message: 'Nenhum campo válido para atualizar'
        };
      }

      // Atualizar série
      const { data: updatedSerie, error: updateError } = await supabase
        .from('series')
        .update(dataToUpdate)
        .eq('id', serieId)
        .select('*')
        .single();

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar série',
          details: updateError.message
        };
      }

      return {
        id: updatedSerie.id,
        match_id: updatedSerie.match_id,
        serie_number: updatedSerie.serie_number,
        status: updatedSerie.status,
        betting_enabled: updatedSerie.betting_enabled,
        player1_score: updatedSerie.player1_score,
        player2_score: updatedSerie.player2_score,
        winner_player_id: updatedSerie.winner_player_id,
        updated_at: updatedSerie.updated_at
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao atualizar série:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao atualizar série',
        details: error.message
      };
    }
  }

  /**
   * Resolve apostas de uma série quando ela é encerrada
   * Processa ganhos baseado em matched_amount (matching fracionado)
   * 
   * @param {string} serieId - ID da série
   * @param {string} winnerPlayerId - ID do jogador vencedor
   * @returns {Promise<Object>} Resultado do processamento
   */
  async resolveSerieWinners(serieId, winnerPlayerId) {
    try {
      console.log('========================================');
      console.log('🏆 [RESOLVE] PROCESSANDO GANHOS');
      console.log('========================================');
      console.log(`Série ID: ${serieId}`);
      console.log(`Vencedor: ${winnerPlayerId}`);

      // 1. Buscar todas as apostas da série (aceitas e parcialmente aceitas)
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select(`
          *,
          user:users(id, name),
          chosen_player:players!bets_chosen_player_id_fkey(id, name)
        `)
        .eq('serie_id', serieId)
        .in('status', ['aceita', 'parcialmente_aceita'])
        .gt('matched_amount', 0); // Só apostas com valor casado

      if (betsError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao buscar apostas',
          details: betsError.message
        };
      }

      console.log(`\n📊 Total de apostas a resolver: ${bets?.length || 0}`);

      if (!bets || bets.length === 0) {
        console.log('⚠️  Nenhuma aposta para resolver');
        console.log('========================================\n');
        return {
          success: true,
          processed: 0,
          winners: 0,
          losers: 0
        };
      }

      // 2. Processar cada aposta
      const results = {
        winners: [],
        losers: [],
        errors: []
      };

      for (const bet of bets) {
        try {
          const isWinner = bet.chosen_player_id === winnerPlayerId;

          console.log(`\n🎯 Processando aposta ${bet.id.substring(0, 8)}...`);
          console.log(`   Usuário: ${bet.user.name}`);
          console.log(`   Jogador: ${bet.chosen_player.name}`);
          console.log(`   Valor casado: R$ ${bet.matched_amount / 100}`);
          console.log(`   Resultado: ${isWinner ? '✅ GANHOU' : '❌ PERDEU'}`);

          if (isWinner) {
            // GANHOU: Retorno = matched_amount * 2
            const winAmount = bet.matched_amount * 2;
            
            console.log(`   💰 Vai receber: R$ ${winAmount / 100}`);

            // Creditar saldo
            const { data: wallet } = await supabase
              .from('wallet')
              .select('id, balance')
              .eq('user_id', bet.user_id)
              .single();

            if (!wallet) {
              console.error(`   ❌ Wallet não encontrada para usuário ${bet.user_id}`);
              results.errors.push({ bet_id: bet.id, error: 'Wallet not found' });
              continue;
            }

            await supabase
              .from('wallet')
              .update({
                balance: wallet.balance + winAmount
              })
              .eq('user_id', bet.user_id);

            // Criar transação de ganho
            await supabase
              .from('transactions')
              .insert({
                wallet_id: wallet.id,
                user_id: bet.user_id,
                bet_id: bet.id,
                type: 'ganho',
                amount: winAmount,
                balance_before: wallet.balance,
                balance_after: wallet.balance + winAmount,
                fee: 0,
                net_amount: winAmount,
                description: `Ganho de aposta - Série ${bet.serie_id}`,
                status: 'completed',
                metadata: {
                  serie_id: serieId,
                  matched_amount: bet.matched_amount,
                  win_multiplier: 2,
                  chosen_player_id: bet.chosen_player_id,
                  winner_player_id: winnerPlayerId
                }
              });

            // Atualizar aposta
            await supabase
              .from('bets')
              .update({
                status: 'ganha',
                actual_return: winAmount,
                resolved_at: new Date().toISOString()
              })
              .eq('id', bet.id);

            console.log(`   ✅ Ganho creditado: R$ ${winAmount / 100}`);
            results.winners.push({ bet_id: bet.id, amount: winAmount });

          } else {
            // PERDEU: Não recebe nada
            console.log(`   ❌ Perdeu R$ ${bet.matched_amount / 100}`);

            // Atualizar aposta
            await supabase
              .from('bets')
              .update({
                status: 'perdida',
                actual_return: 0,
                resolved_at: new Date().toISOString()
              })
              .eq('id', bet.id);

            console.log(`   ✅ Aposta marcada como perdida`);
            results.losers.push({ bet_id: bet.id });
          }

        } catch (error) {
          console.error(`   ❌ Erro ao processar aposta ${bet.id}:`, error);
          results.errors.push({ bet_id: bet.id, error: error.message });
        }
      }

      console.log('\n========================================');
      console.log('🎉 [RESOLVE] PROCESSAMENTO CONCLUÍDO');
      console.log('========================================');
      console.log(`✅ Apostas ganhadoras: ${results.winners.length}`);
      console.log(`❌ Apostas perdedoras: ${results.losers.length}`);
      console.log(`⚠️  Erros: ${results.errors.length}`);
      
      if (results.winners.length > 0) {
        const totalPaid = results.winners.reduce((sum, w) => sum + w.amount, 0);
        console.log(`💰 Total pago: R$ ${totalPaid / 100}`);
      }
      
      console.log('========================================\n');

      return {
        success: true,
        processed: bets.length,
        winners: results.winners.length,
        losers: results.losers.length,
        errors: results.errors.length,
        details: results
      };

    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao resolver apostas:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao resolver apostas',
        details: error.message
      };
    }
  }
}

module.exports = new SeriesService();



