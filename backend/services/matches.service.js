/**
 * ============================================================
 * Matches Service - Lógica de Negócio de Partidas
 * ============================================================
 */

const { supabase } = require('../config/supabase.config');

class MatchesService {
  /**
   * Cria uma nova partida
   * @param {Object} matchData - Dados da partida
   * @param {string} createdBy - ID do usuário criador
   * @returns {Promise<Object>} Dados da partida criada
   */
  async createMatch(matchData, createdBy) {
    try {
      const {
        scheduled_at,
        location,
        sport,
        youtube_url,
        player1_id,
        player2_id,
        game_rules,
        influencer_id,
        influencer_commission,
        total_series
      } = matchData;

      // Validar que jogadores são diferentes
      if (player1_id === player2_id) {
        throw {
          code: 'INVALID_PLAYERS',
          message: 'Os jogadores devem ser diferentes'
        };
      }

      // Verificar se jogadores existem
      const { data: player1, error: p1Error } = await supabase
        .from('players')
        .select('id, name, active')
        .eq('id', player1_id)
        .single();

      const { data: player2, error: p2Error } = await supabase
        .from('players')
        .select('id, name, active')
        .eq('id', player2_id)
        .single();

      if (p1Error || !player1) {
        throw {
          code: 'PLAYER_NOT_FOUND',
          message: 'Jogador 1 não encontrado'
        };
      }

      if (p2Error || !player2) {
        throw {
          code: 'PLAYER_NOT_FOUND',
          message: 'Jogador 2 não encontrado'
        };
      }

      if (!player1.active || !player2.active) {
        throw {
          code: 'PLAYER_INACTIVE',
          message: 'Ambos jogadores devem estar ativos'
        };
      }

      // Inserir partida no banco
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          scheduled_at,
          location: location || 'Brasil',
          sport: sport || 'sinuca',
          status: 'agendada',
          youtube_url: youtube_url || null,
          stream_active: false,
          player1_id,
          player2_id,
          game_rules: game_rules || {},
          created_by: createdBy,
          influencer_id: influencer_id || null,
          influencer_commission: influencer_commission || 0.00
        })
        .select('*')
        .single();

      if (matchError) {
        console.error('Erro ao criar partida:', matchError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar partida',
          details: matchError.message
        };
      }

      // Criar séries automaticamente
      const seriesCount = total_series || 3;
      const seriesPromises = [];
      
      for (let i = 1; i <= seriesCount; i++) {
        seriesPromises.push(
          supabase.from('series').insert({
            match_id: match.id,
            serie_number: i,
            status: 'pendente',
            betting_enabled: false,
            player1_score: 0,
            player2_score: 0
          })
        );
      }

      await Promise.all(seriesPromises);

      // Buscar dados completos com jogadores
      const completeMatch = await this.getMatchById(match.id);

