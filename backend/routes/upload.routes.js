/**
 * ============================================================
 * Upload Routes - Rotas de Upload
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

/**
 * POST /api/upload/player-photo
 * Upload de foto de jogador
 * Multipart form-data: { file, playerId }
 */
router.post(
  '/player-photo',
  authenticateToken,
  upload.single('file'),
  uploadController.uploadPlayerPhoto
);

/**
 * PATCH /api/upload/player-photo/:playerId
 * Atualizar foto de jogador
 * Multipart form-data: { file, oldPhotoUrl }
 */
router.patch(
  '/player-photo/:playerId',
  authenticateToken,
  upload.single('file'),
  uploadController.updatePlayerPhoto
);

module.exports = router;

