/**
 * ============================================================
 * Wallet Validator - Validação de Carteira
 * ============================================================
 */

const { z } = require('zod');

/**
 * Schema de validação para depósito
 */
const depositSchema = z.object({
  amount: z
    .number({
      required_error: 'O valor do depósito é obrigatório',
      invalid_type_error: 'O valor deve ser um número'
    })
    .positive('O valor deve ser positivo')
    .min(10, 'O valor mínimo de depósito é R$ 10,00')
    .max(10000, 'O valor máximo de depósito é R$ 10.000,00')
    .multipleOf(0.01, 'O valor deve ter no máximo 2 casas decimais'),
  
  description: z
    .string()
    .max(255, 'Descrição muito longa')
    .optional()
});

/**
 * Schema de validação para saque
 */
const withdrawSchema = z.object({
  amount: z
    .number({
      required_error: 'O valor do saque é obrigatório',
      invalid_type_error: 'O valor deve ser um número'
    })
    .positive('O valor deve ser positivo')
    .min(20, 'O valor mínimo de saque é R$ 20,00')
    .max(50000, 'O valor máximo de saque é R$ 50.000,00')
    .multipleOf(0.01, 'O valor deve ter no máximo 2 casas decimais'),
  
  pix_key: z
    .string({
      required_error: 'Chave PIX é obrigatória para saque'
    })
    .min(1, 'Chave PIX não pode estar vazia')
    .max(255, 'Chave PIX muito longa'),
  
  description: z
    .string()
    .max(255, 'Descrição muito longa')
    .optional()
});

/**
 * Schema de validação para webhook da Woovi
 */
const wooviWebhookSchema = z.object({
  event: z.string(),
  charge: z.object({
    status: z.enum(['COMPLETED', 'ACTIVE', 'EXPIRED']),
    correlationID: z.string(),
    value: z.number(),
    transactionID: z.string().optional(),
    time: z.string().optional()
  })
});

module.exports = {
  depositSchema,
  withdrawSchema,
  wooviWebhookSchema
};






