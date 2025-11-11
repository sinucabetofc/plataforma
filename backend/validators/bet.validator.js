/**
 * ============================================================
 * Bet Validator - Validação de Apostas
 * ============================================================
 */

const { z } = require('zod');

/**
 * Schema de validação para criação de aposta
 */
const createBetSchema = z.object({
  game_id: z
    .string({
      required_error: 'O ID do jogo é obrigatório',
      invalid_type_error: 'O ID do jogo deve ser uma string'
    })
    .uuid('ID do jogo inválido'),
  
  side: z
    .enum(['player_a', 'player_b'], {
      required_error: 'O lado da aposta é obrigatório',
      invalid_type_error: 'Lado da aposta inválido. Use "player_a" ou "player_b"'
    }),
  
  amount: z
    .number({
      required_error: 'O valor da aposta é obrigatório',
      invalid_type_error: 'O valor deve ser um número'
    })
    .positive('O valor deve ser positivo')
    .min(10, 'O valor mínimo de aposta é R$ 10,00')
    .max(100000, 'O valor máximo de aposta é R$ 100.000,00')
    .refine(
      (val) => val % 10 === 0,
      {
        message: 'O valor da aposta deve ser múltiplo de 10'
      }
    )
});

module.exports = {
  createBetSchema
};







