/**
 * ============================================================
 * Wallet Controller - Controlador de Carteira
 * ============================================================
 */

const walletService = require('../services/wallet.service');
const { depositSchema, withdrawSchema, wooviWebhookSchema } = require('../validators/wallet.validator');
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse
} = require('../utils/response.util');

class WalletController {
  /**
   * GET /api/wallet
   * Retorna dados da carteira do usuário autenticado
   */
  async getWallet(req, res) {
    try {
      const userId = req.user.id;

      // Buscar dados da carteira e transações
      const walletData = await walletService.getWallet(userId);

      return successResponse(res, 200, 'Dados da carteira obtidos com sucesso', walletData);
    } catch (error) {
      console.error('Erro no controller getWallet:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      return errorResponse(res, 500, 'Erro ao buscar dados da carteira');
    }
  }

  /**
   * POST /api/wallet/deposit
   * Cria um depósito via Pix (gera QR Code)
   */
  async createDeposit(req, res) {
    try {
      // 1. Validar dados de entrada
      const validationResult = depositSchema.safeParse(req.body);

      if (!validationResult.success) {
        return validationErrorResponse(res, validationResult.error.errors);
      }

      const { amount, description } = validationResult.data;
      const userId = req.user.id;

      // 2. Criar depósito (gerar QR Code)
      const depositData = await walletService.createDeposit(userId, amount, description);

      return successResponse(res, 201, 'QR Code Pix gerado com sucesso', depositData);
    } catch (error) {
      console.error('Erro no controller createDeposit:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'EXTERNAL_API_ERROR') {
        return errorResponse(res, 503, error.message, { details: error.details });
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao processar depósito');
    }
  }

  /**
   * POST /api/wallet/withdraw
   * Cria uma solicitação de saque
   */
  async createWithdraw(req, res) {
    try {
      // 1. Validar dados de entrada
      const validationResult = withdrawSchema.safeParse(req.body);

      if (!validationResult.success) {
        return validationErrorResponse(res, validationResult.error.errors);
      }

      const { amount, pix_key, description } = validationResult.data;
      const userId = req.user.id;

      // 2. Criar solicitação de saque
      const withdrawData = await walletService.createWithdraw(userId, amount, pix_key, description);

      return successResponse(res, 201, 'Solicitação de saque criada com sucesso', withdrawData);
    } catch (error) {
      console.error('Erro no controller createWithdraw:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'INSUFFICIENT_BALANCE') {
        return errorResponse(res, 400, error.message, error.details);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao processar saque');
    }
  }

  /**
   * POST /api/wallet/webhook/woovi
   * Webhook da Woovi para confirmação de pagamentos
   */
  async wooviWebhook(req, res) {
    try {
      console.log('📥 Webhook Woovi recebido:', JSON.stringify(req.body, null, 2));

      // 1. Validar dados do webhook
      const validationResult = wooviWebhookSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.error('❌ Webhook inválido:', validationResult.error.errors);
        return validationErrorResponse(res, validationResult.error.errors);
      }

      const webhookData = validationResult.data;

      // 2. Verificar se o pagamento foi concluído
      if (webhookData.charge.status !== 'COMPLETED') {
        console.log('⏳ Pagamento não concluído ainda:', webhookData.charge.status);
        return successResponse(res, 200, 'Webhook recebido, pagamento ainda não concluído', {
          status: webhookData.charge.status
        });
      }

      // 3. Confirmar depósito
      const confirmationData = await walletService.confirmDeposit(
        webhookData.charge.correlationID,
        {
          transaction_id: webhookData.charge.transactionID,
          value: webhookData.charge.value,
          time: webhookData.charge.time,
          event: webhookData.event
        }
      );

      console.log('✅ Depósito confirmado:', confirmationData);

      return successResponse(res, 200, 'Depósito confirmado com sucesso', confirmationData);
    } catch (error) {
      console.error('❌ Erro no webhook Woovi:', error);

      if (error.code === 'NOT_FOUND') {
        // Transação não encontrada, mas retornar 200 para evitar reenvio do webhook
        console.warn('⚠️  Transação não encontrada:', error.correlationID);
        return successResponse(res, 200, 'Transação não encontrada', {
          correlationID: error.correlationID
        });
      }

      // Sempre retornar 200 para evitar reenvio do webhook
      return successResponse(res, 200, 'Webhook processado com erro', {
        error: error.message
      });
    }
  }

  /**
   * GET /api/wallet/health
   * Verifica saúde do serviço de carteira
   */
  async health(req, res) {
    return successResponse(res, 200, 'Serviço de carteira está funcionando', {
      timestamp: new Date().toISOString(),
      service: 'wallet'
    });
  }
}

module.exports = new WalletController();




