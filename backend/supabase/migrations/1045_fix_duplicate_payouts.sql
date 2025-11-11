-- =====================================================
-- Migration: 1045_fix_duplicate_payouts
-- Description: Corrige pagamentos duplicados causados por triggers duplicados
--              Identifica e reverte créditos em duplicata
-- Created: 2025-11-11
-- =====================================================

DO $$
DECLARE
  duplicate_transaction RECORD;
  duplicate_count INTEGER := 0;
  total_reversed INTEGER := 0;
BEGIN
  RAISE NOTICE '🔍 Procurando pagamentos duplicados...';
  
  -- Encontrar pares de transações de ganho criadas no mesmo timestamp
  -- para a mesma aposta (indicando trigger duplicado)
  FOR duplicate_transaction IN
    SELECT 
      t1.id as transaction_id,
      t1.wallet_id,
      t1.amount,
      t1.bet_id,
      t1.created_at,
      w.user_id,
      b.id as bet_id_check
    FROM transactions t1
    JOIN wallet w ON w.id = t1.wallet_id
    LEFT JOIN bets b ON b.id = t1.bet_id
    WHERE t1.type = 'ganho'
      AND t1.created_at > NOW() - INTERVAL '24 hours'
      -- Verificar se existe outra transação no mesmo segundo
      AND EXISTS (
        SELECT 1 FROM transactions t2
        WHERE t2.wallet_id = t1.wallet_id
          AND t2.type = 'ganho'
          AND t2.id != t1.id
          AND t2.bet_id = t1.bet_id
          AND ABS(EXTRACT(EPOCH FROM (t2.created_at - t1.created_at))) < 1
      )
      -- Pegar apenas a segunda transação (maior ID = mais recente)
      AND t1.id = (
        SELECT MAX(t3.id) 
        FROM transactions t3
        WHERE t3.wallet_id = t1.wallet_id
          AND t3.bet_id = t1.bet_id
          AND t3.type = 'ganho'
          AND ABS(EXTRACT(EPOCH FROM (t3.created_at - t1.created_at))) < 1
      )
  LOOP
    duplicate_count := duplicate_count + 1;
    
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
  IF duplicate_count > 0 THEN
    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE '📊 RESUMO DA CORREÇÃO:';
    RAISE NOTICE '   - Duplicatas encontradas: %', duplicate_count;
    RAISE NOTICE '   - Total revertido: R$ %', total_reversed::DECIMAL / 100;
    RAISE NOTICE '═══════════════════════════════════════';
  ELSE
    RAISE NOTICE '✅ Nenhum pagamento duplicado encontrado';
  END IF;
END $$;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

