-- ============================================================
-- SinucaBet - Database Schema
-- Plataforma de Intermediação de Apostas de Sinuca
-- PostgreSQL 14+
-- ============================================================

-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS (Tipos Customizados)
-- ============================================================

-- Tipo de chave PIX
CREATE TYPE pix_type_enum AS ENUM ('email', 'cpf', 'phone', 'random');

-- Status do jogo
CREATE TYPE game_status_enum AS ENUM ('open', 'in_progress', 'finished', 'cancelled');

-- Resultado do jogo
CREATE TYPE game_result_enum AS ENUM ('player_a', 'player_b', 'draw');

-- Lado da aposta (qual jogador)
CREATE TYPE bet_side_enum AS ENUM ('player_a', 'player_b');

-- Status da aposta
CREATE TYPE bet_status_enum AS ENUM ('pending', 'matched', 'won', 'lost', 'cancelled');

-- Tipo de transação
CREATE TYPE transaction_type_enum AS ENUM ('deposit', 'bet', 'win', 'withdraw', 'fee', 'refund');

-- Status da transação
CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- ============================================================
-- TABELA: users
-- Armazena informações dos usuários da plataforma
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    pix_key VARCHAR(255),
    pix_type pix_type_enum,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT cpf_format CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'),
    CONSTRAINT phone_format CHECK (phone ~ '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT pix_key_required CHECK (
        (pix_key IS NULL AND pix_type IS NULL) OR 
        (pix_key IS NOT NULL AND pix_type IS NOT NULL)
    )
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Comentários
COMMENT ON TABLE users IS 'Usuários registrados na plataforma SinucaBet';
COMMENT ON COLUMN users.pix_key IS 'Chave PIX para pagamentos (pode ser email, CPF, telefone ou chave aleatória)';
COMMENT ON COLUMN users.is_active IS 'Indica se o usuário está ativo na plataforma';

-- ============================================================
-- TABELA: wallet
-- Carteira digital de cada usuário
-- ============================================================
CREATE TABLE wallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    blocked_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_deposited DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT balance_non_negative CHECK (balance >= 0),
    CONSTRAINT blocked_balance_non_negative CHECK (blocked_balance >= 0),
    CONSTRAINT total_deposited_non_negative CHECK (total_deposited >= 0),
    CONSTRAINT total_withdrawn_non_negative CHECK (total_withdrawn >= 0)
);

-- Índices
CREATE INDEX idx_wallet_user_id ON wallet(user_id);
CREATE INDEX idx_wallet_balance ON wallet(balance DESC);

-- Comentários
COMMENT ON TABLE wallet IS 'Carteira digital dos usuários com saldo disponível e bloqueado';
COMMENT ON COLUMN wallet.balance IS 'Saldo disponível para apostas e saques';
COMMENT ON COLUMN wallet.blocked_balance IS 'Saldo bloqueado em apostas pendentes';
COMMENT ON COLUMN wallet.total_deposited IS 'Total acumulado de depósitos';
COMMENT ON COLUMN wallet.total_withdrawn IS 'Total acumulado de saques';

-- ============================================================
-- TABELA: games
-- Jogos/partidas de sinuca
-- ============================================================
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_a VARCHAR(255) NOT NULL,
    player_b VARCHAR(255) NOT NULL,
    modality VARCHAR(100) NOT NULL,
    advantages TEXT,
    series INTEGER NOT NULL DEFAULT 1,
    status game_status_enum NOT NULL DEFAULT 'open',
    result game_result_enum,
    bet_limit DECIMAL(15, 2),
    total_bet_player_a DECIMAL(15, 2) DEFAULT 0.00,
    total_bet_player_b DECIMAL(15, 2) DEFAULT 0.00,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT series_positive CHECK (series > 0),
    CONSTRAINT different_players CHECK (player_a != player_b),
    CONSTRAINT result_only_when_finished CHECK (
        (status = 'finished' AND result IS NOT NULL) OR 
        (status != 'finished' AND result IS NULL)
    ),
    CONSTRAINT bet_limit_positive CHECK (bet_limit IS NULL OR bet_limit > 0),
    CONSTRAINT total_bets_non_negative CHECK (
        total_bet_player_a >= 0 AND total_bet_player_b >= 0
    )
);

