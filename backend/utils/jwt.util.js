/**
 * ============================================================
 * JWT Utility - Geração e Verificação de Tokens JWT
 * ============================================================
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Gera um token JWT
 * @param {Object} payload - Dados a serem incluídos no token
 * @param {string} payload.user_id - ID do usuário
 * @param {string} payload.email - Email do usuário
 * @returns {string} Token JWT gerado
 */
function generateToken(payload) {
  try {
    const token = jwt.sign(
      {
        user_id: payload.user_id,
        email: payload.email
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'sinucabet-api',
        audience: 'sinucabet-users'
      }
    );
    return token;
  } catch (error) {
    throw new Error('Erro ao gerar token JWT: ' + error.message);
  }
}

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token JWT a ser verificado
 * @returns {Object} Payload decodificado do token
 * @throws {Error} Se o token for inválido ou expirado
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sinucabet-api',
      audience: 'sinucabet-users'
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    throw new Error('Erro ao verificar token: ' + error.message);
  }
}

/**
 * Decodifica um token JWT sem verificar a assinatura
 * @param {string} token - Token JWT a ser decodificado
 * @returns {Object} Payload decodificado do token
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Erro ao decodificar token: ' + error.message);
  }
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};












