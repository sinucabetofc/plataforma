/**
 * ============================================================
 * Players Service - Lógica de Negócio de Jogadores
 * ============================================================
 */

const { supabase } = require('../config/supabase.config');

class PlayersService {
  /**
   * Cria um novo jogador
   * @param {Object} playerData - Dados do jogador
   * @returns {Promise<Object>} Dados do jogador criado
   */
  async createPlayer(playerData) {
    try {
      const {
        name,
        nickname,
        photo_url,
        bio,
        active = true
      } = playerData;

      // Inserir jogador no banco
      const { data: player, error } = await supabase
        .from('players')
        .insert({
          name: name.trim(),
          nickname: nickname?.trim() || name.trim().split(' ')[0],
          photo_url: photo_url || 'https://ui-avatars.com/api/?name=Jogador&size=150&background=27E502&color=000',
          bio: bio || '',
          active,
          total_matches: 0,
          total_wins: 0,
          total_losses: 0,
          win_rate: 0
        })
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao criar jogador:', error);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar jogador',
          details: error.message
        };
      }

      return player;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao criar jogador:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao criar jogador',
        details: error.message
      };
    }
  }

  /**
   * Lista jogadores com filtros opcionais
   * @param {Object} filters - Filtros de busca
   * @returns {Promise<Object>} Lista de jogadores e metadados
   */
  async listPlayers(filters = {}) {
    try {
      const {
        active,
        search,
        limit = 50,
        offset = 0
      } = filters;

      // Construir query base
      let query = supabase
        .from('players')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (active !== undefined && active !== null) {
        // Remover filtro de active por padrão para listar todos
        // query = query.eq('active', active);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,nickname.ilike.%${search}%`);
      }

      // Ordenação e paginação
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: players, error, count } = await query;

      if (error) {
        console.error('Erro ao listar jogadores:', error);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao listar jogadores',
          details: error.message
        };
      }

      return {
        players: players || [],
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

      console.error('Erro ao listar jogadores:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao listar jogadores',
        details: error.message
      };
    }
  }

  /**
   * Busca um jogador por ID
   * @param {string} playerId - ID do jogador
   * @returns {Promise<Object>} Dados do jogador
   */
  async getPlayerById(playerId) {
    try {
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error || !player) {
        throw {
          code: 'NOT_FOUND',
          message: 'Jogador não encontrado'
        };
      }

      return player;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar jogador:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar jogador',
        details: error.message
      };
    }
  }

  /**
   * Atualiza dados de um jogador
   * @param {string} playerId - ID do jogador
   * @param {Object} updateData - Dados a atualizar
   * @returns {Promise<Object>} Dados do jogador atualizado
   */
  async updatePlayer(playerId, updateData) {
    try {
      // Verificar se jogador existe
      await this.getPlayerById(playerId);

      // Construir dados de atualização
      const dataToUpdate = {};

      if (updateData.name) dataToUpdate.name = updateData.name.trim();
      if (updateData.nickname) dataToUpdate.nickname = updateData.nickname.trim();
      if (updateData.photo_url !== undefined) dataToUpdate.photo_url = updateData.photo_url;
      if (updateData.bio !== undefined) dataToUpdate.bio = updateData.bio;
      if (updateData.active !== undefined) dataToUpdate.active = updateData.active;

      // Atualizar jogador
      const { data: player, error } = await supabase
        .from('players')
        .update(dataToUpdate)
        .eq('id', playerId)
        .select('*')
        .single();

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar jogador',
          details: error.message
        };
      }

      return player;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao atualizar jogador:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao atualizar jogador',
        details: error.message
      };
    }
  }

  /**
   * Deleta um jogador (soft delete - marca como inativo)
   * @param {string} playerId - ID do jogador
   * @returns {Promise<Object>} Confirmação
   */
  async deletePlayer(playerId) {
    try {
      // Verificar se jogador existe
      await this.getPlayerById(playerId);

      // Verificar se jogador tem partidas
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id')
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
        .limit(1);

      if (matchesError) {
        console.error('Erro ao verificar partidas:', matchesError);
      }

      if (matches && matches.length > 0) {
        // Soft delete - apenas marca como inativo
        await supabase
          .from('players')
          .update({ active: false })
          .eq('id', playerId);

        return {
          success: true,
          message: 'Jogador desativado com sucesso (possui partidas registradas)'
        };
      }

      // Hard delete - realmente deleta se não tiver partidas
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (deleteError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao deletar jogador',
          details: deleteError.message
        };
      }

      return {
        success: true,
        message: 'Jogador deletado com sucesso'
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao deletar jogador:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao deletar jogador',
        details: error.message
      };
    }
  }

  /**
   * Busca estatísticas gerais dos jogadores
   * @returns {Promise<Object>} Estatísticas
   */
  async getPlayersStats() {
    try {
      // Contar total de jogadores
      const { count: totalPlayers } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true });

      // Contar jogadores ativos
      const { count: activePlayers } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Buscar jogador com maior win rate
      const { data: topPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('active', true)
        .gt('total_matches', 0)
        .order('win_rate', { ascending: false })
        .limit(1)
        .single();

      return {
        total_players: totalPlayers || 0,
        active_players: activePlayers || 0,
        inactive_players: (totalPlayers || 0) - (activePlayers || 0),
        top_player: topPlayer || null
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar estatísticas',
        details: error.message
      };
    }
  }
}

module.exports = new PlayersService();

