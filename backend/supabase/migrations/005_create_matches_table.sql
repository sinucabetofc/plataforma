-- =====================================================
-- Migration: 005_create_matches_table
-- Description: Tabela de partidas de sinuca
-- Created: 2025-11-05
-- =====================================================

-- =====================================================
-- TIPOS ENUM
-- =====================================================

-- Modalidade esportiva
CREATE TYPE match_sport AS ENUM ('sinuca', 'futebol');

-- Status da partida
CREATE TYPE match_status AS ENUM ('agendada', 'em_andamento', 'finalizada', 'cancelada');

-- =====================================================
-- TABELA MATCHES
-- =====================================================

CREATE TABLE IF NOT EXISTS matches (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados básicos
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(100) DEFAULT 'Brasil' NOT NULL,
  sport match_sport DEFAULT 'sinuca' NOT NULL,
  status match_status DEFAULT 'agendada' NOT NULL,
  
  -- Transmissão ao vivo
  youtube_url TEXT,
  stream_active BOOLEAN DEFAULT false NOT NULL,
  
  -- Jogadores/Times (FK para players)
  player1_id UUID REFERENCES players(id) ON DELETE RESTRICT NOT NULL,
  player2_id UUID REFERENCES players(id) ON DELETE RESTRICT NOT NULL,
  
  -- Regras do jogo (armazenadas como JSON)
  game_rules JSONB DEFAULT '{}' NOT NULL,
  /*
  Exemplo de game_rules:
  {
    "game_type": "JOGO DE BOLA NUMERADA",
    "rules": [
      "90 ESTOURA CONTINUA E TEM 1 BOLA MENOR",
      "APOSTA POR SERIE"
    ],
    "bet_type": "APOSTA POR SERIE",
    "serie_type": "BOLA CANTADA",
    "total_series": 3
  }
  */
  
  -- Gestão e Influencer (conforme decisões do MVP)
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  influencer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  influencer_commission DECIMAL(5,2) DEFAULT 0.00,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT different_players CHECK (player1_id != player2_id),
  CONSTRAINT valid_commission CHECK (influencer_commission >= 0 AND influencer_commission <= 100)
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índice para buscar partidas por status
CREATE INDEX idx_matches_status ON matches(status);

-- Índice para buscar partidas agendadas (mais usado)
CREATE INDEX idx_matches_scheduled ON matches(scheduled_at)
WHERE status = 'agendada';

-- Índice para buscar partidas por modalidade
CREATE INDEX idx_matches_sport ON matches(sport);

-- Índice para buscar partidas de um jogador específico
CREATE INDEX idx_matches_player1 ON matches(player1_id);
CREATE INDEX idx_matches_player2 ON matches(player2_id);

-- Índice para buscar partidas criadas por um parceiro
CREATE INDEX idx_matches_created_by ON matches(created_by)
WHERE created_by IS NOT NULL;

-- Índice para buscar partidas de um influencer
CREATE INDEX idx_matches_influencer ON matches(influencer_id)
WHERE influencer_id IS NOT NULL;

-- Índice composto para filtrar partidas (comum no dashboard)
CREATE INDEX idx_matches_sport_status_date ON matches(sport, status, scheduled_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_matches_updated_at ON matches;
CREATE TRIGGER trigger_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();

-- Trigger: Validar que influencer tem role correto
CREATE OR REPLACE FUNCTION validate_matches_influencer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.influencer_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM users 
      WHERE id = NEW.influencer_id 
      AND role = 'influencer'
    ) THEN
      RAISE EXCEPTION 'Influencer deve ter role = influencer';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_matches_influencer ON matches;
CREATE TRIGGER trigger_validate_matches_influencer
  BEFORE INSERT OR UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION validate_matches_influencer();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Política: TODOS podem VER partidas
CREATE POLICY "Partidas são visíveis para todos"
  ON matches
  FOR SELECT
  USING (true);

-- Política: Apenas ADMINS e PARCEIROS podem CRIAR partidas
CREATE POLICY "Admins e parceiros podem criar partidas"
  ON matches
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'parceiro')
    )
  );

-- Política: ADMINS podem atualizar qualquer partida, PARCEIROS apenas as suas
CREATE POLICY "Admins e parceiros podem atualizar partidas"
  ON matches
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR 
        (role = 'parceiro' AND id = matches.created_by)
      )
    )
  );

-- Política: Apenas ADMINS podem DELETAR partidas
CREATE POLICY "Apenas admins podem deletar partidas"
  ON matches
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- COMENTÁRIOS (Documentação)
-- =====================================================

COMMENT ON TABLE matches IS 'Partidas de sinuca agendadas na plataforma';
COMMENT ON COLUMN matches.id IS 'Identificador único da partida';
COMMENT ON COLUMN matches.scheduled_at IS 'Data e hora agendada para a partida';
COMMENT ON COLUMN matches.location IS 'Localização da partida (padrão: Brasil)';
COMMENT ON COLUMN matches.sport IS 'Modalidade: sinuca ou futebol';
COMMENT ON COLUMN matches.status IS 'Status: agendada, em_andamento, finalizada, cancelada';
COMMENT ON COLUMN matches.youtube_url IS 'URL da transmissão ao vivo no YouTube';
COMMENT ON COLUMN matches.stream_active IS 'Indica se a transmissão está ativa';
COMMENT ON COLUMN matches.player1_id IS 'ID do primeiro jogador';
COMMENT ON COLUMN matches.player2_id IS 'ID do segundo jogador';
COMMENT ON COLUMN matches.game_rules IS 'Regras do jogo em formato JSON';
COMMENT ON COLUMN matches.created_by IS 'ID do admin ou parceiro que criou a partida';
COMMENT ON COLUMN matches.influencer_id IS 'ID do influencer transmitindo a partida';
COMMENT ON COLUMN matches.influencer_commission IS 'Porcentagem de comissão do influencer (0-100)';
COMMENT ON COLUMN matches.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN matches.updated_at IS 'Data da última atualização';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se a tabela foi criada
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'matches'
  ) INTO table_exists;
  
  IF table_exists THEN
    RAISE NOTICE '✅ Tabela matches criada com sucesso!';
  ELSE
    RAISE EXCEPTION '❌ Erro: Tabela matches não foi criada!';
  END IF;
END $$;

-- Exibir estrutura da tabela
SELECT 
  column_name, 
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'matches'
ORDER BY ordinal_position;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================




