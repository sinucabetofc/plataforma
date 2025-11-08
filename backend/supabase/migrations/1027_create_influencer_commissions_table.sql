-- ============================================================
-- Migration: Create Influencer Commissions Table
-- Descrição: Registra comissões calculadas para influencers
-- Data: 08/11/2025
-- ============================================================

-- Criar tabela influencer_commissions
CREATE TABLE IF NOT EXISTS influencer_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID NOT NULL,
    match_id UUID NOT NULL,
    commission_percentage DECIMAL(5, 2) NOT NULL,
    total_bets DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    house_profit DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    commission_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_commission_influencer FOREIGN KEY (influencer_id)
        REFERENCES influencers(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_commission_match FOREIGN KEY (match_id)
        REFERENCES matches(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT commission_amount_non_negative CHECK (commission_amount >= 0),
    CONSTRAINT house_profit_check CHECK (house_profit >= 0),
    CONSTRAINT total_bets_positive CHECK (total_bets >= 0),
    CONSTRAINT unique_commission_per_match UNIQUE (influencer_id, match_id)
);

-- Índices para performance
CREATE INDEX idx_commissions_influencer_id ON influencer_commissions(influencer_id);
CREATE INDEX idx_commissions_match_id ON influencer_commissions(match_id);
CREATE INDEX idx_commissions_status ON influencer_commissions(status);
CREATE INDEX idx_commissions_calculated_at ON influencer_commissions(calculated_at DESC);

-- Trigger para updated_at
CREATE TRIGGER trigger_commissions_updated_at
    BEFORE UPDATE ON influencer_commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE influencer_commissions IS 'Comissões calculadas e pagas aos influencers';
COMMENT ON COLUMN influencer_commissions.house_profit IS 'Lucro da casa no jogo (perdas - ganhos)';
COMMENT ON COLUMN influencer_commissions.commission_amount IS 'Valor da comissão calculada';
COMMENT ON COLUMN influencer_commissions.status IS 'Status: pending, paid, cancelled';

-- RLS Policies
ALTER TABLE influencer_commissions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins can manage commissions" ON influencer_commissions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Policy: Influencers podem ver suas próprias comissões
CREATE POLICY "Influencers can view their commissions" ON influencer_commissions
    FOR SELECT
    USING (influencer_id = auth.uid());

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================

