/**
 * ============================================================
 * Upload Service - Gerenciamento de Uploads
 * ============================================================
 * Serviço para upload de imagens no Supabase Storage
 */

const { supabase } = require('../config/supabase.config');
const crypto = require('crypto');

class UploadService {
  /**
   * Upload de imagem de jogador
   * @param {Buffer} fileBuffer - Buffer do arquivo
   * @param {string} fileName - Nome original do arquivo
   * @param {string} playerId - ID do jogador
   * @returns {Promise<Object>} URL pública da imagem
   */
  async uploadPlayerPhoto(fileBuffer, fileName, playerId) {
    try {
      // Gerar nome único para o arquivo
      const fileExt = fileName.split('.').pop();
      const uniqueName = `${playerId}-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
      const filePath = `players/${uniqueName}`;

      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, fileBuffer, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw {
          code: 'UPLOAD_ERROR',
          message: 'Erro ao fazer upload da imagem',
          details: error.message
        };
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao fazer upload:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao fazer upload',
        details: error.message
      };
    }
  }

  /**
   * Deletar foto de jogador
   * @param {string} photoPath - Caminho da foto no storage
   * @returns {Promise<void>}
   */
  async deletePlayerPhoto(photoPath) {
    try {
      if (!photoPath) return;

      // Extrair apenas o caminho se for URL completa
      const path = photoPath.includes('/')
        ? photoPath.split('/').slice(-2).join('/')
        : photoPath;

      const { error } = await supabase.storage
        .from('photos')
        .remove([path]);

      if (error) {
        console.error('Erro ao deletar foto:', error);
      }
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
    }
  }

  /**
   * Atualizar foto do jogador
   * @param {string} playerId - ID do jogador
   * @param {Buffer} fileBuffer - Buffer do arquivo
   * @param {string} fileName - Nome original
   * @param {string} oldPhotoUrl - URL da foto antiga (para deletar)
   * @returns {Promise<string>} Nova URL
   */
  async updatePlayerPhoto(playerId, fileBuffer, fileName, oldPhotoUrl) {
    try {
      // Upload nova foto
      const { url, path } = await this.uploadPlayerPhoto(fileBuffer, fileName, playerId);

      // Deletar foto antiga (se não for placeholder ou base64)
      if (oldPhotoUrl && 
          !oldPhotoUrl.includes('placeholder') && 
          !oldPhotoUrl.startsWith('data:')) {
        await this.deletePlayerPhoto(oldPhotoUrl);
      }

      // Atualizar na tabela players
      const { error: updateError } = await supabase
        .from('players')
        .update({ photo_url: url })
        .eq('id', playerId);

      if (updateError) {
        console.error('Erro ao atualizar URL da foto:', updateError);
      }

      return url;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao atualizar foto:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao atualizar foto',
        details: error.message
      };
    }
  }
}

module.exports = new UploadService();

