-- ============================================================
-- SinucaBet - Queries Úteis e Exemplos
-- ============================================================
--
-- 📌 INSTRUÇÕES DE USO:
--
-- ✅ Queries de CONSULTA (SELECTs) podem ser executadas com segurança
-- ⚠️  Queries de INSERÇÃO/ATUALIZAÇÃO estão comentadas por segurança
-- 
-- As queries foram atualizadas para usar dados dinâmicos do banco,
-- então você pode executá-las diretamente após popular o database
-- com o arquivo database-seed.sql
--
-- 🔧 TROUBLESHOOTING:
--
-- Erro: "column does not exist"
--   → Execute apenas UMA query por vez (separe por blocos)
--   → Certifique-se de que o schema foi criado (database-schema.sql)
--   → Verifique se os dados foram inseridos (database-seed.sql)
--
-- Erro: "relation does not exist"
--   → Execute o database-schema.sql primeiro
--   → Verifique se está conectado ao database correto (\c sinucabet)
--
-- Erro: "foreign key constraint violation"
--   → Para queries INSERT, certifique-se de que os dados seed existem
--   → Use as versões comentadas e descomente uma por vez
--
-- Erro: "syntax error"
--   → Não execute múltiplas queries de uma vez
--   → Certifique-se de copiar a query completa (incluindo pontos e vírgulas)
--
-- ============================================================

-- ============================================================
-- SEÇÃO 0: QUERIES RÁPIDAS DE VERIFICAÇÃO
-- ============================================================

-- 0.1 Verificar se há dados no banco
SELECT 
    'Usuários' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'Jogos', COUNT(*) FROM games
UNION ALL
SELECT 'Apostas', COUNT(*) FROM bets
UNION ALL
SELECT 'Transações', COUNT(*) FROM transactions;

-- 0.2 Ver estrutura básica dos dados
SELECT 
    u.name as usuario,
    w.balance as saldo,
    COUNT(DISTINCT b.id) as apostas_ativas,
    COUNT(DISTINCT t.id) as transacoes
FROM users u
LEFT JOIN wallet w ON u.id = w.user_id
LEFT JOIN bets b ON u.id = b.user_id AND b.status IN ('pending', 'matched')
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.name, w.balance
ORDER BY u.name
LIMIT 10;

-- 0.3 Resumo rápido da plataforma
SELECT 
    (SELECT COUNT(*) FROM users) as total_usuarios,
    (SELECT COUNT(*) FROM games WHERE status = 'open') as jogos_abertos,
    (SELECT COUNT(*) FROM bets WHERE status = 'pending') as apostas_pendentes,
    (SELECT SUM(balance) FROM wallet) as saldo_total_plataforma;

-- ============================================================
-- SEÇÃO 1: QUERIES DE CONSULTA COMUNS
-- ============================================================

-- 1.1 Buscar usuário com sua carteira
SELECT 
    u.id,
    u.name,
    u.email,
    u.cpf,
    w.balance as saldo_disponivel,
    w.blocked_balance as saldo_bloqueado,
    (w.balance + w.blocked_balance) as saldo_total
FROM users u
JOIN wallet w ON u.id = w.user_id
WHERE u.email = 'joao@email.com';

-- 1.2 Listar jogos abertos com estatísticas
SELECT 
    g.id,
    g.player_a,
    g.player_b,
    g.modality,
    g.series,
    g.total_bet_player_a,
    g.total_bet_player_b,
    COUNT(DISTINCT b.user_id) as total_apostadores,
    g.created_at
FROM games g
LEFT JOIN bets b ON g.id = b.game_id
WHERE g.status = 'open'
GROUP BY g.id
ORDER BY g.created_at DESC;

-- 1.3 Apostas pendentes de um usuário
-- Versão com UUID fixo (SUBSTITUIR pelo UUID real do usuário)
-- SELECT 
--     b.id,
--     g.player_a,
--     g.player_b,
--     g.modality,
--     b.side,
--     b.amount,
--     b.status,
--     b.created_at
-- FROM bets b
-- JOIN games g ON b.game_id = g.id
-- WHERE b.user_id = '00000000-0000-0000-0000-000000000000'
--   AND b.status IN ('pending', 'matched')
-- ORDER BY b.created_at DESC;

-- Versão dinâmica (pega o primeiro usuário com apostas)
SELECT 
    u.name as usuario,
    b.id,
    g.player_a,
    g.player_b,
    g.modality,
    b.side,
    b.amount,
    b.status,
    b.created_at
