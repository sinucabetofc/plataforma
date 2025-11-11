-- ============================================================
-- TESTES: Sistema de Matching Fracionado e Reembolso
-- ============================================================
-- Execute cada seção para testar os cenários
-- ============================================================

-- ============================================================
-- 1. VERIFICAR APOSTAS PARCIALMENTE CASADAS ATUAIS
-- ============================================================

SELECT 
    b.id,
    u.name as usuario,
    b.amount / 100.0 as valor_total,
    b.matched_amount / 100.0 as valor_casado,
    b.remaining_amount / 100.0 as valor_pendente,
    ROUND((b.matched_amount::DECIMAL / b.amount) * 100, 0) as percentual_casado,
    b.status,
    s.serie_number,
    s.status as serie_status,
    p.name as jogador_escolhido
FROM bets b
JOIN users u ON b.user_id = u.id
JOIN series s ON b.serie_id = s.id
JOIN players p ON b.chosen_player_id = p.id
WHERE b.matched_amount > 0 
  AND b.matched_amount < b.amount
ORDER BY b.placed_at DESC;

-- ============================================================
-- 2. SIMULAR GANHO DE APOSTA PARCIAL
-- ============================================================

-- Pegar uma aposta parcialmente casada de teste
DO $$
DECLARE
    test_bet_id UUID;
    test_serie_id UUID;
    winner_id UUID;
    initial_balance INTEGER;
    final_balance INTEGER;
    expected_return INTEGER;
BEGIN
    -- Buscar uma aposta parcialmente casada
    SELECT 
        b.id,
        b.serie_id,
        b.chosen_player_id,
        w.balance
    INTO test_bet_id, test_serie_id, winner_id, initial_balance
    FROM bets b
    JOIN wallet w ON w.user_id = b.user_id
    WHERE b.status = 'parcialmente_aceita'
    LIMIT 1;
    
    IF test_bet_id IS NULL THEN
        RAISE NOTICE '⚠️  Nenhuma aposta parcialmente casada para testar';
        RETURN;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🧪 TESTE: GANHO DE APOSTA PARCIAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Aposta ID: %', test_bet_id;
    RAISE NOTICE 'Saldo antes: R$ %', initial_balance::DECIMAL / 100;
    
    -- Calcular retorno esperado
    SELECT 
        (matched_amount * 2) + COALESCE(remaining_amount, 0)
    INTO expected_return
    FROM bets WHERE id = test_bet_id;
    
    RAISE NOTICE 'Retorno esperado: R$ %', expected_return::DECIMAL / 100;
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Marcando série como encerrada com vencedor...';
    
    -- Marcar série como encerrada (vai disparar os triggers)
    UPDATE series
    SET 
        status = 'encerrada',
        winner_player_id = winner_id,
        updated_at = NOW()
    WHERE id = test_serie_id;
    
    -- Aguardar triggers processarem
    PERFORM pg_sleep(0.5);
    
    -- Verificar resultado
    SELECT w.balance INTO final_balance
    FROM wallet w
    JOIN bets b ON b.user_id = w.user_id
    WHERE b.id = test_bet_id;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 RESULTADO:';
    RAISE NOTICE '   Saldo final: R$ %', final_balance::DECIMAL / 100;
    RAISE NOTICE '   Diferença: R$ %', (final_balance - initial_balance)::DECIMAL / 100;
    RAISE NOTICE '   Esperado: R$ %', expected_return::DECIMAL / 100;
    RAISE NOTICE '';
    
    IF (final_balance - initial_balance) = expected_return THEN
        RAISE NOTICE '✅ TESTE PASSOU! Valor correto creditado';
    ELSE
        RAISE NOTICE '❌ TESTE FALHOU! Diferença: R$ %', 
            ((final_balance - initial_balance) - expected_return)::DECIMAL / 100;
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- Reverter para não afetar dados reais
    ROLLBACK;
END$$;

