-- =====================================================
-- Migration: 004_create_players_table
-- Description: Tabela de jogadores de sinuca
-- Created: 2025-11-05
-- =====================================================

-- Criar tabela players
CREATE TABLE IF NOT EXISTS players (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados básicos
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50),
  photo_url TEXT,
  bio TEXT,
  active BOOLEAN DEFAULT true NOT NULL,
  
  -- Estatísticas (atualizadas após cada partida)
  total_matches INTEGER DEFAULT 0 NOT NULL,
  total_wins INTEGER DEFAULT 0 NOT NULL,
  total_losses INTEGER DEFAULT 0 NOT NULL,
  win_rate DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índice para filtrar jogadores ativos
CREATE INDEX idx_players_active ON players(active)
WHERE active = true;

-- Índice para busca por nome (case-insensitive)
CREATE INDEX idx_players_name ON players(LOWER(name));

-- Índice para busca por apelido
CREATE INDEX idx_players_nickname ON players(LOWER(nickname))
WHERE nickname IS NOT NULL;

-- Índice para ordenação por win_rate
CREATE INDEX idx_players_win_rate ON players(win_rate DESC);

-- =====================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_players_updated_at();

-- =====================================================
-- TRIGGER: Calcular win_rate automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_players_win_rate()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular win_rate apenas se houver partidas
  IF NEW.total_matches > 0 THEN
    NEW.win_rate = ROUND((NEW.total_wins::DECIMAL / NEW.total_matches::DECIMAL) * 100, 2);
  ELSE
    NEW.win_rate = 0.00;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_players_win_rate
  BEFORE INSERT OR UPDATE OF total_matches, total_wins ON players
  FOR EACH ROW
  EXECUTE FUNCTION calculate_players_win_rate();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem VER jogadores ativos
CREATE POLICY "Players ativos são visíveis para todos"
  ON players
  FOR SELECT
  USING (active = true OR auth.uid() IS NOT NULL);

-- Política: Apenas ADMINS podem CRIAR jogadores
CREATE POLICY "Apenas admins podem criar players"
  ON players
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'parceiro')
    )
  );

-- Política: Apenas ADMINS podem ATUALIZAR jogadores
CREATE POLICY "Apenas admins podem atualizar players"
  ON players
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'parceiro')
    )
  );

-- Política: Apenas ADMINS podem DELETAR jogadores (soft delete via active=false)
CREATE POLICY "Apenas admins podem deletar players"
  ON players
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

COMMENT ON TABLE players IS 'Jogadores de sinuca cadastrados na plataforma';
COMMENT ON COLUMN players.id IS 'Identificador único do jogador';
COMMENT ON COLUMN players.name IS 'Nome completo do jogador';
COMMENT ON COLUMN players.nickname IS 'Apelido do jogador (ex: "Baianinho de Mauá")';
COMMENT ON COLUMN players.photo_url IS 'URL da foto do jogador (Supabase Storage)';
COMMENT ON COLUMN players.bio IS 'Biografia do jogador';
COMMENT ON COLUMN players.active IS 'Jogador ativo (false = soft delete)';
COMMENT ON COLUMN players.total_matches IS 'Total de partidas jogadas';
COMMENT ON COLUMN players.total_wins IS 'Total de vitórias';
COMMENT ON COLUMN players.total_losses IS 'Total de derrotas';
COMMENT ON COLUMN players.win_rate IS 'Taxa de vitória (%) - calculada automaticamente';
COMMENT ON COLUMN players.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN players.updated_at IS 'Data da última atualização';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================





