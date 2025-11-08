-- =====================================================
-- Migration: 1001_auto_refund_pending_bets
-- Description: Reembolsar automaticamente apostas pendentes ao finalizar série
-- Created: 2025-11-06
-- =====================================================

-- Trigger: Reembolsar apostas pendentes quando série é encerrada
CREATE OR REPLACE FUNCTION refund_pending_bets_on_serie_end()
RETURNS TRIGGER AS $$
DECLARE
  bet_record RECORD;
  wallet_record RECORD;
BEGIN
  -- Se a série foi encerrada ou cancelada
  IF (NEW.status = 'encerrada' OR NEW.status = 'cancelada') AND 
     (OLD.status != 'encerrada' AND OLD.status != 'cancelada') THEN
    
    -- Buscar todas as apostas pendentes desta série
    FOR bet_record IN 
      SELECT id, user_id, amount, serie_id
      FROM bets
      WHERE serie_id = NEW.id
      AND status = 'pendente'
    LOOP
      -- Buscar wallet do usuário
      SELECT id, balance INTO wallet_record
      FROM wallet
      WHERE user_id = bet_record.user_id;
      
      -- Reembolsar o valor
      UPDATE wallet
      SET balance = balance + bet_record.amount
      WHERE user_id = bet_record.user_id;
      
      -- Criar transação de reembolso
      INSERT INTO transactions (
        wallet_id,
        bet_id,
        type,
        amount,
        balance_before,
        balance_after,
        description
      ) VALUES (
        wallet_record.id,
        bet_record.id,
        'reembolso',
        bet_record.amount,
        wallet_record.balance,
        wallet_record.balance + bet_record.amount,
        CASE 
          WHEN NEW.status = 'cancelada' THEN 
            'Reembolso - Série ' || NEW.serie_number || ' cancelada'
          ELSE 
            'Reembolso - Série ' || NEW.serie_number || ' finalizada sem emparceiramento'
        END
      );
      
      -- Atualizar status da aposta
      UPDATE bets
      SET 
        status = 'reembolsada',
        resolved_at = TIMEZONE('utc'::text, NOW())
      WHERE id = bet_record.id;
      
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger AFTER UPDATE na tabela series
DROP TRIGGER IF EXISTS trigger_refund_pending_bets ON series;
CREATE TRIGGER trigger_refund_pending_bets
  AFTER UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION refund_pending_bets_on_serie_end();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 'Trigger de reembolso automático criado com sucesso!' as status;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