-- Índices
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_games_player_a ON games(player_a);
CREATE INDEX idx_games_player_b ON games(player_b);
CREATE INDEX idx_games_modality ON games(modality);

-- Comentários
COMMENT ON TABLE games IS 'Partidas de sinuca disponíveis para apostas';
COMMENT ON COLUMN games.modality IS 'Modalidade do jogo: bolas lisas, numeradas, etc.';
COMMENT ON COLUMN games.advantages IS 'Vantagens aplicadas ao jogo (opcional)';
COMMENT ON COLUMN games.series IS 'Número de partidas na série (melhor de N)';
COMMENT ON COLUMN games.bet_limit IS 'Limite máximo de aposta por lado (opcional)';

-- ============================================================
-- TABELA: bets
-- Apostas realizadas pelos usuários
-- ============================================================
CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL,
    user_id UUID NOT NULL,
    side bet_side_enum NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    potential_return DECIMAL(15, 2),
    status bet_status_enum NOT NULL DEFAULT 'pending',
    matched_at TIMESTAMP WITH TIME ZONE,
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_bets_game FOREIGN KEY (game_id) 
        REFERENCES games(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_bets_user FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT amount_multiple_of_10 CHECK (amount >= 10 AND MOD(amount::INTEGER, 10) = 0),
    CONSTRAINT potential_return_positive CHECK (potential_return IS NULL OR potential_return > 0)
);

-- Índices
CREATE INDEX idx_bets_game_id ON bets(game_id);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_created_at ON bets(created_at DESC);
CREATE INDEX idx_bets_game_side ON bets(game_id, side);

-- Índice composto para queries de matching
CREATE INDEX idx_bets_game_status_side ON bets(game_id, status, side);

-- Comentários
COMMENT ON TABLE bets IS 'Apostas realizadas pelos usuários nos jogos';
COMMENT ON COLUMN bets.amount IS 'Valor apostado (deve ser múltiplo de 10)';
COMMENT ON COLUMN bets.side IS 'Lado da aposta (player_a ou player_b)';
COMMENT ON COLUMN bets.potential_return IS 'Retorno potencial da aposta (calculado após matching)';
COMMENT ON COLUMN bets.matched_at IS 'Timestamp quando a aposta foi pareada com outra(s)';

-- ============================================================
-- TABELA: transactions
-- Histórico de transações financeiras
-- ============================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    bet_id UUID,
    type transaction_type_enum NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    fee DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    net_amount DECIMAL(15, 2) NOT NULL,
    status transaction_status_enum NOT NULL DEFAULT 'pending',
    description TEXT,
    metadata JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_transactions_bet FOREIGN KEY (bet_id) 
        REFERENCES bets(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT amount_positive CHECK (amount > 0),
    CONSTRAINT fee_non_negative CHECK (fee >= 0),
    CONSTRAINT net_amount_calculation CHECK (
        (type IN ('deposit', 'win', 'refund') AND net_amount = amount - fee) OR
        (type IN ('bet', 'withdraw', 'fee') AND net_amount = amount + fee)
    )
);

-- Índices
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_bet_id ON transactions(bet_id) WHERE bet_id IS NOT NULL;
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- Índice GIN para busca no JSONB
CREATE INDEX idx_transactions_metadata ON transactions USING GIN (metadata);

-- Comentários
COMMENT ON TABLE transactions IS 'Histórico completo de transações financeiras';
COMMENT ON COLUMN transactions.type IS 'Tipo da transação: depósito, aposta, ganho, saque, taxa ou reembolso';
COMMENT ON COLUMN transactions.fee IS 'Taxa cobrada na transação';
COMMENT ON COLUMN transactions.net_amount IS 'Valor líquido (amount ± fee)';
COMMENT ON COLUMN transactions.metadata IS 'Dados adicionais em formato JSON';

