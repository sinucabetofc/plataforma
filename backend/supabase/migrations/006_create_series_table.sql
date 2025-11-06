-- =====================================================
-- Migration: 006_create_series_table
-- Description: Tabela de séries (subdivisões das partidas)
-- Created: 2025-11-05
-- Nota: Cada partida tem N séries, apostas são feitas por série
-- =====================================================

-- =====================================================
-- TIPOS ENUM
-- =====================================================

-- Status da série
CREATE TYPE serie_status AS ENUM (
  'pendente',        -- Ainda não iniciada
  'liberada',        -- Liberada para apostas
  'em_andamento',    -- Em andamento (apostas fechadas)
  'encerrada',       -- Finalizada com vencedor
  'cancelada'        -- Cancelada
);

-- =====================================================
-- TABELA SERIES
-- =====================================================

CREATE TABLE IF NOT EXISTS series (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relação com partida (CASCADE: deletar partida = deletar séries)
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  serie_number INTEGER NOT NULL,
  
  -- Status e controle
  status serie_status DEFAULT 'pendente' NOT NULL,
  betting_enabled BOOLEAN DEFAULT false NOT NULL,
  betting_locked_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Placar
  player1_score INTEGER DEFAULT 0 NOT NULL,
  player2_score INTEGER DEFAULT 0 NOT NULL,
  
  -- Vencedor (NULL se ainda não finalizada)
  winner_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_match_serie UNIQUE (match_id, serie_number),
  CONSTRAINT valid_scores CHECK (player1_score >= 0 AND player2_score >= 0),
  CONSTRAINT valid_serie_number CHECK (serie_number > 0),
  CONSTRAINT winner_is_player CHECK (
    winner_player_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id 
      AND winner_player_id IN (m.player1_id, m.player2_id)
    )
  )
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índice para buscar séries de uma partida específica
CREATE INDEX idx_series_match ON series(match_id);

-- Índice para buscar séries por status
CREATE INDEX idx_series_status ON series(status);

-- Índice para buscar séries liberadas para apostas
CREATE INDEX idx_series_betting_enabled ON series(betting_enabled)
WHERE betting_enabled = true;

-- Índice composto para buscar próxima série disponível
CREATE INDEX idx_series_next_available ON series(match_id, serie_number)
WHERE status IN ('pendente', 'liberada');

-- Índice para buscar séries em andamento
CREATE INDEX idx_series_in_progress ON series(status)
WHERE status = 'em_andamento';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_series_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_series_updated_at ON series;
CREATE TRIGGER trigger_series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION update_series_updated_at();

-- Trigger: Setar started_at quando mudar para 'em_andamento'
CREATE OR REPLACE FUNCTION set_series_started_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'em_andamento' AND OLD.status != 'em_andamento' THEN
    NEW.started_at = TIMEZONE('utc'::text, NOW());
    -- MANTER apostas abertas durante o andamento (apostas ao vivo)
    -- Apenas registra quando começou, mas não trava
    -- NEW.betting_enabled permanece como está (não força false)
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_series_started_at ON series;
CREATE TRIGGER trigger_set_series_started_at
  BEFORE UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION set_series_started_at();

-- Trigger: Setar ended_at quando mudar para 'encerrada'
CREATE OR REPLACE FUNCTION set_series_ended_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'encerrada' AND OLD.status != 'encerrada' THEN
    NEW.ended_at = TIMEZONE('utc'::text, NOW());
    -- Garantir que apostas estão travadas
    NEW.betting_enabled = false;
    IF NEW.betting_locked_at IS NULL THEN
      NEW.betting_locked_at = TIMEZONE('utc'::text, NOW());
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_series_ended_at ON series;
CREATE TRIGGER trigger_set_series_ended_at
  BEFORE UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION set_series_ended_at();

-- Trigger: Validar vencedor quando série for encerrada
CREATE OR REPLACE FUNCTION validate_series_winner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'encerrada' THEN
    -- Vencedor deve estar definido
    IF NEW.winner_player_id IS NULL THEN
      RAISE EXCEPTION 'Série encerrada deve ter um vencedor definido';
    END IF;
    
    -- Vencedor deve ser um dos jogadores da partida
    IF NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = NEW.match_id 
      AND NEW.winner_player_id IN (m.player1_id, m.player2_id)
    ) THEN
      RAISE EXCEPTION 'Vencedor deve ser um dos jogadores da partida';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_series_winner ON series;