      return completeMatch;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao criar partida:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao criar partida',
        details: error.message
      };
    }
  }

  /**
   * Lista partidas com filtros opcionais
   * @param {Object} filters - Filtros de busca
   * @returns {Promise<Object>} Lista de partidas e metadados
   */
  async listMatches(filters = {}) {
    try {
      const {
        status,
        sport,
        player_id,
        created_by,
        influencer_id,
        limit = 20,
        offset = 0
      } = filters;

      // Construir query base com join de jogadores
      let query = supabase
        .from('matches')
        .select(`
          *,
          player1:players!matches_player1_id_fkey(id, name, nickname, photo_url),
          player2:players!matches_player2_id_fkey(id, name, nickname, photo_url),
          creator:users!matches_created_by_fkey(id, name, email),
          influencer:influencers!matches_influencer_id_fkey(id, name, email)
        `, { count: 'exact' });

      // Aplicar filtros
      if (status) {
        query = query.eq('status', status);
      }

      if (sport) {
        query = query.eq('sport', sport);
      }

      if (player_id) {
        query = query.or(`player1_id.eq.${player_id},player2_id.eq.${player_id}`);
      }

      if (created_by) {
        query = query.eq('created_by', created_by);
      }

      if (influencer_id) {
        query = query.eq('influencer_id', influencer_id);
      }

      // Ordenação e paginação
      query = query
        .order('scheduled_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: matches, error: matchesError, count } = await query;

      if (matchesError) {
        console.error('Erro ao listar partidas:', matchesError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao listar partidas',
          details: matchesError.message
        };
      }

      // Buscar séries para cada partida
      const matchesWithSeries = await Promise.all(
        matches.map(async (match) => {
          // Buscar séries da partida
          const { data: series } = await supabase
            .from('series')
            .select('*')
            .eq('match_id', match.id)
            .order('serie_number', { ascending: true });

          return {
            id: match.id,
            scheduled_at: match.scheduled_at,
            location: match.location,
            sport: match.sport,
            status: match.status,
            youtube_url: match.youtube_url,
            stream_active: match.stream_active,
            player1: {
              id: match.player1.id,
              name: match.player1.name,
              nickname: match.player1.nickname,
              photo_url: match.player1.photo_url
            },
            player2: {
              id: match.player2.id,
              name: match.player2.name,
              nickname: match.player2.nickname,
              photo_url: match.player2.photo_url
            },
            game_rules: match.game_rules,
            series: series || [],
            created_by: match.creator ? {
              id: match.creator.id,
              name: match.creator.name,
              email: match.creator.email
            } : null,
            influencer: match.influencer ? {
              id: match.influencer.id,
              name: match.influencer.name,
              email: match.influencer.email
            } : null,
            influencer_commission: match.influencer_commission ? parseFloat(match.influencer_commission) : 0,
            created_at: match.created_at,
            updated_at: match.updated_at
          };
        })
      );

      const formattedMatches = matchesWithSeries;

      return {
        matches: formattedMatches,
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

      console.error('Erro ao listar partidas:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao listar partidas',
        details: error.message
      };
    }
  }

  /**
   * Busca uma partida por ID com séries
   * @param {string} matchId - ID da partida
   * @returns {Promise<Object>} Dados da partida
   */
  async getMatchById(matchId) {
    try {
      // Buscar partida com jogadores
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          player1:players!matches_player1_id_fkey(id, name, nickname, photo_url, win_rate),
          player2:players!matches_player2_id_fkey(id, name, nickname, photo_url, win_rate),
          creator:users!matches_created_by_fkey(id, name, email),
          influencer:influencers!matches_influencer_id_fkey(id, name, email)
        `)
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        throw {
          code: 'NOT_FOUND',
          message: 'Partida não encontrada'
        };
      }

      // Buscar séries da partida
      const { data: series, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .eq('match_id', matchId)
        .order('serie_number', { ascending: true });

      if (seriesError) {
        console.error('Erro ao buscar séries:', seriesError);
      }

      return {
        id: match.id,
        scheduled_at: match.scheduled_at,
        location: match.location,
        sport: match.sport,
        status: match.status,
        youtube_url: match.youtube_url,
        stream_active: match.stream_active,
        player1: {
          id: match.player1.id,
          name: match.player1.name,
          nickname: match.player1.nickname,
          photo_url: match.player1.photo_url,
          win_rate: parseFloat(match.player1.win_rate)
        },
        player2: {
          id: match.player2.id,
          name: match.player2.name,
          nickname: match.player2.nickname,
          photo_url: match.player2.photo_url,
          win_rate: parseFloat(match.player2.win_rate)
        },
        game_rules: match.game_rules,
        created_by: match.creator ? {
          id: match.creator.id,
          name: match.creator.name,
          email: match.creator.email
        } : null,
        influencer: match.influencer ? {
          id: match.influencer.id,
          name: match.influencer.name,
          email: match.influencer.email
        } : null,
        influencer_commission: match.influencer_commission ? parseFloat(match.influencer_commission) : 0,
        series: series || [],
        created_at: match.created_at,
        updated_at: match.updated_at
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar partida:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar partida',
        details: error.message
      };
    }
  }

  /**
   * Atualiza dados de uma partida
   * @param {string} matchId - ID da partida
   * @param {Object} updateData - Dados a atualizar
   * @returns {Promise<Object>} Dados da partida atualizada
   */
  async updateMatch(matchId, updateData) {
    try {
      // Verificar se partida existe
      await this.getMatchById(matchId);

      // Construir dados de atualização
      const dataToUpdate = {};

      if (updateData.scheduled_at) dataToUpdate.scheduled_at = updateData.scheduled_at;
      if (updateData.location) dataToUpdate.location = updateData.location;
      if (updateData.sport) dataToUpdate.sport = updateData.sport;
      if (updateData.youtube_url !== undefined) dataToUpdate.youtube_url = updateData.youtube_url;
      if (updateData.stream_active !== undefined) dataToUpdate.stream_active = updateData.stream_active;
      if (updateData.game_rules) dataToUpdate.game_rules = updateData.game_rules;
      if (updateData.influencer_id !== undefined) dataToUpdate.influencer_id = updateData.influencer_id;
      if (updateData.influencer_commission !== undefined) dataToUpdate.influencer_commission = updateData.influencer_commission;

      // Atualizar partida
      const { error: updateError } = await supabase
        .from('matches')
        .update(dataToUpdate)
        .eq('id', matchId);

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar partida',
          details: updateError.message
        };
      }

      // Buscar dados atualizados
      const updatedMatch = await this.getMatchById(matchId);
      return updatedMatch;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao atualizar partida:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao atualizar partida',
        details: error.message
      };
    }
  }

  /**
   * Atualiza o status de uma partida
   * @param {string} matchId - ID da partida
   * @param {string} status - Novo status
   * @returns {Promise<Object>} Dados da partida atualizada
   */
  async updateMatchStatus(matchId, status) {
    try {
      // Verificar se partida existe
      await this.getMatchById(matchId);

      // Validar status
      const validStatuses = ['agendada', 'em_andamento', 'finalizada', 'cancelada'];
      if (!validStatuses.includes(status)) {
        throw {
          code: 'INVALID_STATUS',
          message: `Status inválido. Use: ${validStatuses.join(', ')}`
        };
      }

      // Atualizar status
      const { error: updateError } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId);

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar status da partida',
          details: updateError.message
        };
      }

      // Buscar dados atualizados
      const updatedMatch = await this.getMatchById(matchId);
      return updatedMatch;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao atualizar status da partida:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao atualizar status da partida',
        details: error.message
      };
    }
  }

  /**
   * Deleta uma partida
   * @param {string} matchId - ID da partida
   * @returns {Promise<Object>} Confirmação
   */
  async deleteMatch(matchId) {
    try {
      // Verificar se partida existe
      await this.getMatchById(matchId);

      // Buscar séries da partida
      const { data: series, error: seriesError } = await supabase
        .from('series')
        .select('id')
        .eq('match_id', matchId);

      if (seriesError) {
        console.error('Erro ao buscar séries:', seriesError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao verificar séries da partida'
        };
      }

      // Se houver séries, verificar se há apostas
      if (series && series.length > 0) {
        const seriesIds = series.map(s => s.id);
        
        const { data: bets, error: betsError } = await supabase
          .from('bets')
          .select('id')
          .in('serie_id', seriesIds)
          .limit(1);

        if (betsError) {
          console.error('Erro ao verificar apostas:', betsError);
        }

        if (bets && bets.length > 0) {
          throw {
            code: 'MATCH_HAS_BETS',
            message: 'Não é possível deletar partida com apostas. Use cancelamento.'
          };
        }
      }

      // Deletar partida (CASCADE vai deletar séries)
      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (deleteError) {
        console.error('Erro ao deletar partida:', deleteError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao deletar partida',
          details: deleteError.message
        };
      }

      return {
        success: true,
        message: 'Partida deletada com sucesso'
      };
    } catch (error) {
      console.error('Erro no deleteMatch:', error);
      if (error.code) {
        throw error;
      }

      console.error('Erro ao deletar partida:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao deletar partida',
        details: error.message
      };
    }
  }
}

module.exports = new MatchesService();