-- ============================================================
-- TABELA: bet_matches
-- Pareamento de apostas (matching)
-- ============================================================
CREATE TABLE bet_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL,
    bet_player_a_id UUID NOT NULL,
    bet_player_b_id UUID NOT NULL,
    matched_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_bet_matches_game FOREIGN KEY (game_id) 
        REFERENCES games(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_bet_matches_bet_a FOREIGN KEY (bet_player_a_id) 
        REFERENCES bets(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_bet_matches_bet_b FOREIGN KEY (bet_player_b_id) 
        REFERENCES bets(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT matched_amount_positive CHECK (matched_amount > 0),
    CONSTRAINT different_bets CHECK (bet_player_a_id != bet_player_b_id)
);

-- Índices
CREATE INDEX idx_bet_matches_game_id ON bet_matches(game_id);
CREATE INDEX idx_bet_matches_bet_a ON bet_matches(bet_player_a_id);
CREATE INDEX idx_bet_matches_bet_b ON bet_matches(bet_player_b_id);
CREATE INDEX idx_bet_matches_created_at ON bet_matches(created_at DESC);

-- Comentários
COMMENT ON TABLE bet_matches IS 'Registro de pareamento entre apostas de lados opostos';
COMMENT ON COLUMN bet_matches.matched_amount IS 'Valor pareado entre as apostas';

-- ============================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para users
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para wallet
CREATE TRIGGER trigger_wallet_updated_at
    BEFORE UPDATE ON wallet
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para games
CREATE TRIGGER trigger_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para bets
CREATE TRIGGER trigger_bets_updated_at
    BEFORE UPDATE ON bets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para transactions
CREATE TRIGGER trigger_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

-- View: Estatísticas de usuários
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    w.balance,
    w.blocked_balance,
    COUNT(DISTINCT b.id) as total_bets,
    COALESCE(SUM(CASE WHEN b.status = 'won' THEN b.amount ELSE 0 END), 0) as total_won,
    COALESCE(SUM(CASE WHEN b.status = 'lost' THEN b.amount ELSE 0 END), 0) as total_lost,
    u.created_at
FROM users u
LEFT JOIN wallet w ON u.id = w.user_id
LEFT JOIN bets b ON u.id = b.user_id
GROUP BY u.id, u.name, u.email, w.balance, w.blocked_balance, u.created_at;

-- View: Jogos com estatísticas de apostas
CREATE VIEW game_betting_stats AS
SELECT 
    g.id,
    g.player_a,
    g.player_b,
    g.modality,
    g.status,
    g.total_bet_player_a,
    g.total_bet_player_b,
    COUNT(DISTINCT b.id) as total_bets,
    COUNT(DISTINCT b.user_id) as unique_bettors,
    g.created_at
FROM games g
LEFT JOIN bets b ON g.id = b.game_id
GROUP BY g.id;

-- View: Resumo de transações por usuário
CREATE VIEW user_transaction_summary AS
SELECT 
    u.id as user_id,
    u.name,
    COUNT(t.id) as total_transactions,
    SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) as total_deposits,
    SUM(CASE WHEN t.type = 'withdraw' THEN t.amount ELSE 0 END) as total_withdrawals,
    SUM(CASE WHEN t.type = 'bet' THEN t.amount ELSE 0 END) as total_bet_amount,
    SUM(CASE WHEN t.type = 'win' THEN t.amount ELSE 0 END) as total_winnings,
    SUM(t.fee) as total_fees_paid
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
GROUP BY u.id, u.name;

-- ============================================================
-- FUNÇÃO: Criar carteira automaticamente ao criar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallet (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_wallet
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_wallet_for_new_user();

-- ============================================================
-- DADOS DE EXEMPLO (OPCIONAL - REMOVER EM PRODUÇÃO)
-- ============================================================

-- Inserir modalidades comuns (pode ser uma tabela separada no futuro)
-- INSERT INTO games (player_a, player_b, modality, series) VALUES
-- ('João Silva', 'Maria Santos', 'Bolas Numeradas', 3),
-- ('Pedro Costa', 'Ana Lima', 'Bolas Lisas', 5);

-- ============================================================
-- PERMISSÕES (Ajustar conforme necessário)
-- ============================================================

-- Exemplo: Criar role para aplicação
-- CREATE ROLE sinucabet_app WITH LOGIN PASSWORD 'secure_password';
-- GRANT CONNECT ON DATABASE sinucabet TO sinucabet_app;
-- GRANT USAGE ON SCHEMA public TO sinucabet_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sinucabet_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sinucabet_app;

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================

