-- ============================================================
-- Migration 1043: Resolver Apostas Parciais Pendentes
-- ============================================================
-- Resolve apostas parcialmente_aceita de séries já encerradas
-- que não foram resolvidas pelos triggers antigos
-- ============================================================

DO $$
DECLARE
    bet_record RECORD;
    win_amount INTEGER;
    refund_amount INTEGER;
    total_return INTEGER;
    user_wallet_id UUID;
    current_balance INTEGER;
    serie_num INTEGER;
    resolved_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🔄 RESOLVENDO APOSTAS PARCIAIS PENDENTES';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- Buscar apostas parcialmente_aceita de séries encerradas
    FOR bet_record IN 
        SELECT 
            b.id,
            b.user_id,
            b.amount,
            b.matched_amount,
            b.remaining_amount,
            b.chosen_player_id,
            s.id as serie_id,
            s.serie_number,
            s.winner_player_id,
            w.id as wallet_id,
            w.balance
        FROM bets b
        JOIN series s ON s.id = b.serie_id
        JOIN wallet w ON w.user_id = b.user_id
        WHERE b.status = 'parcialmente_aceita'
          AND s.status = 'encerrada'
          AND s.winner_player_id IS NOT NULL
    LOOP
        resolved_count := resolved_count + 1;
        
        RAISE NOTICE '📋 Aposta %: R$ % (% casado)', 
            bet_record.id,
            bet_record.amount::DECIMAL / 100,
            bet_record.matched_amount::DECIMAL / 100;
        
        -- Verificar se ganhou ou perdeu
        IF bet_record.chosen_player_id = bet_record.winner_player_id THEN
            -- ============================================================
            -- GANHOU
            -- ============================================================
            RAISE NOTICE '   ✅ GANHOU!';
            
            win_amount := bet_record.matched_amount * 2;
            refund_amount := COALESCE(bet_record.remaining_amount, 0);
            total_return := win_amount + refund_amount;
            
            RAISE NOTICE '   💰 Ganho: R$ %', win_amount::DECIMAL / 100;
            RAISE NOTICE '   💵 Reembolso: R$ %', refund_amount::DECIMAL / 100;
            RAISE NOTICE '   📊 Total: R$ %', total_return::DECIMAL / 100;
            
            -- Atualizar aposta
            UPDATE bets
            SET 
                status = 'ganha',
                actual_return = total_return,
                resolved_at = NOW(),
                updated_at = NOW()
            WHERE id = bet_record.id;
            
            -- Creditar saldo
            UPDATE wallet
            SET balance = balance + total_return
            WHERE user_id = bet_record.user_id;
            
            -- Criar transação
            INSERT INTO transactions (
                wallet_id,
                user_id,
                bet_id,
                type,
                amount,
                balance_before,
                balance_after,
                description,
                status,
                metadata
            ) VALUES (
                bet_record.wallet_id,
                bet_record.user_id,
                bet_record.id,
                'ganho',
                total_return,
                bet_record.balance,
                bet_record.balance + total_return,
                'Ganho na série ' || bet_record.serie_number,
                'completed',
                jsonb_build_object(
                    'total_bet', bet_record.amount,
                    'matched_amount', bet_record.matched_amount,
                    'remaining_amount', refund_amount,
                    'win_amount', win_amount,
                    'refund_amount', refund_amount,
                    'total_return', total_return,
                    'corrected_by_migration', true
                )
            );
            
            RAISE NOTICE '   ✅ Creditado R$ %', total_return::DECIMAL / 100;
            
        ELSE
            -- ============================================================
            -- PERDEU
            -- ============================================================
            RAISE NOTICE '   ❌ PERDEU';
            
            refund_amount := COALESCE(bet_record.remaining_amount, 0);
            
            RAISE NOTICE '   💵 Reembolso: R$ %', refund_amount::DECIMAL / 100;
            
            -- Atualizar aposta
            UPDATE bets
            SET 
                status = 'perdida',
                actual_return = refund_amount,
                resolved_at = NOW(),
                updated_at = NOW()
            WHERE id = bet_record.id;
            
            -- Se há valor para reembolsar
            IF refund_amount > 0 THEN
                -- Creditar reembolso
                UPDATE wallet
                SET balance = balance + refund_amount
                WHERE user_id = bet_record.user_id;
                
                -- Criar transação
                INSERT INTO transactions (
                    wallet_id,
                    user_id,
                    bet_id,
                    type,
                    amount,
                    balance_before,
                    balance_after,
                    description,
                    status,
                    metadata
                ) VALUES (
                    bet_record.wallet_id,
                    bet_record.user_id,
                    bet_record.id,
                    'reembolso',
                    refund_amount,
                    bet_record.balance,
                    bet_record.balance + refund_amount,
                    'Reembolso parcial - série ' || bet_record.serie_number,
                    'completed',
                    jsonb_build_object(
                        'total_bet', bet_record.amount,
                        'matched_amount', bet_record.matched_amount,
                        'refund_amount', refund_amount,
                        'reason', 'Valor não casado devolvido',
                        'corrected_by_migration', true
                    )
                );
                
                RAISE NOTICE '   ✅ Reembolsado R$ %', refund_amount::DECIMAL / 100;
            ELSE
                RAISE NOTICE '   ⚠️  Sem valor para reembolsar';
            END IF;
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RESOLUÇÃO CONCLUÍDA';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total de apostas resolvidas: %', resolved_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END$$;

