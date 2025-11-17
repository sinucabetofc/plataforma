-- =====================================================
-- Migration: 1020_list_all_triggers
-- Description: Listar TODOS os triggers do banco
-- Created: 2025-11-07
-- =====================================================

-- Listar triggers na tabela BETS
SELECT 
  '🔍 TRIGGERS NA TABELA BETS' as info,
  tgname as trigger_name,
  pg_get_triggerdef(oid) as definicao_completa
FROM pg_trigger
WHERE tgrelid = 'bets'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- Listar triggers na tabela WALLET
SELECT 
  '🔍 TRIGGERS NA TABELA WALLET' as info,
  tgname as trigger_name,
  pg_get_triggerdef(oid) as definicao_completa
FROM pg_trigger
WHERE tgrelid = 'wallet'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- Listar triggers na tabela TRANSACTIONS
SELECT 
  '🔍 TRIGGERS NA TABELA TRANSACTIONS' as info,
  tgname as trigger_name,
  pg_get_triggerdef(oid) as definicao_completa
FROM pg_trigger
WHERE tgrelid = 'transactions'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- Ver código de TODAS as funções relacionadas a bets
SELECT 
  '📝 FUNÇÕES RELACIONADAS A BETS' as info,
  proname as nome_funcao,
  pg_get_functiondef(oid) as codigo_completo
FROM pg_proc
WHERE proname LIKE '%bet%' 
   OR proname LIKE '%credit%'
   OR proname LIKE '%refund%'
ORDER BY proname;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================




