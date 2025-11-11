-- =====================================================
-- Migration: 1014_fix_cancel_bet_double_refund
-- Description: Corrigir duplo reembolso ao cancelar aposta
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- PROBLEMA IDENTIFICADO:
-- Quando usuário cancela aposta pendente manualmente,
-- está recebendo o dobro do valor de volta
-- =====================================================

-- Verificar duplicação de reembolsos
SELECT 
  '🔍 VERIFICANDO DUPLICAÇÃO DE REEMBOLSOS' as info,
  t.bet_id,
  b.amount / 100.0 as valor_aposta,
  COUNT(t.id) as qtd_reembolsos,
  SUM(t.amount) / 100.0 as total_reembolsado,
  CASE 
    WHEN SUM(t.amount) = b.amount THEN '✅ Correto'
    WHEN SUM(t.amount) = b.amount * 2 THEN '❌ DOBRO!'
    ELSE '⚠️ Valor inesperado'
  END as status
FROM transactions t
JOIN bets b ON b.id = t.bet_id
WHERE t.type = 'reembolso'
  AND b.status = 'cancelada'
GROUP BY t.bet_id, b.amount
ORDER BY COUNT(t.id) DESC
LIMIT 20;

-- Listar todos os triggers ativos na tabela bets
SELECT 
  '🔍 TRIGGERS NA TABELA BETS' as info,
  tgname as nome_trigger,
  proname as funcao,
  tgenabled as ativo
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgrelid = 'bets'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- =====================================================
-- ANÁLISE: Verificar transação de débito original
-- =====================================================

SELECT 
  '🔍 ANÁLISE DE APOSTAS CANCELADAS' as info,
  b.id as bet_id,
  b.user_id,
  b.amount / 100.0 as aposta_reais,
  b.status,
  (
    SELECT COUNT(*)
    FROM transactions t1
    WHERE t1.bet_id = b.id
      AND t1.type = 'aposta'
  ) as debitos,
  (
    SELECT COUNT(*)
    FROM transactions t2
    WHERE t2.bet_id = b.id
      AND t2.type = 'reembolso'
  ) as reembolsos,
  (
    SELECT SUM(t3.amount) / 100.0
    FROM transactions t3
    WHERE t3.bet_id = b.id
  ) as saldo_liquido_transacoes
FROM bets b
WHERE b.status = 'cancelada'
ORDER BY b.created_at DESC
LIMIT 10;

-- =====================================================
-- CORREÇÃO: Verificar e remover duplicações
-- =====================================================

DO $$
DECLARE
  bet_record RECORD;
  refund_count INTEGER;
  total_refunded INTEGER;
  excess_refund INTEGER;
BEGIN
  RAISE NOTICE '🔄 Iniciando correção de duplos reembolsos...';
  
  -- Buscar apostas canceladas com mais de 1 reembolso
  FOR bet_record IN
    SELECT 
      b.id as bet_id,
      b.user_id,
      b.amount as bet_amount,
      COUNT(t.id) as refund_count,
      SUM(t.amount) as total_refunded,
      ARRAY_AGG(t.id ORDER BY t.created_at) as transaction_ids
    FROM bets b
    JOIN transactions t ON t.bet_id = b.id AND t.type = 'reembolso'
    WHERE b.status = 'cancelada'
    GROUP BY b.id, b.user_id, b.amount
    HAVING COUNT(t.id) > 1 OR SUM(t.amount) > b.amount
  LOOP
    refund_count := bet_record.refund_count;
    total_refunded := bet_record.total_refunded;
    excess_refund := total_refunded - bet_record.bet_amount;
    
    IF excess_refund > 0 THEN
      RAISE NOTICE '⚠️ Aposta % tem reembolso DUPLICADO: apostou R$%, reembolsado R$%', 
        bet_record.bet_id,
        bet_record.bet_amount / 100.0,
        total_refunded / 100.0;
      
      -- Reverter o excesso do saldo do usuário
      UPDATE wallet
      SET balance = balance - excess_refund
      WHERE user_id = bet_record.user_id;
      
      -- Cancelar transação duplicada (manter apenas a primeira)
      UPDATE transactions
      SET 
        status = 'cancelled',
        description = description || ' [REVERTIDO - reembolso duplicado]',
        updated_at = TIMEZONE('utc'::text, NOW())
      WHERE id = ANY(bet_record.transaction_ids[2:]) -- Cancela da 2ª em diante
        AND type = 'reembolso';
      
      RAISE NOTICE '✅ Corrigido: R$% removido do saldo do usuário %',
        excess_refund / 100.0,
        bet_record.user_id;
    END IF;
  END LOOP;
  
  RAISE NOTICE '🎉 Correção concluída!';
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
  '📊 VERIFICAÇÃO FINAL - Apostas Canceladas' as info,
  COUNT(*) as total_apostas_canceladas,
  SUM(b.amount) / 100.0 as valor_total_apostas,
  SUM(
    COALESCE((
      SELECT SUM(t.amount)
      FROM transactions t
      WHERE t.bet_id = b.id
        AND t.type = 'reembolso'
        AND t.status = 'completed'
    ), 0)
  ) / 100.0 as valor_total_reembolsado,
  COUNT(*) FILTER (
    WHERE (
      SELECT SUM(t.amount)
      FROM transactions t
      WHERE t.bet_id = b.id
        AND t.type = 'reembolso'
        AND t.status = 'completed'
    ) = b.amount
  ) as apostas_corretas,
  COUNT(*) FILTER (
    WHERE (
      SELECT SUM(t.amount)
      FROM transactions t
      WHERE t.bet_id = b.id
        AND t.type = 'reembolso'
        AND t.status = 'completed'
    ) > b.amount
  ) as apostas_com_excesso
FROM bets b
WHERE b.status = 'cancelada';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

SELECT '✅ [MIGRATION 1014] Correção de duplo reembolso concluída!' as status;