CREATE TRIGGER trigger_validate_series_winner
  BEFORE INSERT OR UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION validate_series_winner();

-- Trigger: Atualizar status da partida quando todas as séries terminarem
CREATE OR REPLACE FUNCTION update_match_status_on_series_end()
RETURNS TRIGGER AS $$
DECLARE
  total_series INTEGER;
  finished_series INTEGER;
BEGIN
  IF NEW.status = 'encerrada' THEN
    -- Contar total de séries e séries finalizadas
    SELECT 
      COUNT(*),
      COUNT(*) FILTER (WHERE status = 'encerrada')
    INTO total_series, finished_series
    FROM series
    WHERE match_id = NEW.match_id;
    
    -- Se todas as séries terminaram, finalizar a partida
    IF total_series = finished_series THEN
      UPDATE matches 
      SET status = 'finalizada'
      WHERE id = NEW.match_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_match_status ON series;
CREATE TRIGGER trigger_update_match_status
  AFTER UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION update_match_status_on_series_end();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- Política: TODOS podem VER séries
CREATE POLICY "Séries são visíveis para todos"
  ON series
  FOR SELECT
  USING (true);

-- Política: Apenas ADMINS e PARCEIROS podem CRIAR séries
CREATE POLICY "Admins e parceiros podem criar séries"
  ON series
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'parceiro')
    )
  );

-- Política: Apenas ADMINS e PARCEIROS (donos da partida) podem ATUALIZAR
CREATE POLICY "Admins e parceiros podem atualizar séries"
  ON series
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN matches m ON m.id = series.match_id
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'admin' OR 
        (u.role = 'parceiro' AND u.id = m.created_by)
      )
    )
  );

-- Política: Apenas ADMINS podem DELETAR séries
CREATE POLICY "Apenas admins podem deletar séries"
  ON series
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função: Criar séries automaticamente ao criar partida
CREATE OR REPLACE FUNCTION create_series_for_match(
  p_match_id UUID,
  p_total_series INTEGER DEFAULT 3
)
RETURNS VOID AS $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..p_total_series LOOP
    INSERT INTO series (match_id, serie_number, status)
    VALUES (p_match_id, i, 'pendente');
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função: Liberar série para apostas
CREATE OR REPLACE FUNCTION release_serie_for_betting(p_serie_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE series
  SET 
    status = 'liberada',
    betting_enabled = true
  WHERE id = p_serie_id
  AND status = 'pendente';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Série não encontrada ou não está pendente';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função: Iniciar série (apostas continuam liberadas - apostas ao vivo)
CREATE OR REPLACE FUNCTION start_serie(p_serie_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE series
  SET status = 'em_andamento'
  WHERE id = p_serie_id
  AND status = 'liberada';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Série não encontrada ou não está liberada';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função: Finalizar série com vencedor
CREATE OR REPLACE FUNCTION finish_serie(
  p_serie_id UUID,
  p_winner_player_id UUID,
  p_player1_score INTEGER,
  p_player2_score INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE series
  SET 
    status = 'encerrada',
    winner_player_id = p_winner_player_id,
    player1_score = p_player1_score,
    player2_score = p_player2_score
  WHERE id = p_serie_id
  AND status = 'em_andamento';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Série não encontrada ou não está em andamento';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS (Documentação)
-- =====================================================

COMMENT ON TABLE series IS 'Séries das partidas (subdivisões onde ocorrem as apostas)';
COMMENT ON COLUMN series.id IS 'Identificador único da série';
COMMENT ON COLUMN series.match_id IS 'ID da partida (CASCADE delete)';
COMMENT ON COLUMN series.serie_number IS 'Número da série (1, 2, 3...)';
COMMENT ON COLUMN series.status IS 'Status: pendente, liberada, em_andamento, encerrada, cancelada';
COMMENT ON COLUMN series.betting_enabled IS 'Indica se apostas estão liberadas';
COMMENT ON COLUMN series.betting_locked_at IS 'Quando apostas foram travadas';
COMMENT ON COLUMN series.started_at IS 'Quando a série iniciou';
COMMENT ON COLUMN series.ended_at IS 'Quando a série terminou';
COMMENT ON COLUMN series.player1_score IS 'Pontuação do jogador 1';
COMMENT ON COLUMN series.player2_score IS 'Pontuação do jogador 2';
COMMENT ON COLUMN series.winner_player_id IS 'ID do jogador vencedor';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'Tabela series criada com sucesso!' as status;
SELECT * FROM series;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================




