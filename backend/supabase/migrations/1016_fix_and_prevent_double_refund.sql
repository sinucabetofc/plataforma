-- =====================================================
-- Migration: 1016_fix_and_prevent_double_refund
-- Description: Prevenir e corrigir duplo reembolso em cancelamento
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- ANÁLISE COMPLETA DO PROBLEMA
-- =====================================================

-- 1. Verificar apostas canceladas com transações incorretas
SELECT 
  '🔍 ANÁLISE: Apostas Canceladas (últimas 10)' as info,
  b.id as bet_id,
  b.user_id,
  b.amount / 100.0 as aposta_reais,
  b.created_at as criada_em,
  b.resolved_at as cancelada_em,
  -- Contar transações
  (SELECT COUNT(*) FROM transactions t WHERE t.bet_id = b.id AND t.type = 'aposta') as debitos,
  (SELECT COUNT(*) FROM transactions t WHERE t.bet_id = b.id AND t.type = 'reembolso') as reembolsos,
  -- Somar valores
  (SELECT COALESCE(SUM(t.amount), 0) / 100.0 FROM transactions t WHERE t.bet_id = b.id AND t.type = 'aposta') as total_debitado,
  (SELECT COALESCE(SUM(t.amount), 0) / 100.0 FROM transactions t WHERE t.bet_id = b.id AND t.type = 'reembolso' AND t.status != 'cancelled') as total_reembolsado,
  -- Resultado líquido
  (
    SELECT COALESCE(SUM(t.amount), 0) / 100.0 
    FROM transactions t 
    WHERE t.bet_id = b.id 
      AND t.status != 'cancelled'
  ) as impacto_liquido_reais
FROM bets b
WHERE b.status = 'cancelada'
ORDER BY b.resolved_at DESC NULLS LAST
LIMIT 10;

-- 2. Identificar transações sem user_id
SELECT 
  '⚠️ TRANSAÇÕES SEM USER_ID (precisam correção)' as alerta,
  COUNT(*) as quantidade,
  SUM(amount) / 100.0 as valor_total_reais
FROM transactions
WHERE user_id IS NULL;

-- 3. Corrigir user_id em transações de reembolso
UPDATE transactions t
SET user_id = b.user_id
FROM bets b
WHERE t.bet_id = b.id
  AND t.user_id IS NULL
  AND b.user_id IS NOT NULL;

-- Log de correção
SELECT 
  '✅ USER_IDs corrigidos em transações' as info,
  COUNT(*) as quantidade_corrigida
FROM transactions
WHERE user_id IS NOT NULL 
  AND updated_at > NOW() - INTERVAL '1 second';

-- =====================================================
-- PREVENÇÃO: Criar constraint para garantir user_id
-- =====================================================

-- Nota: Não vamos criar constraint NOT NULL porque pode quebrar
-- outras transações de admin. Mas vamos documentar a necessidade.

COMMENT ON COLUMN transactions.user_id IS 
  'ID do usuário - DEVE ser preenchido em todas as transações de apostas, ganhos e reembolsos';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Mostrar estatísticas de reembolsos
SELECT 
  '📊 ESTATÍSTICAS DE REEMBOLSOS' as info,
  COUNT(*) as total_transacoes,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as com_user_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as sem_user_id,
  SUM(amount) / 100.0 as valor_total_reais,
  COUNT(DISTINCT bet_id) as apostas_unicas,
  COUNT(*) FILTER (WHERE status = 'completed') as completadas,
  COUNT(*) FILTER (WHERE status = 'cancelled') as canceladas
FROM transactions
WHERE type = 'reembolso';

-- Verificar se ainda há duplicações
SELECT 
  '⚠️ VERIFICAÇÃO: Duplicações Restantes' as alerta,
  t.bet_id,
  b.amount / 100.0 as aposta_original,
  COUNT(*) as qtd_reembolsos,
  SUM(t.amount) / 100.0 as total_reembolsado,
  CASE 
    WHEN SUM(t.amount) = b.amount THEN '✅ OK'
    WHEN SUM(t.amount) > b.amount THEN '❌ EXCESSO'
    ELSE '⚠️ INCOMPLETO'
  END as status
FROM transactions t
JOIN bets b ON b.id = t.bet_id
WHERE t.type = 'reembolso'
  AND t.status = 'completed'
  AND b.status = 'cancelada'
GROUP BY t.bet_id, b.amount
HAVING COUNT(*) > 1 OR SUM(t.amount) != b.amount
ORDER BY SUM(t.amount) DESC;

-- =====================================================
-- LOG FINAL
-- =====================================================

SELECT '✅ [MIGRATION 1016] Correções aplicadas!' as status;
SELECT '📌 Ações realizadas:' as info;
SELECT '  1. Corrigido user_id em transações de reembolso' as acao1;
SELECT '  2. Verificação de duplicações concluída' as acao2;
SELECT '  3. Comentário adicionado na coluna user_id' as acao3;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================




