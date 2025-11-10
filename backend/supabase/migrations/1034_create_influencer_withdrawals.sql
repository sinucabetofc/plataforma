-- ============================================================
-- Migration: Create Influencer Withdrawals Table
-- Descrição: Tabela para gerenciar solicitações de saque dos parceiros
-- Data: 10/11/2025
-- ============================================================

-- Criar ENUM para status de saque
DO $$ BEGIN
    CREATE TYPE withdrawal_status_enum AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de saques de influencers
CREATE TABLE IF NOT EXISTS influencer_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    
    -- Dados PIX (copiados no momento da solicitação)
    pix_key VARCHAR(255) NOT NULL,
    pix_type pix_type_enum NOT NULL,
    
    -- Status e controle
    status withdrawal_status_enum DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- Metadados
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT positive_amount CHECK (amount > 0),
    CONSTRAINT valid_status_dates CHECK (
        (status = 'approved' AND approved_at IS NOT NULL) OR
        (status = 'rejected' AND rejected_at IS NOT NULL) OR
        (status IN ('pending', 'cancelled'))
    )
);

-- Índices para performance
CREATE INDEX idx_influencer_withdrawals_influencer ON influencer_withdrawals(influencer_id);
CREATE INDEX idx_influencer_withdrawals_status ON influencer_withdrawals(status);
CREATE INDEX idx_influencer_withdrawals_requested_at ON influencer_withdrawals(requested_at DESC);
CREATE INDEX idx_influencer_withdrawals_amount ON influencer_withdrawals(amount DESC);

-- Trigger para updated_at
CREATE TRIGGER trigger_influencer_withdrawals_updated_at
    BEFORE UPDATE ON influencer_withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE influencer_withdrawals IS 'Solicitações de saque dos parceiros/influencers';
COMMENT ON COLUMN influencer_withdrawals.amount IS 'Valor solicitado para saque';
COMMENT ON COLUMN influencer_withdrawals.pix_key IS 'Chave PIX copiada do perfil do influencer no momento da solicitação';
COMMENT ON COLUMN influencer_withdrawals.status IS 'Status: pending (aguardando), approved (pago), rejected (recusado), cancelled (cancelado)';
COMMENT ON COLUMN influencer_withdrawals.approved_by IS 'Admin que aprovou o saque';
COMMENT ON COLUMN influencer_withdrawals.rejected_by IS 'Admin que rejeitou o saque';

-- ============================================================
-- RLS Policies
-- ============================================================

-- Habilitar RLS
ALTER TABLE influencer_withdrawals ENABLE ROW LEVEL SECURITY;

-- Policy: Influencers podem ver apenas seus próprios saques
CREATE POLICY "influencer_withdrawals_select_own"
    ON influencer_withdrawals
    FOR SELECT
    TO authenticated
    USING (
        influencer_id IN (
            SELECT id FROM influencers WHERE id = auth.uid()
        )
    );

-- Policy: Influencers podem criar saques para si mesmos
CREATE POLICY "influencer_withdrawals_insert_own"
    ON influencer_withdrawals
    FOR INSERT
    TO authenticated
    WITH CHECK (
        influencer_id IN (
            SELECT id FROM influencers WHERE id = auth.uid()
        )
    );

-- Policy: Influencers podem cancelar seus próprios saques pendentes
CREATE POLICY "influencer_withdrawals_update_cancel_own"
    ON influencer_withdrawals
    FOR UPDATE
    TO authenticated
    USING (
        influencer_id IN (
            SELECT id FROM influencers WHERE id = auth.uid()
        )
        AND status = 'pending'
    )
    WITH CHECK (
        status = 'cancelled'
    );

-- Policy: Admins podem ver todos os saques
CREATE POLICY "influencer_withdrawals_select_admin"
    ON influencer_withdrawals
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Policy: Admins podem aprovar/rejeitar saques
CREATE POLICY "influencer_withdrawals_update_admin"
    ON influencer_withdrawals
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ============================================================
-- Function: Validar saldo antes de criar saque
-- ============================================================

CREATE OR REPLACE FUNCTION validate_influencer_balance_before_withdrawal()
RETURNS TRIGGER AS $$
DECLARE
    v_available_balance DECIMAL(10, 2);
    v_pending_withdrawals DECIMAL(10, 2);
BEGIN
    -- Buscar saldo disponível do influencer
    SELECT COALESCE(balance, 0)
    INTO v_available_balance
    FROM influencer_commissions
    WHERE influencer_id = NEW.influencer_id;
    
    -- Se não existe registro de comissões, saldo é zero
    IF v_available_balance IS NULL THEN
        v_available_balance := 0;
    END IF;
    
    -- Buscar total de saques pendentes
    SELECT COALESCE(SUM(amount), 0)
    INTO v_pending_withdrawals
    FROM influencer_withdrawals
    WHERE influencer_id = NEW.influencer_id
    AND status = 'pending';
    
    -- Validar se há saldo suficiente
    IF (v_available_balance - v_pending_withdrawals) < NEW.amount THEN
        RAISE EXCEPTION 'Saldo insuficiente. Disponível: R$ %, Solicitado: R$ %', 
            (v_available_balance - v_pending_withdrawals), NEW.amount;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar saldo antes de criar saque
CREATE TRIGGER trigger_validate_withdrawal_balance
    BEFORE INSERT ON influencer_withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION validate_influencer_balance_before_withdrawal();

-- ============================================================
-- Function: Atualizar saldo do influencer após aprovação
-- ============================================================

CREATE OR REPLACE FUNCTION update_influencer_balance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Só executar se o status mudou para 'approved'
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Deduzir o valor do saldo do influencer
        UPDATE influencer_commissions
        SET 
            balance = balance - NEW.amount,
            total_withdrawn = total_withdrawn + NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE influencer_id = NEW.influencer_id;
        
        -- Registrar data de aprovação
        NEW.approved_at := CURRENT_TIMESTAMP;
    END IF;
    
    -- Se foi rejeitado, registrar data
    IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
        NEW.rejected_at := CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar saldo após aprovação
CREATE TRIGGER trigger_update_balance_on_approval
    BEFORE UPDATE ON influencer_withdrawals
    FOR EACH ROW
    WHEN (NEW.status IS DISTINCT FROM OLD.status)
    EXECUTE FUNCTION update_influencer_balance_on_approval();

-- ============================================================
-- Dados de exemplo (opcional - remover em produção)
-- ============================================================

-- COMMENT: Descomentar apenas para testes
-- INSERT INTO influencer_withdrawals (influencer_id, amount, pix_key, pix_type, status)
-- SELECT 
--     id,
--     100.00,
--     pix_key,
--     pix_type,
--     'pending'
-- FROM influencers
-- LIMIT 1;

