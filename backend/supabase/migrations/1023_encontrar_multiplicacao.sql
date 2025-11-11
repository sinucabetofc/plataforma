-- =====================================================
-- Migration: 1023_encontrar_multiplicacao
-- Description: Encontrar onde está multiplicando o valor da aposta
-- Created: 2025-11-07
-- =====================================================

-- Ver a última aposta de R$ 15 especificamente
SELECT 
  '🎯 APOSTA DE R$ 15' as info,
  id as bet_id,
  amount / 100.0 as valor_aposta_reais,
  created_at
FROM bets
WHERE amount = 1500  -- R$ 15 em centavos
ORDER BY created_at DESC
LIMIT 1;

-- Ver TODAS as transações desta aposta de R$ 15
SELECT 
  '📋 TRANSAÇÕES DA APOSTA DE R$ 15' as info,
  type,
  amount / 100.0 as valor_transacao_reais,
  balance_before / 100.0 as saldo_antes,
  balance_after / 100.0 as saldo_depois,
  description,
  created_at
FROM transactions
WHERE bet_id = (
  SELECT id FROM bets WHERE amount = 1500 ORDER BY created_at DESC LIMIT 1
)
ORDER BY created_at;

-- Ver código completo da função create_bet_transaction
SELECT 
  '📝 CÓDIGO: create_bet_transaction' as info;

SELECT pg_get_functiondef(oid) as codigo
FROM pg_proc
WHERE proname = 'create_bet_transaction';

-- Verificar se há alguma regra multiplicando
SELECT 
  '🔍 PROCURANDO MULTIPLICAÇÃO' as info;

SELECT 
  proname as funcao,
  CASE 
    WHEN pg_get_functiondef(oid) LIKE '%amount * 2%' THEN 'Multiplica por 2'
    WHEN pg_get_functiondef(oid) LIKE '%amount * %' THEN 'Multiplica'
    WHEN pg_get_functiondef(oid) LIKE '%* amount%' THEN 'Multiplica'
    ELSE 'Não multiplica'
  END as operacao
FROM pg_proc
WHERE proname IN (
  'validate_bet_on_insert',
  'create_bet_transaction'
)
ORDER BY proname;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================



