/**
 * ============================================================
 * Auth Validators - Schemas de Validação Zod
 * ============================================================
 */

const { z } = require('zod');

/**
 * Regex para validação de CPF brasileiro (formato: XXX.XXX.XXX-XX)
 */
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

/**
 * Regex para validação de telefone internacional (E.164)
 */
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

/**
 * Regex para validação de email
 */
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Schema de validação para registro de usuário
 */
const registerSchema = z.object({
  name: z
    .string({
      required_error: 'Nome é obrigatório',
      invalid_type_error: 'Nome deve ser uma string'
    })
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),

  email: z
    .string({
      required_error: 'Email é obrigatório',
      invalid_type_error: 'Email deve ser uma string'
    })
    .email('Formato de email inválido')
    .regex(emailRegex, 'Formato de email inválido')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: 'Senha é obrigatória',
      invalid_type_error: 'Senha deve ser uma string'
    })
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    ),

  phone: z
    .string({
      required_error: 'Telefone é obrigatório',
      invalid_type_error: 'Telefone deve ser uma string'
    })
    .regex(phoneRegex, 'Formato de telefone inválido (use formato internacional, ex: +5511999999999)')
    .trim(),

  cpf: z
    .string({
      required_error: 'CPF é obrigatório',
      invalid_type_error: 'CPF deve ser uma string'
    })
    .regex(cpfRegex, 'Formato de CPF inválido (use XXX.XXX.XXX-XX)')
    .trim()
    .refine(validateCPF, 'CPF inválido'),

  pix_key: z
    .string({
      invalid_type_error: 'Chave PIX deve ser uma string'
    })
    .min(1, 'Chave PIX não pode estar vazia se fornecida')
    .max(255, 'Chave PIX deve ter no máximo 255 caracteres')
    .trim()
    .optional()
    .nullable(),

  pix_type: z
    .enum(['email', 'cpf', 'phone', 'random'], {
      errorMap: () => ({ message: 'Tipo de PIX inválido (email, cpf, phone ou random)' })
    })
    .optional()
    .nullable()
}).refine(
  (data) => {
    // Se pix_key for fornecida, pix_type também deve ser
    if (data.pix_key && !data.pix_type) return false;
    if (!data.pix_key && data.pix_type) return false;
    return true;
  },
  {
    message: 'pix_key e pix_type devem ser fornecidos juntos ou nenhum dos dois',
    path: ['pix_key']
  }
);

/**
 * Schema de validação para login de usuário
 */
const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
      invalid_type_error: 'Email deve ser uma string'
    })
    .email('Formato de email inválido')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: 'Senha é obrigatória',
      invalid_type_error: 'Senha deve ser uma string'
    })
    .min(1, 'Senha é obrigatória')
});

/**
 * Valida se um CPF é válido usando o algoritmo de dígito verificador
 * @param {string} cpf - CPF no formato XXX.XXX.XXX-XX
 * @returns {boolean}
 */
function validateCPF(cpf) {
  // Remove formatação
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

module.exports = {
  registerSchema,
  loginSchema,
  validateCPF
};