FROM bets b
JOIN games g ON b.game_id = g.id
JOIN users u ON b.user_id = u.id
WHERE b.user_id = (SELECT user_id FROM bets LIMIT 1)
  AND b.status IN ('pending', 'matched')
ORDER BY b.created_at DESC;

-- 1.4 Histórico de transações de um usuário
-- Versão dinâmica (pega o primeiro usuário com transações)
SELECT 
    u.name as usuario,
    t.id,
    t.type,
    t.amount,
    t.fee,
    t.net_amount,
    t.status,
    t.description,
    t.created_at
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.user_id = (SELECT user_id FROM transactions LIMIT 1)
ORDER BY t.created_at DESC
LIMIT 50;

-- 1.5 Ranking de usuários por ganhos
SELECT 
    u.name,
    u.email,
    COUNT(b.id) as total_apostas,
    SUM(CASE WHEN b.status = 'won' THEN b.potential_return ELSE 0 END) as total_ganhos,
    SUM(CASE WHEN b.status = 'lost' THEN b.amount ELSE 0 END) as total_perdas,
    SUM(CASE WHEN b.status = 'won' THEN b.potential_return ELSE 0 END) - 
    SUM(CASE WHEN b.status = 'lost' THEN b.amount ELSE 0 END) as lucro_liquido
FROM users u
LEFT JOIN bets b ON u.id = b.user_id
GROUP BY u.id
ORDER BY lucro_liquido DESC
LIMIT 20;

-- ============================================================
-- SEÇÃO 2: QUERIES ADMINISTRATIVAS
-- ============================================================

-- 2.1 Resumo financeiro da plataforma
SELECT 
    COUNT(DISTINCT u.id) as total_usuarios,
    SUM(w.balance) as saldo_total_disponivel,
    SUM(w.blocked_balance) as saldo_total_bloqueado,
    SUM(w.total_deposited) as total_depositado,
    SUM(w.total_withdrawn) as total_sacado,
    SUM(w.total_deposited) - SUM(w.total_withdrawn) as diferenca_dep_saq
FROM users u
JOIN wallet w ON u.id = w.user_id;

-- 2.2 Jogos com maior volume de apostas
SELECT 
    g.id,
    g.player_a,
    g.player_b,
    g.modality,
    g.status,
    (g.total_bet_player_a + g.total_bet_player_b) as volume_total,
    COUNT(DISTINCT b.user_id) as apostadores_unicos,
    COUNT(b.id) as total_apostas,
    g.created_at
FROM games g
LEFT JOIN bets b ON g.id = b.game_id
GROUP BY g.id
ORDER BY volume_total DESC
LIMIT 20;

-- 2.3 Usuários mais ativos (mais apostas)
SELECT 
    u.name,
    u.email,
    COUNT(b.id) as total_apostas,
    SUM(b.amount) as valor_total_apostado,
    w.balance as saldo_atual,
    u.created_at as membro_desde
FROM users u
LEFT JOIN bets b ON u.id = b.user_id
JOIN wallet w ON u.id = w.user_id
GROUP BY u.id, w.balance
ORDER BY total_apostas DESC
LIMIT 20;

