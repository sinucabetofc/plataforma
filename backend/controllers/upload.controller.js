/**
 * ============================================================
 * Upload Controller - Controlador de Uploads
 * ============================================================
 */

const uploadService = require('../services/upload.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class UploadController {
  /**
   * POST /api/upload/player-photo
   * Upload de foto de jogador
   */
  async uploadPlayerPhoto(req, res) {
    try {
      // Verificar se arquivo foi enviado
      if (!req.file) {
        return errorResponse(res, 400, 'Nenhum arquivo enviado');
      }

      const { playerId } = req.body;

      if (!playerId) {
        return errorResponse(res, 400, 'ID do jogador é obrigatório');
      }

      // Fazer upload
      const result = await uploadService.uploadPlayerPhoto(
        req.file.buffer,
        req.file.originalname,
        playerId
      );

      return successResponse(res, 200, 'Foto enviada com sucesso', {
        url: result.url,
        path: result.path
      });
    } catch (error) {
      console.error('Erro no controller uploadPlayerPhoto:', error);

      if (error.code === 'UPLOAD_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao fazer upload da foto');
    }
  }

  /**
   * PATCH /api/upload/player-photo/:playerId
   * Atualizar foto de jogador
   */
  async updatePlayerPhoto(req, res) {
    try {
      const { playerId } = req.params;
      const { oldPhotoUrl } = req.body;

      if (!req.file) {
        return errorResponse(res, 400, 'Nenhum arquivo enviado');
      }

      const url = await uploadService.updatePlayerPhoto(
        playerId,
        req.file.buffer,
        req.file.originalname,
        oldPhotoUrl
      );

      return successResponse(res, 200, 'Foto atualizada com sucesso', { url });
    } catch (error) {
      console.error('Erro no controller updatePlayerPhoto:', error);
      return errorResponse(res, 500, 'Erro ao atualizar foto');
    }
  }
}

module.exports = new UploadController();

