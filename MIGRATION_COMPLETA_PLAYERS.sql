-- =====================================================
-- MIGRATION COMPLETA: Role + Players
-- Execute este arquivo completo de uma vez
-- =====================================================

-- =====================================================
-- PARTE 1: Adicionar Role aos Users
-- =====================================================

-- Criar tipo ENUM para roles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('apostador', 'admin', 'parceiro', 'influencer');
  END IF;
END $$;

-- Adicionar coluna role
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN role user_role DEFAULT 'apostador' NOT NULL;
    
    CREATE INDEX idx_users_role ON users(role);
    
    COMMENT ON COLUMN users.role IS 'Tipo de usuário: apostador, admin, parceiro ou influencer';
  END IF;
END $$;

-- =====================================================
-- PARTE 2: Tornar primeiro usuário ADMIN
-- =====================================================

-- DESCOMENTE a linha abaixo para tornar o primeiro usuário admin automaticamente
-- UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

-- OU defina manualmente (RECOMENDADO):
-- UPDATE users SET role = 'admin' WHERE email = 'tavaresambroziovinicius@gmail.com';

-- =====================================================
-- PARTE 3: Criar Tabela Players
-- =====================================================

CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50),
  photo_url TEXT,
  bio TEXT,
  active BOOLEAN DEFAULT true NOT NULL,
  total_matches INTEGER DEFAULT 0 NOT NULL,
  total_wins INTEGER DEFAULT 0 NOT NULL,
  total_losses INTEGER DEFAULT 0 NOT NULL,
  win_rate DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_players_active ON players(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_players_name ON players(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_players_nickname ON players(LOWER(nickname)) WHERE nickname IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_win_rate ON players(win_rate DESC);

-- Triggers
CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_players_updated_at ON players;
CREATE TRIGGER trigger_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_players_updated_at();

CREATE OR REPLACE FUNCTION calculate_players_win_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_matches > 0 THEN
    NEW.win_rate = ROUND((NEW.total_wins::DECIMAL / NEW.total_matches::DECIMAL) * 100, 2);
  ELSE
    NEW.win_rate = 0.00;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_players_win_rate ON players;
CREATE TRIGGER trigger_calculate_players_win_rate
  BEFORE INSERT OR UPDATE OF total_matches, total_wins ON players
  FOR EACH ROW
  EXECUTE FUNCTION calculate_players_win_rate();

-- RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players ativos são visíveis para todos" ON players;
CREATE POLICY "Players ativos são visíveis para todos"
  ON players FOR SELECT
  USING (active = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Apenas admins podem criar players" ON players;
CREATE POLICY "Apenas admins podem criar players"
  ON players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'parceiro')
    )
  );

DROP POLICY IF EXISTS "Apenas admins podem atualizar players" ON players;
CREATE POLICY "Apenas admins podem atualizar players"
  ON players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'parceiro')
    )
  );

DROP POLICY IF EXISTS "Apenas admins podem deletar players" ON players;
CREATE POLICY "Apenas admins podem deletar players"
  ON players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Comentários
COMMENT ON TABLE players IS 'Jogadores de sinuca cadastrados na plataforma';
COMMENT ON COLUMN players.id IS 'Identificador único do jogador';
COMMENT ON COLUMN players.name IS 'Nome completo do jogador';
COMMENT ON COLUMN players.nickname IS 'Apelido do jogador';
COMMENT ON COLUMN players.photo_url IS 'URL da foto do jogador';
COMMENT ON COLUMN players.bio IS 'Biografia do jogador';
COMMENT ON COLUMN players.active IS 'Jogador ativo (false = soft delete)';
COMMENT ON COLUMN players.total_matches IS 'Total de partidas jogadas';
COMMENT ON COLUMN players.total_wins IS 'Total de vitórias';
COMMENT ON COLUMN players.total_losses IS 'Total de derrotas';
COMMENT ON COLUMN players.win_rate IS 'Taxa de vitória (%) - calculada automaticamente';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se tudo foi criado
SELECT 
  'ROLE adicionado' as status,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE role = 'admin') as admins
FROM users
UNION ALL
SELECT 
  'Tabela PLAYERS criada' as status,
  COUNT(*) as total,
  0
FROM players;

-- =====================================================
-- FIM - Migration aplicada com sucesso! ✅
-- =====================================================