-- 2.4 Taxa de conversão de apostas
SELECT 
    DATE_TRUNC('day', b.created_at) as data,
    COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pendentes,
    COUNT(CASE WHEN b.status = 'matched' THEN 1 END) as pareadas,
    COUNT(CASE WHEN b.status = 'won' THEN 1 END) as ganhas,
    COUNT(CASE WHEN b.status = 'lost' THEN 1 END) as perdidas,
    ROUND(
        COUNT(CASE WHEN b.status = 'matched' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as taxa_matching_pct
FROM bets b
WHERE b.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', b.created_at)
ORDER BY data DESC;

-- 2.5 Receita de taxas
SELECT 
    DATE_TRUNC('month', t.created_at) as mes,
    SUM(t.fee) as total_taxas,
    COUNT(*) as total_transacoes
FROM transactions t
WHERE t.status = 'completed'
  AND t.fee > 0
GROUP BY DATE_TRUNC('month', t.created_at)
ORDER BY mes DESC;

-- ============================================================
-- SEÇÃO 3: QUERIES DE ANÁLISE
-- ============================================================

-- 3.1 Distribuição de apostas por valor
SELECT 
    CASE 
        WHEN amount BETWEEN 10 AND 50 THEN '10-50'
        WHEN amount BETWEEN 51 AND 100 THEN '51-100'
        WHEN amount BETWEEN 101 AND 500 THEN '101-500'
        WHEN amount > 500 THEN '500+'
    END as faixa_valor,
    COUNT(*) as quantidade,
    SUM(amount) as valor_total
FROM bets
GROUP BY faixa_valor
ORDER BY faixa_valor;

-- 3.2 Modalidades mais apostadas
SELECT 
    g.modality,
    COUNT(DISTINCT g.id) as total_jogos,
    COUNT(b.id) as total_apostas,
    SUM(b.amount) as volume_total,
    AVG(b.amount) as aposta_media
FROM games g
LEFT JOIN bets b ON g.id = b.game_id
GROUP BY g.modality
ORDER BY volume_total DESC;

-- 3.3 Padrão de apostas por hora do dia
SELECT 
    EXTRACT(HOUR FROM b.created_at) as hora,
    COUNT(*) as total_apostas,
    SUM(b.amount) as volume_total,
    AVG(b.amount) as aposta_media
FROM bets b
WHERE b.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY hora
ORDER BY hora;

-- 3.4 Taxa de vitória por lado (player_a vs player_b)
SELECT 
    b.side,
    COUNT(*) as total_apostas,
    COUNT(CASE WHEN b.status = 'won' THEN 1 END) as vitorias,
    COUNT(CASE WHEN b.status = 'lost' THEN 1 END) as derrotas,
    ROUND(
        COUNT(CASE WHEN b.status = 'won' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(CASE WHEN b.status IN ('won', 'lost') THEN 1 END), 0) * 100, 2
    ) as taxa_vitoria_pct
FROM bets b
GROUP BY b.side;

-- 3.5 Usuários com maior lucro nos últimos 30 dias
SELECT 
    u.name,
    u.email,
    COUNT(b.id) as apostas_realizadas,
    SUM(CASE WHEN b.status = 'won' THEN b.potential_return ELSE 0 END) as ganhos,
    SUM(CASE WHEN b.status = 'lost' THEN b.amount ELSE 0 END) as perdas,
    SUM(CASE WHEN b.status = 'won' THEN b.potential_return ELSE 0 END) - 
    SUM(CASE WHEN b.status = 'lost' THEN b.amount ELSE 0 END) as lucro_30d
FROM users u
JOIN bets b ON u.id = b.user_id
WHERE b.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id
HAVING 
    SUM(CASE WHEN b.status = 'won' THEN b.potential_return ELSE 0 END) - 
    SUM(CASE WHEN b.status = 'lost' THEN b.amount ELSE 0 END) > 0
ORDER BY lucro_30d DESC
LIMIT 10;

-- ============================================================
-- SEÇÃO 4: QUERIES DE MATCHING
-- ============================================================

-- 4.1 Apostas disponíveis para matching em um jogo específico
-- Versão dinâmica (pega o primeiro jogo com apostas pendentes)
SELECT 
    g.player_a,
    g.player_b,
    b.id,
    b.side,
    b.amount,
    b.status,
    u.name as apostador,
    b.created_at
FROM bets b
JOIN users u ON b.user_id = u.id
JOIN games g ON b.game_id = g.id
WHERE b.game_id = (
    SELECT game_id 
    FROM bets 
    WHERE status = 'pending' 
    LIMIT 1
)
  AND b.status = 'pending'
ORDER BY b.side, b.created_at;

-- 4.2 Volume disponível por lado em jogos abertos
SELECT 
    g.id,
    g.player_a,
    g.player_b,
    g.modality,
    SUM(CASE WHEN b.side = 'player_a' AND b.status = 'pending' THEN b.amount ELSE 0 END) as disponivel_a,
    SUM(CASE WHEN b.side = 'player_b' AND b.status = 'pending' THEN b.amount ELSE 0 END) as disponivel_b,
    ABS(
        SUM(CASE WHEN b.side = 'player_a' AND b.status = 'pending' THEN b.amount ELSE 0 END) -
        SUM(CASE WHEN b.side = 'player_b' AND b.status = 'pending' THEN b.amount ELSE 0 END)
    ) as desbalanceamento
FROM games g
LEFT JOIN bets b ON g.id = b.game_id
WHERE g.status = 'open'
GROUP BY g.id
ORDER BY desbalanceamento DESC;

-- 4.3 Histórico de matches de um jogo
-- Versão dinâmica (pega o primeiro jogo com matches)
SELECT 
    g.player_a,
    g.player_b,
    bm.id,
    bm.matched_amount,
    ua.name as apostador_a,
    ub.name as apostador_b,
    ba.amount as aposta_a,
    bb.amount as aposta_b,
    bm.created_at
FROM bet_matches bm
JOIN bets ba ON bm.bet_player_a_id = ba.id
JOIN bets bb ON bm.bet_player_b_id = bb.id
JOIN users ua ON ba.user_id = ua.id
JOIN users ub ON bb.user_id = ub.id
JOIN games g ON bm.game_id = g.id
WHERE bm.game_id = (SELECT game_id FROM bet_matches LIMIT 1)
ORDER BY bm.created_at DESC;

-- ============================================================
-- SEÇÃO 5: QUERIES DE MANUTENÇÃO
-- ============================================================

-- 5.1 Verificar consistência de saldos
SELECT 
    u.id,
    u.name,
    w.balance,
    w.blocked_balance,
    SUM(CASE WHEN b.status IN ('pending', 'matched') THEN b.amount ELSE 0 END) as total_bloqueado_apostas,
    w.blocked_balance - SUM(CASE WHEN b.status IN ('pending', 'matched') THEN b.amount ELSE 0 END) as diferenca
FROM users u
JOIN wallet w ON u.id = w.user_id
LEFT JOIN bets b ON u.id = b.user_id
GROUP BY u.id, w.balance, w.blocked_balance
HAVING w.blocked_balance != SUM(CASE WHEN b.status IN ('pending', 'matched') THEN b.amount ELSE 0 END);

-- 5.2 Transações pendentes há mais de 24h
SELECT 
    t.id,
    t.user_id,
    t.type,
    t.amount,
    t.status,
    t.created_at,
    NOW() - t.created_at as tempo_pendente
FROM transactions t
WHERE t.status = 'pending'
  AND t.created_at < NOW() - INTERVAL '24 hours'
ORDER BY t.created_at;

-- 5.3 Jogos em progresso há mais de 7 dias
SELECT 
    g.id,
    g.player_a,
    g.player_b,
    g.modality,
    g.status,
    g.started_at,
    NOW() - g.started_at as duracao
FROM games g
WHERE g.status = 'in_progress'
  AND g.started_at < NOW() - INTERVAL '7 days'
ORDER BY g.started_at;

-- 5.4 Usuários com saldo bloqueado mas sem apostas ativas
SELECT 
    u.id,
    u.name,
    u.email,
    w.blocked_balance,
    COUNT(b.id) as apostas_ativas
FROM users u
JOIN wallet w ON u.id = w.user_id
LEFT JOIN bets b ON u.id = b.user_id AND b.status IN ('pending', 'matched')
WHERE w.blocked_balance > 0
GROUP BY u.id, w.blocked_balance
HAVING COUNT(b.id) = 0;

-- 5.5 Verificar integridade de transações
SELECT 
    type,
    COUNT(*) as total,
    COUNT(CASE WHEN net_amount != 
        CASE 
            WHEN type IN ('deposit', 'win', 'refund') THEN amount - fee
            WHEN type IN ('bet', 'withdraw', 'fee') THEN amount + fee
        END 
    THEN 1 END) as inconsistencias
FROM transactions
GROUP BY type;

-- ============================================================
-- SEÇÃO 6: FUNÇÕES AUXILIARES
-- ============================================================

-- 6.1 Função para calcular retorno potencial (exemplo simples 1:1)
CREATE OR REPLACE FUNCTION calculate_potential_return(bet_amount DECIMAL, odds DECIMAL DEFAULT 1.0)
RETURNS DECIMAL AS $$
BEGIN
    RETURN bet_amount * (1 + odds);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Exemplo de uso:
-- SELECT calculate_potential_return(100, 0.9); -- retorna 190

-- 6.2 Função para verificar se um usuário pode apostar
CREATE OR REPLACE FUNCTION can_user_bet(p_user_id UUID, p_amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
    user_balance DECIMAL;
BEGIN
    SELECT balance INTO user_balance
    FROM wallet
    WHERE user_id = p_user_id;
    
    RETURN user_balance >= p_amount;
END;
$$ LANGUAGE plpgsql;

-- Exemplo de uso:
-- SELECT can_user_bet('uuid-do-usuario', 50.00);

-- ============================================================
-- SEÇÃO 7: EXEMPLOS DE INSERÇÃO
-- ============================================================

-- 7.1 Criar usuário completo (carteira criada automaticamente)
INSERT INTO users (name, email, password_hash, phone, cpf, pix_key, pix_type)
VALUES (
    'João Silva',
    'joao.silva@email.com',
    '$2b$10$abcdefghijklmnopqrstuvwxyz12345', -- hash bcrypt fictício
    '+5511999999999',
    '123.456.789-00',
    'joao.silva@email.com',
    'email'
)
RETURNING id, name, email;

-- 7.2 Criar jogo
INSERT INTO games (player_a, player_b, modality, series, bet_limit)
VALUES (
    'João Silva',
    'Maria Santos',
    'Bolas Numeradas',
    3,
    1000.00
)
RETURNING id, player_a, player_b, status;

-- 7.3 Registrar depósito
-- ⚠️  ATENÇÃO: Esta query MODIFICA o banco de dados!
-- Versão dinâmica (deposita para o primeiro usuário encontrado)
-- Descomente apenas se quiser testar:

-- WITH first_user AS (
--     SELECT id FROM users LIMIT 1
-- ),
-- new_transaction AS (
--     INSERT INTO transactions (user_id, type, amount, fee, net_amount, status)
--     SELECT 
--         id,
--         'deposit',
--         100.00,
--         2.00, -- taxa de 2%
--         98.00,
--         'completed'
--     FROM first_user
--     RETURNING user_id, net_amount
-- )
-- UPDATE wallet
-- SET 
--     balance = balance + (SELECT net_amount FROM new_transaction),
--     total_deposited = total_deposited + 100.00
-- WHERE user_id = (SELECT user_id FROM new_transaction)
-- RETURNING user_id, balance, total_deposited;

-- 7.4 Fazer aposta (simplificado)
-- ⚠️  ATENÇÃO: Esta query MODIFICA o banco de dados!
-- Versão dinâmica (cria aposta para primeiro usuário no primeiro jogo open)
-- Descomente apenas se quiser testar:

-- WITH game_and_user AS (
--     SELECT 
--         (SELECT id FROM games WHERE status = 'open' LIMIT 1) as game_id,
--         (SELECT id FROM users ORDER BY RANDOM() LIMIT 1) as user_id
-- ),
-- new_bet AS (
--     INSERT INTO bets (game_id, user_id, side, amount, status)
--     SELECT 
--         game_id,
--         user_id,
--         'player_a',
--         50.00,
--         'pending'
--     FROM game_and_user
--     RETURNING id, user_id, amount
-- )
-- UPDATE wallet
-- SET 
--     balance = balance - (SELECT amount FROM new_bet),
--     blocked_balance = blocked_balance + (SELECT amount FROM new_bet)
-- WHERE user_id = (SELECT user_id FROM new_bet)
-- RETURNING user_id, balance, blocked_balance;

-- ============================================================
-- SEÇÃO 8: ÍNDICES E PERFORMANCE
-- ============================================================

-- 8.1 Verificar índices não utilizados
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as usos,
    pg_size_pretty(pg_relation_size(indexrelid)) as tamanho
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- 8.2 Analisar queries lentas (requer log de queries habilitado)
-- Configure postgresql.conf:
-- log_min_duration_statement = 1000 (1 segundo)

-- 8.3 Verificar tamanho das tabelas
-- Versão simplificada e compatível
SELECT 
    schemaname || '.' || tablename as tabela,
    pg_size_pretty(pg_total_relation_size((schemaname || '.' || tablename)::regclass)) as tamanho_total,
    pg_size_pretty(pg_relation_size((schemaname || '.' || tablename)::regclass)) as tamanho_dados,
    pg_size_pretty(
        pg_total_relation_size((schemaname || '.' || tablename)::regclass) - 
        pg_relation_size((schemaname || '.' || tablename)::regclass)
    ) as tamanho_indices
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size((schemaname || '.' || tablename)::regclass) DESC;

-- 8.4 Vacuum e Analyze (manutenção)
VACUUM ANALYZE users;
VACUUM ANALYZE wallet;
VACUUM ANALYZE games;
VACUUM ANALYZE bets;
VACUUM ANALYZE transactions;
VACUUM ANALYZE bet_matches;

-- ============================================================
-- FIM DAS QUERIES
-- ============================================================

