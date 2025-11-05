-- ============================================================
-- SinucaBet - Dados de Seed para Desenvolvimento/Testes
-- AVISO: NÃO EXECUTAR EM PRODUÇÃO!
-- ============================================================

-- Limpar dados existentes (cuidado!)
-- TRUNCATE TABLE bet_matches, transactions, bets, games, wallet, users CASCADE;

-- ============================================================
-- 1. USUÁRIOS DE TESTE
-- ============================================================

-- Senha: "senha123" (hash bcrypt)
-- Use bcrypt online para gerar: https://bcrypt-generator.com/

INSERT INTO users (id, name, email, password_hash, phone, cpf, pix_key, pix_type, email_verified, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'João Silva', 'joao.silva@sinucabet.com', '$2b$10$abcdefghijklmnopqrstuvwxyz12345678901234567890AB', '+5511999991111', '123.456.789-01', 'joao.silva@sinucabet.com', 'email', true, true),
('22222222-2222-2222-2222-222222222222', 'Maria Santos', 'maria.santos@sinucabet.com', '$2b$10$abcdefghijklmnopqrstuvwxyz12345678901234567890AB', '+5511999992222', '123.456.789-02', '123.456.789-02', 'cpf', true, true),
('33333333-3333-3333-3333-333333333333', 'Pedro Costa', 'pedro.costa@sinucabet.com', '$2b$10$abcdefghijklmnopqrstuvwxyz12345678901234567890AB', '+5511999993333', '123.456.789-03', '+5511999993333', 'phone', true, true),
('44444444-4444-4444-4444-444444444444', 'Ana Lima', 'ana.lima@sinucabet.com', '$2b$10$abcdefghijklmnopqrstuvwxyz12345678901234567890AB', '+5511999994444', '123.456.789-04', 'abc123xyz456', 'random', true, true),
('55555555-5555-5555-5555-555555555555', 'Carlos Oliveira', 'carlos.oliveira@sinucabet.com', '$2b$10$abcdefghijklmnopqrstuvwxyz12345678901234567890AB', '+5511999995555', '123.456.789-05', 'carlos.oliveira@sinucabet.com', 'email', true, true),
('66666666-6666-6666-6666-666666666666', 'Beatriz Ferreira', 'beatriz.ferreira@sinucabet.com', '$2b$10$abcdefghijklmnopqrstuvwxyz12345678901234567890AB', '+5511999996666', '123.456.789-06', 'beatriz.ferreira@sinucabet.com', 'email', false, true),
('77777777-7777-7777-7777-777777777777', 'Rafael Souza', 'rafael.souza@sinucabet.com', '$2b$10$abcdefghijklmnopqrstuvwxyz12345678901234567890AB', '+5511999997777', '123.456.789-07', '+5511999997777', 'phone', true, true),
('88888888-8888-8888-8888-888888888888', 'Juliana Alves', 'juliana.alves@sinucabet.com', '$2b$10$abcdefghijklmnopqrstuvwxyz12345678901234567890AB', '+5511999998888', '123.456.789-08', '123.456.789-08', 'cpf', true, true),
('99999999-9999-9999-9999-999999999999', 'Fernando Rocha', 'fernando.rocha@sinucabet.com', '$2b$10$abcdefghijklmnopqrstuvwxyz12345678901234567890AB', '+5511999999999', '123.456.789-09', 'fernando.rocha@sinucabet.com', 'email', true, true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Camila Martins', 'camila.martins@sinucabet.com', '$2b$10$abcdefghijklmnopqrstuvwxyz12345678901234567890AB', '+5511999990000', '123.456.789-10', 'camila.martins@sinucabet.com', 'email', true, true);

-- ============================================================
-- 2. CARTEIRAS (criadas automaticamente via trigger, mas atualizando saldos)
-- ============================================================

UPDATE wallet SET balance = 1000.00, total_deposited = 1000.00 WHERE user_id = '11111111-1111-1111-1111-111111111111';
UPDATE wallet SET balance = 500.00, total_deposited = 500.00 WHERE user_id = '22222222-2222-2222-2222-222222222222';
UPDATE wallet SET balance = 2000.00, total_deposited = 2000.00 WHERE user_id = '33333333-3333-3333-3333-333333333333';
UPDATE wallet SET balance = 750.00, total_deposited = 750.00 WHERE user_id = '44444444-4444-4444-4444-444444444444';
UPDATE wallet SET balance = 1500.00, total_deposited = 1500.00 WHERE user_id = '55555555-5555-5555-5555-555555555555';
UPDATE wallet SET balance = 300.00, total_deposited = 300.00 WHERE user_id = '66666666-6666-6666-6666-666666666666';
UPDATE wallet SET balance = 1200.00, total_deposited = 1200.00 WHERE user_id = '77777777-7777-7777-7777-777777777777';
UPDATE wallet SET balance = 800.00, total_deposited = 800.00 WHERE user_id = '88888888-8888-8888-8888-888888888888';
UPDATE wallet SET balance = 2500.00, total_deposited = 2500.00 WHERE user_id = '99999999-9999-9999-9999-999999999999';
UPDATE wallet SET balance = 450.00, total_deposited = 450.00 WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- ============================================================
-- 3. JOGOS
-- ============================================================

-- Jogos abertos (status: open)
INSERT INTO games (id, player_a, player_b, modality, series, status, bet_limit, total_bet_player_a, total_bet_player_b) VALUES
('a0000000-0000-0000-0000-000000000001', 'Ronnie OSullivan', 'Mark Selby', 'Bolas Numeradas', 5, 'open', 5000.00, 0, 0),
('a0000000-0000-0000-0000-000000000002', 'Judd Trump', 'Neil Robertson', 'Bolas Lisas', 3, 'open', 3000.00, 0, 0),
('a0000000-0000-0000-0000-000000000003', 'John Higgins', 'Shaun Murphy', 'Sinuca Brasileira', 7, 'open', 10000.00, 0, 0),
('a0000000-0000-0000-0000-000000000004', 'Ding Junhui', 'Kyren Wilson', 'Bolas Numeradas', 3, 'open', 2000.00, 0, 0),
('a0000000-0000-0000-0000-000000000005', 'Mark Williams', 'Stuart Bingham', 'Bolas Lisas', 5, 'open', NULL, 0, 0);

-- Jogos em andamento (status: in_progress)
INSERT INTO games (id, player_a, player_b, modality, advantages, series, status, bet_limit, total_bet_player_a, total_bet_player_b, started_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'Baianinho de Mauá', 'Robson Gouveia', 'Bola 8', 'Baianinho joga com 2 bolas na mesa', 3, 'in_progress', 5000.00, 150.00, 150.00, NOW() - INTERVAL '2 hours'),
('b0000000-0000-0000-0000-000000000002', 'Rui Chapéu', 'Sergio Motta', 'Sinuca Brasileira', NULL, 5, 'in_progress', 3000.00, 300.00, 300.00, NOW() - INTERVAL '1 hour');

-- Jogos finalizados (status: finished)
INSERT INTO games (id, player_a, player_b, modality, series, status, result, total_bet_player_a, total_bet_player_b, started_at, finished_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'Zico', 'Pelé', 'Bolas Numeradas', 3, 'finished', 'player_a', 500.00, 500.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 22 hours'),
('c0000000-0000-0000-0000-000000000002', 'Maradona', 'Ronaldo', 'Bolas Lisas', 5, 'finished', 'player_b', 1000.00, 1000.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 20 hours'),
('c0000000-0000-0000-0000-000000000003', 'Garrincha', 'Romário', 'Sinuca Brasileira', 3, 'finished', 'player_a', 750.00, 750.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days 18 hours');
-- Nota: 750 = 380 + 370 (apostas do jogo 3)

-- ============================================================
-- 4. APOSTAS
-- ============================================================

-- Apostas em jogos abertos (pending)
INSERT INTO bets (id, game_id, user_id, side, amount, status) VALUES
-- Jogo 1: Ronnie vs Mark
('ba000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'player_a', 100.00, 'pending'),
('ba000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'player_a', 50.00, 'pending'),
('ba000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'player_b', 200.00, 'pending'),

-- Jogo 2: Judd vs Neil
('ba000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'player_a', 150.00, 'pending'),
('ba000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'player_b', 100.00, 'pending'),

-- Jogo 3: John vs Shaun
('ba000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', '66666666-6666-6666-6666-666666666666', 'player_a', 50.00, 'pending'),
('ba000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777777', 'player_b', 300.00, 'pending');

-- Apostas em jogos em andamento (matched)
INSERT INTO bets (id, game_id, user_id, side, amount, potential_return, status, matched_at) VALUES
-- Jogo in_progress 1
('bb000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', 'player_a', 100.00, 190.00, 'matched', NOW() - INTERVAL '2 hours'),
('bb000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999', 'player_b', 100.00, 190.00, 'matched', NOW() - INTERVAL '2 hours'),
('bb000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'player_a', 50.00, 95.00, 'matched', NOW() - INTERVAL '1 hour 30 minutes'),
('bb000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'player_b', 50.00, 95.00, 'matched', NOW() - INTERVAL '1 hour 30 minutes'),

-- Jogo in_progress 2
('bb000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'player_a', 150.00, 285.00, 'matched', NOW() - INTERVAL '1 hour'),
('bb000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'player_b', 150.00, 285.00, 'matched', NOW() - INTERVAL '1 hour'),
('bb000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'player_a', 150.00, 285.00, 'matched', NOW() - INTERVAL '45 minutes'),
('bb000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'player_b', 150.00, 285.00, 'matched', NOW() - INTERVAL '45 minutes');

-- Apostas em jogos finalizados (won/lost)
INSERT INTO bets (id, game_id, user_id, side, amount, potential_return, status, matched_at, settled_at) VALUES
-- Jogo finished 1 (player_a venceu)
('bc000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'player_a', 250.00, 475.00, 'won', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 22 hours'),
('bc000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', 'player_b', 250.00, 475.00, 'lost', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 22 hours'),
('bc000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', 'player_a', 250.00, 475.00, 'won', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 22 hours'),
('bc000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999', 'player_b', 250.00, 475.00, 'lost', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 22 hours'),

-- Jogo finished 2 (player_b venceu)
('bc000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'player_a', 500.00, 950.00, 'lost', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 20 hours'),
('bc000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'player_b', 500.00, 950.00, 'won', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 20 hours'),
('bc000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'player_a', 500.00, 950.00, 'lost', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 20 hours'),
('bc000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'player_b', 500.00, 950.00, 'won', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 20 hours'),

-- Jogo finished 3 (player_a venceu)
('bc000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'player_a', 380.00, 722.00, 'won', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days 18 hours'),
('bc000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 'player_b', 380.00, 722.00, 'lost', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days 18 hours'),
('bc000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', '66666666-6666-6666-6666-666666666666', 'player_a', 370.00, 703.00, 'won', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days 18 hours'),
('bc000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777777', 'player_b', 370.00, 703.00, 'lost', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days 18 hours');

-- ============================================================
-- 5. TRANSAÇÕES
-- ============================================================

-- Depósitos
INSERT INTO transactions (user_id, type, amount, fee, net_amount, status, description, processed_at) VALUES
('11111111-1111-1111-1111-111111111111', 'deposit', 1000.00, 20.00, 980.00, 'completed', 'Depósito via PIX', NOW() - INTERVAL '7 days'),
('22222222-2222-2222-2222-222222222222', 'deposit', 500.00, 10.00, 490.00, 'completed', 'Depósito via PIX', NOW() - INTERVAL '6 days'),
('33333333-3333-3333-3333-333333333333', 'deposit', 2000.00, 40.00, 1960.00, 'completed', 'Depósito via TED', NOW() - INTERVAL '5 days'),
('44444444-4444-4444-4444-444444444444', 'deposit', 750.00, 15.00, 735.00, 'completed', 'Depósito via PIX', NOW() - INTERVAL '4 days'),
('55555555-5555-5555-5555-555555555555', 'deposit', 1500.00, 30.00, 1470.00, 'completed', 'Depósito via PIX', NOW() - INTERVAL '3 days');

-- Apostas (transações de bet)
INSERT INTO transactions (user_id, bet_id, type, amount, fee, net_amount, status, description, processed_at) VALUES
('11111111-1111-1111-1111-111111111111', 'ba000000-0000-0000-0000-000000000001', 'bet', 100.00, 0.00, 100.00, 'completed', 'Aposta no jogo Ronnie OSullivan vs Mark Selby', NOW() - INTERVAL '6 hours'),
('22222222-2222-2222-2222-222222222222', 'ba000000-0000-0000-0000-000000000002', 'bet', 50.00, 0.00, 50.00, 'completed', 'Aposta no jogo Ronnie OSullivan vs Mark Selby', NOW() - INTERVAL '5 hours'),
('33333333-3333-3333-3333-333333333333', 'ba000000-0000-0000-0000-000000000003', 'bet', 200.00, 0.00, 200.00, 'completed', 'Aposta no jogo Ronnie OSullivan vs Mark Selby', NOW() - INTERVAL '4 hours');

-- Ganhos (transações de win)
INSERT INTO transactions (user_id, bet_id, type, amount, fee, net_amount, status, description, processed_at) VALUES
('66666666-6666-6666-6666-666666666666', 'bc000000-0000-0000-0000-000000000001', 'win', 475.00, 23.75, 451.25, 'completed', 'Ganho da aposta no jogo Zico vs Pelé', NOW() - INTERVAL '1 day 22 hours'),
('88888888-8888-8888-8888-888888888888', 'bc000000-0000-0000-0000-000000000003', 'win', 475.00, 23.75, 451.25, 'completed', 'Ganho da aposta no jogo Zico vs Pelé', NOW() - INTERVAL '1 day 22 hours'),
('11111111-1111-1111-1111-111111111111', 'bc000000-0000-0000-0000-000000000006', 'win', 950.00, 47.50, 902.50, 'completed', 'Ganho da aposta no jogo Maradona vs Ronaldo', NOW() - INTERVAL '2 days 20 hours'),
('33333333-3333-3333-3333-333333333333', 'bc000000-0000-0000-0000-000000000008', 'win', 950.00, 47.50, 902.50, 'completed', 'Ganho da aposta no jogo Maradona vs Ronaldo', NOW() - INTERVAL '2 days 20 hours');

-- Saques
INSERT INTO transactions (user_id, type, amount, fee, net_amount, status, description, processed_at) VALUES
('99999999-9999-9999-9999-999999999999', 'withdraw', 500.00, 10.00, 510.00, 'completed', 'Saque via PIX', NOW() - INTERVAL '1 day'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'withdraw', 200.00, 5.00, 205.00, 'completed', 'Saque via PIX', NOW() - INTERVAL '2 days');

-- Transações pendentes (para teste)
INSERT INTO transactions (user_id, type, amount, fee, net_amount, status, description) VALUES
('77777777-7777-7777-7777-777777777777', 'deposit', 300.00, 6.00, 294.00, 'pending', 'Aguardando confirmação de depósito PIX'),
('88888888-8888-8888-8888-888888888888', 'withdraw', 100.00, 2.50, 102.50, 'pending', 'Processando saque');

-- ============================================================
-- 6. PAREAMENTOS DE APOSTAS
-- ============================================================

INSERT INTO bet_matches (game_id, bet_player_a_id, bet_player_b_id, matched_amount) VALUES
-- Jogo in_progress 1
('b0000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000002', 100.00),
('b0000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000004', 50.00),

-- Jogo in_progress 2
('b0000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000006', 150.00),
('b0000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000007', 'bb000000-0000-0000-0000-000000000008', 150.00),

-- Jogo finished 1
('c0000000-0000-0000-0000-000000000001', 'bc000000-0000-0000-0000-000000000001', 'bc000000-0000-0000-0000-000000000002', 250.00),
('c0000000-0000-0000-0000-000000000001', 'bc000000-0000-0000-0000-000000000003', 'bc000000-0000-0000-0000-000000000004', 250.00),

-- Jogo finished 2
('c0000000-0000-0000-0000-000000000002', 'bc000000-0000-0000-0000-000000000005', 'bc000000-0000-0000-0000-000000000006', 500.00),
('c0000000-0000-0000-0000-000000000002', 'bc000000-0000-0000-0000-000000000007', 'bc000000-0000-0000-0000-000000000008', 500.00),

-- Jogo finished 3
('c0000000-0000-0000-0000-000000000003', 'bc000000-0000-0000-0000-000000000009', 'bc000000-0000-0000-0000-000000000010', 380.00),
('c0000000-0000-0000-0000-000000000003', 'bc000000-0000-0000-0000-000000000011', 'bc000000-0000-0000-0000-000000000012', 370.00);

-- ============================================================
-- 7. ATUALIZAR SALDO BLOQUEADO NAS CARTEIRAS
-- ============================================================

-- Bloquear saldo das apostas pendentes
UPDATE wallet SET blocked_balance = 100.00 WHERE user_id = '11111111-1111-1111-1111-111111111111';
UPDATE wallet SET blocked_balance = 50.00 WHERE user_id = '22222222-2222-2222-2222-222222222222';
UPDATE wallet SET blocked_balance = 200.00 WHERE user_id = '33333333-3333-3333-3333-333333333333';
UPDATE wallet SET blocked_balance = 150.00 WHERE user_id = '44444444-4444-4444-4444-444444444444';
UPDATE wallet SET blocked_balance = 100.00 WHERE user_id = '55555555-5555-5555-5555-555555555555';
UPDATE wallet SET blocked_balance = 50.00 WHERE user_id = '66666666-6666-6666-6666-666666666666';
UPDATE wallet SET blocked_balance = 300.00 WHERE user_id = '77777777-7777-7777-7777-777777777777';

-- ============================================================
-- 8. ATUALIZAR TOTAIS NOS JOGOS
-- ============================================================

UPDATE games SET 
    total_bet_player_a = 150.00,
    total_bet_player_b = 200.00
WHERE id = 'a0000000-0000-0000-0000-000000000001';

UPDATE games SET 
    total_bet_player_a = 150.00,
    total_bet_player_b = 100.00
WHERE id = 'a0000000-0000-0000-0000-000000000002';

UPDATE games SET 
    total_bet_player_a = 50.00,
    total_bet_player_b = 300.00
WHERE id = 'a0000000-0000-0000-0000-000000000003';

-- ============================================================
-- 9. VERIFICAÇÕES
-- ============================================================

-- Verificar se tudo foi inserido corretamente
SELECT 'Usuários cadastrados:' as info, COUNT(*) as total FROM users
UNION ALL
SELECT 'Carteiras criadas:', COUNT(*) FROM wallet
UNION ALL
SELECT 'Jogos cadastrados:', COUNT(*) FROM games
UNION ALL
SELECT 'Apostas realizadas:', COUNT(*) FROM bets
UNION ALL
SELECT 'Transações registradas:', COUNT(*) FROM transactions
UNION ALL
SELECT 'Pareamentos criados:', COUNT(*) FROM bet_matches;

-- Verificar saldos
SELECT 
    'Saldo total disponível:' as info,
    TO_CHAR(SUM(balance), 'R$ 999G999G990D00') as valor
FROM wallet
UNION ALL
SELECT 
    'Saldo total bloqueado:',
    TO_CHAR(SUM(blocked_balance), 'R$ 999G999G990D00')
FROM wallet;

-- ============================================================
-- FIM DO SEED
-- ============================================================

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Dados de seed inseridos com sucesso!';
    RAISE NOTICE '📧 Credenciais de teste: qualquer email acima com senha "senha123"';
    RAISE NOTICE '⚠️  ATENÇÃO: NÃO usar estes dados em produção!';
END $$;

