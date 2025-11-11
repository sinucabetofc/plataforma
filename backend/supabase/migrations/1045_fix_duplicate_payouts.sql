-- =====================================================
-- Migration: 1045_fix_duplicate_payouts
-- Description: Corrige pagamentos duplicados causados por triggers duplicados
--              Identifica e reverte créditos em duplicata
-- Created: 2025-11-11
-- =====================================================

DO $$
DECLARE
  duplicate_transaction RECORD;
  duplicates_found INTEGER := 0;
  total_reversed INTEGER := 0;
BEGIN
  RAISE NOTICE '🔍 Procurando pagamentos duplicados...';
  
  -- Encontrar pares de transações de ganho criadas no mesmo timestamp
  -- para a mesma aposta (indicando trigger duplicado)
  FOR duplicate_transaction IN
    WITH grouped_transactions AS (
      SELECT 
        t1.id as transaction_id,
        t1.wallet_id,
        t1.amount,
        t1.bet_id,
        t1.created_at,
        w.user_id,
        -- Contar quantas transações existem para a mesma aposta no mesmo segundo
        COUNT(*) OVER (
          PARTITION BY t1.bet_id, t1.wallet_id 
          ORDER BY t1.created_at
          RANGE BETWEEN INTERVAL '1 second' PRECEDING AND INTERVAL '1 second' FOLLOWING
        ) as duplicate_count,
        -- Numerar as transações (1 = primeira, 2 = segunda/duplicata)
        ROW_NUMBER() OVER (
          PARTITION BY t1.bet_id, t1.wallet_id
          ORDER BY t1.created_at DESC, t1.id DESC
        ) as row_num
      FROM transactions t1
      JOIN wallet w ON w.id = t1.wallet_id
      WHERE t1.type = 'ganho'
        AND t1.created_at > NOW() - INTERVAL '24 hours'
    )
    SELECT 
      transaction_id,
      wallet_id,
      amount,
      bet_id,
      created_at,
      user_id
    FROM grouped_transactions
    WHERE duplicate_count > 1  -- Existem duplicatas
      AND row_num = 1           -- Pegar a mais recente (a duplicata)
  LOOP
    duplicates_found := duplicates_found + 1;
    
    RAISE NOTICE '🔄 Encontrada duplicata: Transação %, Valor: R$ %, Aposta: %',
      duplicate_transaction.transaction_id,
      duplicate_transaction.amount::DECIMAL / 100,
      duplicate_transaction.bet_id;
    
    -- Reverter o saldo
    UPDATE wallet
    SET balance = balance - duplicate_transaction.amount
    WHERE id = duplicate_transaction.wallet_id;
    
    -- Marcar transação como revertida (adicionar metadata)
    UPDATE transactions
    SET description = description || ' [REVERTIDO - Duplicata]',
        metadata = COALESCE(metadata, '{}'::jsonb) || 
                   jsonb_build_object('reverted', true, 'reason', 'duplicate_trigger')
    WHERE id = duplicate_transaction.transaction_id;
    
    total_reversed := total_reversed + duplicate_transaction.amount;
    
    RAISE NOTICE '✅ Revertido: R$ % da wallet %',
      duplicate_transaction.amount::DECIMAL / 100,
      duplicate_transaction.wallet_id;
  END LOOP;
  
  -- Resumo
  IF duplicates_found > 0 THEN
    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE '📊 RESUMO DA CORREÇÃO:';
    RAISE NOTICE '   - Duplicatas encontradas: %', duplicates_found;
    RAISE NOTICE '   - Total revertido: R$ %', total_reversed::DECIMAL / 100;
    RAISE NOTICE '═══════════════════════════════════════';
  ELSE
    RAISE NOTICE '✅ Nenhum pagamento duplicado encontrado';
  END IF;
END $$;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

