-- =====================================================
-- Migration: 007_create_bets_table
-- Description: Tabela de apostas (core do sistema)
-- Created: 2025-11-05
-- =====================================================

-- =====================================================
-- TIPOS ENUM
-- =====================================================

-- Status da aposta
CREATE TYPE bet_status AS ENUM (
  'pendente',      -- Aposta criada, aguardando início da série
  'aceita',        -- Aposta aceita (série iniciou)
  'ganha',         -- Usuário ganhou
  'perdida',       -- Usuário perdeu
  'cancelada',     -- Aposta cancelada (antes de iniciar)
  'reembolsada'    -- Aposta reembolsada (série cancelada)
);

-- =====================================================
-- TABELA BETS
-- =====================================================

CREATE TABLE IF NOT EXISTS bets (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relações
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  serie_id UUID REFERENCES series(id) ON DELETE CASCADE NOT NULL,
  chosen_player_id UUID REFERENCES players(id) ON DELETE RESTRICT NOT NULL,
  
  -- Valores (em centavos)
  amount INTEGER NOT NULL,
  potential_return INTEGER,
  actual_return INTEGER, -- Quanto realmente ganhou (após taxas)
  
  -- Status e controle
  status bet_status DEFAULT 'pendente' NOT NULL,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Matching de apostas (para sistema manual ou automático)
  matched_bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  odds DECIMAL(5,2), -- Odds no momento da aposta
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_amount CHECK (amount >= 1000), -- Mínimo R$ 10,00
  CONSTRAINT valid_return CHECK (
    potential_return IS NULL OR potential_return >= 0
  ),
  CONSTRAINT no_self_bet CHECK (
    user_id != (
      SELECT m.created_by FROM series s
      JOIN matches m ON m.id = s.match_id
      WHERE s.id = serie_id
    ) OR (
      SELECT m.created_by FROM series s
      JOIN matches m ON m.id = s.match_id
      WHERE s.id = serie_id
    ) IS NULL
  )
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índice para buscar apostas de um usuário
CREATE INDEX idx_bets_user ON bets(user_id);

-- Índice para buscar apostas de uma série
CREATE INDEX idx_bets_serie ON bets(serie_id);

-- Índice para buscar apostas por status
CREATE INDEX idx_bets_status ON bets(status);

-- Índice para buscar apostas pendentes
CREATE INDEX idx_bets_pending ON bets(status, placed_at)
WHERE status = 'pendente';

-- Índice composto para histórico do usuário
CREATE INDEX idx_bets_user_date ON bets(user_id, placed_at DESC);

-- Índice para matching de apostas
CREATE INDEX idx_bets_matched ON bets(matched_bet_id)
WHERE matched_bet_id IS NOT NULL;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Atualizar updated_at
CREATE OR REPLACE FUNCTION update_bets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bets_updated_at ON bets;
CREATE TRIGGER trigger_bets_updated_at
  BEFORE UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_bets_updated_at();

-- Trigger: Validar aposta antes de inserir
CREATE OR REPLACE FUNCTION validate_bet_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  serie_status_val serie_status;
  serie_betting_enabled BOOLEAN;
  user_balance INTEGER;
BEGIN
  -- 1. Verificar se série está liberada para apostas
  SELECT s.status, s.betting_enabled
  INTO serie_status_val, serie_betting_enabled
  FROM series s
  WHERE s.id = NEW.serie_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Série não encontrada';
  END IF;
  
  IF serie_status_val != 'liberada' THEN
    RAISE EXCEPTION 'Série não está liberada para apostas (status: %)', serie_status_val;
  END IF;
  
  IF NOT serie_betting_enabled THEN
    RAISE EXCEPTION 'Apostas não estão habilitadas para esta série';
  END IF;
  
  -- 2. Verificar se usuário tem saldo suficiente
  SELECT w.balance INTO user_balance
  FROM wallet w
  WHERE w.user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Carteira não encontrada';
  END IF;
  
  IF user_balance < NEW.amount THEN
    RAISE EXCEPTION 'Saldo insuficiente (saldo: R$ %, necessário: R$ %)',
      user_balance::DECIMAL / 100,
      NEW.amount::DECIMAL / 100;
  END IF;
  
  -- 3. Verificar se chosen_player é da partida
  IF NOT EXISTS (
    SELECT 1 FROM series s
    JOIN matches m ON m.id = s.match_id
    WHERE s.id = NEW.serie_id
    AND NEW.chosen_player_id IN (m.player1_id, m.player2_id)
  ) THEN
    RAISE EXCEPTION 'Jogador escolhido não está nesta partida';
  END IF;
  
  -- 4. Debitar saldo do usuário
  UPDATE wallet
  SET balance = balance - NEW.amount
  WHERE user_id = NEW.user_id;
  
  -- 5. Criar transação de débito
  INSERT INTO transactions (
    wallet_id,
    bet_id,
    type,
    amount,
    balance_before,
    balance_after,
    description
  ) VALUES (
    (SELECT id FROM wallet WHERE user_id = NEW.user_id),
    NEW.id,
    'aposta',
    -NEW.amount,
    user_balance,
    user_balance - NEW.amount,
    'Aposta na série ' || (
      SELECT serie_number FROM series WHERE id = NEW.serie_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_bet_on_insert ON bets;
CREATE TRIGGER trigger_validate_bet_on_insert
  BEFORE INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION validate_bet_on_insert();

-- Trigger: Resolver apostas quando série terminar
CREATE OR REPLACE FUNCTION resolve_bets_on_serie_end()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'encerrada' AND OLD.status != 'encerrada' THEN
    -- Atualizar apostas ganhadoras
    UPDATE bets b
    SET 
      status = 'ganha',
      resolved_at = TIMEZONE('utc'::text, NOW())
    WHERE b.serie_id = NEW.id
    AND b.chosen_player_id = NEW.winner_player_id
    AND b.status = 'aceita';
    
    -- Atualizar apostas perdedoras
    UPDATE bets b
    SET 
      status = 'perdida',
      resolved_at = TIMEZONE('utc'::text, NOW())
    WHERE b.serie_id = NEW.id
    AND b.chosen_player_id != NEW.winner_player_id
    AND b.status = 'aceita';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_resolve_bets_on_serie_end ON series;
CREATE TRIGGER trigger_resolve_bets_on_serie_end
  AFTER UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION resolve_bets_on_serie_end();

-- Trigger: Creditar ganhos automaticamente
CREATE OR REPLACE FUNCTION credit_winnings()
RETURNS TRIGGER AS $$
DECLARE
  return_amount INTEGER;
  user_wallet_id UUID;
  current_balance INTEGER;
BEGIN
  IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
    -- Calcular retorno (por enquanto 2x o valor, depois implementar odds)
    return_amount := NEW.amount * 2;
    
    -- Buscar wallet e saldo atual
    SELECT id, balance INTO user_wallet_id, current_balance
    FROM wallet
    WHERE user_id = NEW.user_id;
    
    -- Creditar saldo
    UPDATE wallet
    SET balance = balance + return_amount
    WHERE user_id = NEW.user_id;
    
    -- Criar transação de crédito
    INSERT INTO transactions (
      wallet_id,
      bet_id,
      type,
      amount,
      balance_before,
      balance_after,
      description
    ) VALUES (
      user_wallet_id,
      NEW.id,
      'ganho',
      return_amount,
      current_balance,
      current_balance + return_amount,
      'Ganho na aposta da série ' || (
        SELECT serie_number FROM series WHERE id = NEW.serie_id
      )
    );
    
    -- Atualizar actual_return
    UPDATE bets
    SET actual_return = return_amount
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_credit_winnings ON bets;
CREATE TRIGGER trigger_credit_winnings
  AFTER UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION credit_winnings();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem apenas suas apostas, admins veem todas
CREATE POLICY "Usuários veem suas apostas"
  ON bets
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política: Usuários podem criar apostas
CREATE POLICY "Usuários podem criar apostas"
  ON bets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Apenas sistema pode atualizar apostas (via triggers)
-- Admins podem atualizar manualmente se necessário
CREATE POLICY "Apenas admins podem atualizar apostas"
  ON bets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política: Usuários podem deletar apostas ANTES de iniciar
CREATE POLICY "Usuários podem cancelar apostas pendentes"
  ON bets
  FOR DELETE
  USING (
    auth.uid() = user_id AND
    status = 'pendente' AND
    EXISTS (
      SELECT 1 FROM series 
      WHERE id = serie_id 
      AND status = 'liberada'
    )
  );

-- =====================================================
-- COMENTÁRIOS (Documentação)
-- =====================================================

COMMENT ON TABLE bets IS 'Apostas dos usuários nas séries';
COMMENT ON COLUMN bets.id IS 'Identificador único da aposta';
COMMENT ON COLUMN bets.user_id IS 'ID do usuário que apostou';
COMMENT ON COLUMN bets.serie_id IS 'ID da série apostada';
COMMENT ON COLUMN bets.chosen_player_id IS 'ID do jogador escolhido';
COMMENT ON COLUMN bets.amount IS 'Valor apostado em centavos (mín R$ 10,00)';
COMMENT ON COLUMN bets.potential_return IS 'Retorno potencial em centavos';
COMMENT ON COLUMN bets.actual_return IS 'Retorno real após taxas';
COMMENT ON COLUMN bets.status IS 'Status: pendente, aceita, ganha, perdida, cancelada, reembolsada';
COMMENT ON COLUMN bets.placed_at IS 'Quando a aposta foi feita';
COMMENT ON COLUMN bets.resolved_at IS 'Quando a aposta foi resolvida';
COMMENT ON COLUMN bets.matched_bet_id IS 'ID da aposta casada (matching)';
COMMENT ON COLUMN bets.odds IS 'Odds no momento da aposta';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'Tabela bets criada com sucesso!' as status;
SELECT * FROM bets;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


