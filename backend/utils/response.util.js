/**
 * ============================================================
 * Response Utility - Respostas HTTP Padronizadas
 * ============================================================
 */

/**
 * Resposta de sucesso padrão
 * @param {Object} res - Objeto response do Express
 * @param {number} statusCode - Código HTTP de status
 * @param {string} message - Mensagem de sucesso
 * @param {Object} data - Dados a serem retornados (opcional)
 */
function successResponse(res, statusCode = 200, message = 'Sucesso', data = null) {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  return res.status(statusCode).json(response);
}

/**
 * Resposta de erro padrão
 * @param {Object} res - Objeto response do Express
 * @param {number} statusCode - Código HTTP de status
 * @param {string} message - Mensagem de erro
 * @param {Object} errors - Detalhes dos erros (opcional)
 */
function errorResponse(res, statusCode = 500, message = 'Erro interno do servidor', errors = null) {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };
  return res.status(statusCode).json(response);
}

/**
 * Resposta de validação com erros
 * @param {Object} res - Objeto response do Express
 * @param {Array} errors - Array de erros de validação
 */
function validationErrorResponse(res, errors) {
  return res.status(400).json({
    success: false,
    message: 'Erro de validação',
    errors: errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  });
}

/**
 * Resposta de recurso não encontrado
 * @param {Object} res - Objeto response do Express
 * @param {string} message - Mensagem customizada (opcional)
 */
function notFoundResponse(res, message = 'Recurso não encontrado') {
  return errorResponse(res, 404, message);
}

/**
 * Resposta de não autorizado
 * @param {Object} res - Objeto response do Express
 * @param {string} message - Mensagem customizada (opcional)
 */
function unauthorizedResponse(res, message = 'Não autorizado') {
  return errorResponse(res, 401, message);
}

/**
 * Resposta de conflito (recurso já existe)
 * @param {Object} res - Objeto response do Express
 * @param {string} message - Mensagem customizada (opcional)
 */
function conflictResponse(res, message = 'Recurso já existe') {
  return errorResponse(res, 409, message);
}

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  conflictResponse
};







