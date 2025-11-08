-- ============================================================
-- Migration: Create Influencers Table
-- Descrição: Tabela para gerenciar influencers/parceiros
-- Data: 08/11/2025
-- ============================================================

-- Criar tabela influencers
-- Criar ENUM para tipo de chave PIX (se não existir)
DO $$ BEGIN
    CREATE TYPE pix_type_enum AS ENUM ('cpf', 'email', 'phone', 'random');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    photo_url VARCHAR(500),
    social_media JSONB DEFAULT '{}',
    pix_key VARCHAR(255) NOT NULL,
    pix_type pix_type_enum DEFAULT 'random',
    commission_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT email_format_influencer CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT phone_format_influencer CHECK (phone ~ '^\+?[0-9]{10,15}$'),
    CONSTRAINT commission_range CHECK (commission_percentage >= 0 AND commission_percentage <= 100)
);

-- Índices para performance
CREATE INDEX idx_influencers_email ON influencers(email);
CREATE INDEX idx_influencers_is_active ON influencers(is_active);
CREATE INDEX idx_influencers_created_at ON influencers(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER trigger_influencers_updated_at
    BEFORE UPDATE ON influencers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE influencers IS 'Influencers/Parceiros que transmitem jogos e recebem comissões';
COMMENT ON COLUMN influencers.commission_percentage IS 'Percentual de comissão sobre o lucro da casa (0-100%)';
COMMENT ON COLUMN influencers.social_media IS 'JSON com redes sociais: {instagram, youtube, twitch, etc}';
COMMENT ON COLUMN influencers.pix_key IS 'Chave PIX para recebimento de comissões';
COMMENT ON COLUMN influencers.pix_type IS 'Tipo da chave PIX: cpf, email, phone ou random';

-- RLS Policies
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins can manage influencers" ON influencers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Policy: Influencers podem ver apenas seus próprios dados
CREATE POLICY "Influencers can view their own data" ON influencers
    FOR SELECT
    USING (id = auth.uid());

-- Policy: Influencers podem atualizar apenas seus próprios dados (exceto senha e comissão)
CREATE POLICY "Influencers can update their own data" ON influencers
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================

