/**
 * ============================================================
 * Hash Utility - Hashing e Verificação de Senhas com Bcrypt
 * ============================================================
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Gera um hash da senha usando bcrypt
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 */
async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error('Erro ao gerar hash da senha: ' + error.message);
  }
}

/**
 * Verifica se uma senha corresponde ao hash armazenado
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash armazenado no banco de dados
 * @returns {Promise<boolean>} True se a senha corresponder, False caso contrário
 */
async function verifyPassword(password, hash) {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    throw new Error('Erro ao verificar senha: ' + error.message);
  }
}

module.exports = {
  hashPassword,
  verifyPassword
};












