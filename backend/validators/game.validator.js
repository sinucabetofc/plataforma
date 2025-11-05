/**
 * ============================================================
 * Game Validator - Validação de Jogos
 * ============================================================
 */

const { z } = require('zod');

/**
 * Schema de validação para criação de jogo
 */
const createGameSchema = z.object({
  player_a: z
    .string({
      required_error: 'O nome do jogador A é obrigatório',
      invalid_type_error: 'O nome do jogador A deve ser uma string'
    })
    .min(3, 'O nome do jogador A deve ter no mínimo 3 caracteres')
    .max(255, 'O nome do jogador A deve ter no máximo 255 caracteres')
    .trim(),
  
  player_b: z
    .string({
      required_error: 'O nome do jogador B é obrigatório',
      invalid_type_error: 'O nome do jogador B deve ser uma string'
    })
    .min(3, 'O nome do jogador B deve ter no mínimo 3 caracteres')
    .max(255, 'O nome do jogador B deve ter no máximo 255 caracteres')
    .trim(),
  
  modality: z
    .string({
      required_error: 'A modalidade é obrigatória',
      invalid_type_error: 'A modalidade deve ser uma string'
    })
    .min(3, 'A modalidade deve ter no mínimo 3 caracteres')
    .max(100, 'A modalidade deve ter no máximo 100 caracteres')
    .trim(),
  
  advantages: z
    .string()
    .max(1000, 'As vantagens devem ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
  
  series: z
    .number({
      required_error: 'O número de séries é obrigatório',
      invalid_type_error: 'O número de séries deve ser um número'
    })
    .int('O número de séries deve ser um número inteiro')
    .positive('O número de séries deve ser positivo')
    .min(1, 'O número mínimo de séries é 1')
    .max(99, 'O número máximo de séries é 99')
    .default(1),
  
  bet_limit: z
    .number({
      invalid_type_error: 'O limite de aposta deve ser um número'
    })
    .positive('O limite de aposta deve ser positivo')
    .min(10, 'O limite mínimo de aposta é R$ 10,00')
    .max(100000, 'O limite máximo de aposta é R$ 100.000,00')
    .multipleOf(0.01, 'O limite de aposta deve ter no máximo 2 casas decimais')
    .optional()
    .nullable()
}).refine(
  (data) => data.player_a.toLowerCase() !== data.player_b.toLowerCase(),
  {
    message: 'Os jogadores A e B devem ser diferentes',
    path: ['player_b']
  }
);

/**
 * Schema de validação para atualização de status do jogo
 */
const updateGameStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'finished', 'cancelled'], {
    required_error: 'O status é obrigatório',
    invalid_type_error: 'Status inválido'
  }),
  
  result: z
    .enum(['player_a', 'player_b', 'draw'], {
      invalid_type_error: 'Resultado inválido'
    })
    .optional()
    .nullable()
}).refine(
  (data) => {
    // Se status é 'finished', result é obrigatório
    if (data.status === 'finished' && !data.result) {
      return false;
    }
    // Se status não é 'finished', result deve ser null
    if (data.status !== 'finished' && data.result) {
      return false;
    }
    return true;
  },
  {
    message: 'O resultado é obrigatório quando o status é "finished" e deve ser null caso contrário',
    path: ['result']
  }
);

/**
 * Schema de validação para filtros de listagem
 */
const listGamesFiltersSchema = z.object({
  status: z
    .enum(['open', 'in_progress', 'finished', 'cancelled'])
    .optional(),
  
  modality: z
    .string()
    .max(100)
    .optional(),
  
  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .default(20)
    .optional(),
  
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .optional()
});

module.exports = {
  createGameSchema,
  updateGameStatusSchema,
  listGamesFiltersSchema
};

