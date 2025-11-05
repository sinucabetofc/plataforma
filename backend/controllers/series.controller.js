/**
 * ============================================================
 * Series Controller - Controlador de Séries
 * ============================================================
 */

const seriesService = require('../services/series.service');
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse
} = require('../utils/response.util');

class SeriesController {
  /**
   * GET /api/series/match/:matchId
   * Busca séries de uma partida
   */
  async getSeriesByMatch(req, res) {
    try {
      const { matchId } = req.params;

      const series = await seriesService.getSeriesByMatch(matchId);

      return successResponse(res, 200, 'Séries obtidas com sucesso', { series });
    } catch (error) {
      console.error('Erro no controller getSeriesByMatch:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar séries');
    }
  }

  /**
   * GET /api/series/finished
   * Busca séries finalizadas (últimos resultados)
   */
  async getFinishedSeries(req, res) {
    try {
      const { limit = 5, offset = 0 } = req.query;

      const series = await seriesService.getFinishedSeries({
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return successResponse(res, 200, 'Séries finalizadas obtidas com sucesso', series);
    } catch (error) {
      console.error('Erro no controller getFinishedSeries:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar séries finalizadas');
    }
  }

  /**
   * GET /api/series/:id
   * Busca uma série por ID
   */
  async getSerie(req, res) {
    try {
      const { id } = req.params;

      const serie = await seriesService.getSerieById(id);

      return successResponse(res, 200, 'Série encontrada', serie);
    } catch (error) {
      console.error('Erro no controller getSerie:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar série');
    }
  }

  /**
   * POST /api/series/:id/release
   * Libera uma série para apostas
   */
  async releaseSerie(req, res) {
    try {
      const { id } = req.params;

      const serie = await seriesService.releaseSerie(id);

      return successResponse(res, 200, 'Série liberada para apostas', serie);
    } catch (error) {
      console.error('Erro no controller releaseSerie:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'INVALID_STATUS') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao liberar série');
    }
  }

  /**
   * POST /api/series/:id/start
   * Inicia uma série (travar apostas)
   */
  async startSerie(req, res) {
    try {
      const { id } = req.params;

      const serie = await seriesService.startSerie(id);

      return successResponse(res, 200, 'Série iniciada com sucesso', serie);
    } catch (error) {
      console.error('Erro no controller startSerie:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'INVALID_STATUS') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao iniciar série');
    }
  }

  /**
   * POST /api/series/:id/finish
   * Finaliza uma série com vencedor
   */
  async finishSerie(req, res) {
    try {
      const { id } = req.params;
      const resultData = req.body;

      // Validar dados
      if (!resultData.winner_player_id) {
        return validationErrorResponse(res, [{
          field: 'winner_player_id',
          message: 'Vencedor é obrigatório'
        }]);
      }

      const serie = await seriesService.finishSerie(id, resultData);

      return successResponse(res, 200, 'Série finalizada com sucesso', serie);
    } catch (error) {
      console.error('Erro no controller finishSerie:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'INVALID_STATUS') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'INVALID_WINNER') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao finalizar série');
    }
  }

  /**
   * POST /api/series/:id/cancel
   * Cancela uma série e reembolsa apostas
   */
  async cancelSerie(req, res) {
    try {
      const { id } = req.params;

      const result = await seriesService.cancelSerie(id);

      return successResponse(res, 200, result.message, {
        bets_refunded: result.bets_refunded
      });
    } catch (error) {
      console.error('Erro no controller cancelSerie:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'SERIE_FINISHED') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao cancelar série');
    }
  }

  /**
   * PATCH /api/series/:id/score
   * Atualiza placar de uma série em andamento
   */
  async updateScore(req, res) {
    try {
      const { id } = req.params;
      const scoreData = req.body;

      const serie = await seriesService.updateScore(id, scoreData);

      return successResponse(res, 200, 'Placar atualizado com sucesso', serie);
    } catch (error) {
      console.error('Erro no controller updateScore:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'INVALID_STATUS') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao atualizar placar');
    }
  }

  /**
   * GET /api/series/health
   * Verifica saúde do serviço de séries
   */
  async health(req, res) {
    return successResponse(res, 200, 'Serviço de séries está funcionando', {
      timestamp: new Date().toISOString(),
      service: 'series'
    });
  }
}

module.exports = new SeriesController();