-- ============================================================
-- 3. VERIFICAR DETALHES DE UMA APOSTA ESPECÍFICA
-- ============================================================

-- Substitua o ID pela aposta que deseja verificar
SELECT 
    '========================================' as separator,
    'DETALHES DA APOSTA' as titulo;

SELECT 
    b.id,
    u.name as usuario,
    p.name as jogador,
    s.serie_number as serie,
    b.amount / 100.0 as valor_apostado,
    b.matched_amount / 100.0 as valor_casado,
    b.remaining_amount / 100.0 as valor_nao_casado,
    ROUND((b.matched_amount::DECIMAL / NULLIF(b.amount, 0)) * 100, 1) || '%' as percentual,
    b.status,
    b.actual_return / 100.0 as retorno_recebido,
    CASE 
        WHEN b.status = 'ganha' THEN (b.matched_amount * 2 + COALESCE(b.remaining_amount, 0)) / 100.0
        WHEN b.status = 'perdida' THEN COALESCE(b.remaining_amount, 0) / 100.0
        ELSE NULL
    END as retorno_esperado
FROM bets b
JOIN users u ON b.user_id = u.id
JOIN players p ON b.chosen_player_id = p.id
JOIN series s ON b.serie_id = s.id
WHERE b.id = 'c53d2aae-f2ec-4ec1-a53c-70727e4aba0d';  -- ← COLOQUE O ID AQUI

-- ============================================================
-- 4. VER TRANSAÇÕES DA APOSTA
-- ============================================================

SELECT 
    t.type as tipo,
    t.amount / 100.0 as valor,
    t.description as descricao,
    t.created_at,
    t.metadata
FROM transactions t
WHERE t.bet_id = 'c53d2aae-f2ec-4ec1-a53c-70727e4aba0d'  -- ← MESMO ID
ORDER BY t.created_at DESC;

-- ============================================================
-- 5. RESUMO DE TODAS APOSTAS PARCIAIS
-- ============================================================

SELECT 
    COUNT(*) as total_parciais,
    COUNT(CASE WHEN status = 'parcialmente_aceita' THEN 1 END) as ativas,
    COUNT(CASE WHEN status = 'ganha' THEN 1 END) as ganhas,
    COUNT(CASE WHEN status = 'perdida' THEN 1 END) as perdidas,
    SUM(amount) / 100.0 as volume_total,
    SUM(matched_amount) / 100.0 as volume_casado,
    SUM(COALESCE(remaining_amount, 0)) / 100.0 as volume_pendente
FROM bets
WHERE matched_amount > 0 
  AND matched_amount < amount;

-- ============================================================
-- 6. VALIDAR FÓRMULAS
-- ============================================================

SELECT 
    b.id,
    b.status,
    b.amount / 100.0 as apostou,
    b.matched_amount / 100.0 as casado,
    b.remaining_amount / 100.0 as nao_casado,
    b.actual_return / 100.0 as recebeu,
    CASE 
        WHEN b.status = 'ganha' THEN 
            (b.matched_amount * 2 + COALESCE(b.remaining_amount, 0)) / 100.0
        WHEN b.status = 'perdida' THEN 
            COALESCE(b.remaining_amount, 0) / 100.0
        ELSE NULL
    END as deveria_receber,
    CASE 
        WHEN b.status IN ('ganha', 'perdida') THEN
            CASE 
                WHEN b.status = 'ganha' THEN
                    b.actual_return = (b.matched_amount * 2 + COALESCE(b.remaining_amount, 0))
                WHEN b.status = 'perdida' THEN
                    b.actual_return = COALESCE(b.remaining_amount, 0)
            END
        ELSE NULL
    END as correto
FROM bets b
WHERE b.matched_amount > 0 
  AND b.matched_amount < b.amount
  AND b.status IN ('ganha', 'perdida')
ORDER BY b.resolved_at DESC
LIMIT 10;

