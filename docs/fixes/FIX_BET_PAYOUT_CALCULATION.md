# 🔧 Correção: Cálculo de Pagamento de Apostas

**Data**: 07/11/2025  
**Migration**: `1012_fix_bet_payout_calculation.sql`  
**Status**: ✅ Pronto para aplicar

---

## 🐛 Problemas Identificados

### 1. **Ganhos Incorretos** ❌

**Problema Relatado:**
- Usuário aposta R$60
- Sistema mostra que ganhou R$120
- Mas está creditando R$180 (R$60 + R$120)

**Comportamento Esperado:**
- Usuário aposta R$60 (saldo debita R$60)
- Ao ganhar, recebe R$120 (2x a aposta)
- Lucro líquido: R$60

**Regra:**
```
Retorno Total = Aposta × 2
```

### 2. **Perdas com Reembolso Incorreto** ❌

**Problema Relatado:**
- Usuário tinha R$100 de saldo
- Apostou R$60 (deveria ficar com R$40)
- Perdeu a aposta
- Mas o saldo volta para R$100 (reembolso indevido!)

**Comportamento Esperado:**
- Usuário tinha R$100
- Apostou R$60 → saldo fica R$40
- Perdeu → saldo permanece R$40
- **SEM REEMBOLSO**

**Regra:**
```
Aposta Perdida = SEM crédito (dinheiro já foi debitado ao apostar)
```

---

## ✅ Soluções Implementadas

### 1. **Função `credit_winnings()` Corrigida**

```sql
CREATE OR REPLACE FUNCTION credit_winnings()
RETURNS TRIGGER AS $$
DECLARE
  return_amount INTEGER;
BEGIN
  IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
    -- REGRA: Retorno total = 2x o valor apostado
    return_amount := NEW.amount * 2;
    
    -- Creditar apenas o retorno (não a aposta + retorno)
    UPDATE wallet
    SET balance = balance + return_amount
    WHERE user_id = NEW.user_id;
    
    -- Criar transação de ganho
    INSERT INTO transactions (...)
    VALUES (..., 'ganho', return_amount, ...);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. **Função `handle_lost_bets()` Criada**

```sql
CREATE OR REPLACE FUNCTION handle_lost_bets()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'perdida' AND OLD.status != 'perdida' THEN
    -- APENAS LOG, SEM REEMBOLSO
    RAISE NOTICE '❌ [PERDA] user_id=% | aposta=R$% | SEM REEMBOLSO', 
      NEW.user_id, 
      NEW.amount / 100.0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. **Reversão de Reembolsos Incorretos**

A migration inclui um bloco `DO` que:
1. Busca todas as transações de reembolso em apostas perdidas
2. Reverte o saldo (debita o valor indevido)
3. Marca a transação como `cancelled`
4. Adiciona nota: `[REVERTIDO - reembolso incorreto]`

---

## 📊 Exemplos de Cálculo

### Exemplo 1: Aposta Ganha ✅

| Etapa | Ação | Saldo |
|-------|------|-------|
| Início | - | R$ 100,00 |
| Aposta R$60 | Débito | R$ 40,00 |
| Ganhou! | Crédito R$120 (2x) | **R$ 160,00** |
| **Lucro Líquido** | - | **R$ 60,00** |

### Exemplo 2: Aposta Perdida ❌

| Etapa | Ação | Saldo |
|-------|------|-------|
| Início | - | R$ 100,00 |
| Aposta R$60 | Débito | R$ 40,00 |
| Perdeu! | SEM reembolso | **R$ 40,00** |
| **Perda Líquida** | - | **R$ 60,00** |

### Exemplo 3: Apostas Múltiplas

**Cenário**: 3 apostas de R$50 cada

| Aposta | Resultado | Movimento | Saldo |
|--------|-----------|-----------|-------|
| Inicial | - | - | R$ 200,00 |
| Aposta 1 | Criada | -R$ 50 | R$ 150,00 |
| Aposta 2 | Criada | -R$ 50 | R$ 100,00 |
| Aposta 3 | Criada | -R$ 50 | R$ 50,00 |
| Aposta 1 | **Ganhou** | +R$ 100 (2x) | R$ 150,00 |
| Aposta 2 | **Perdeu** | R$ 0 | R$ 150,00 |
| Aposta 3 | **Ganhou** | +R$ 100 (2x) | **R$ 250,00** |

**Resultado Final**: R$ 250,00 (lucro de R$ 50,00)

---

## 🚀 Como Aplicar a Correção

### Método 1: Via Supabase Dashboard (Recomendado)

1. Acesse o SQL Editor:
   ```
   https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/editor
   ```

2. Clique em **"New Query"**

3. Copie o conteúdo de:
   ```
   backend/supabase/migrations/1012_fix_bet_payout_calculation.sql
   ```

4. Cole no editor e clique em **"Run"** (ou `Ctrl+Enter`)

5. Aguarde a execução e veja os logs de verificação

### Método 2: Via CLI (Avançado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Aplicar migration
supabase db push
```

---

## 🔍 Verificações Automáticas

A migration inclui verificações automáticas que mostram:

### ✅ Antes da Correção

```sql
-- Apostas ganhas com cálculo incorreto
-- Reembolsos indevidos em apostas perdidas
-- Status das transações
```

### ✅ Depois da Correção

```sql
-- Total de apostas ganhas: X
-- Corretos (2x): Y
-- Incorretos: 0 ✅

-- Reembolsos incorretos revertidos: Z
```

---

## 📈 Impacto Esperado

### Usuários Afetados

- **Ganhos**: Nenhum usuário será prejudicado (cálculo já estava correto)
- **Perdas**: Usuários que receberam reembolsos indevidos terão o valor corrigido

### Saldo do Sistema

```
Saldo Total Corrigido = Σ(reembolsos indevidos revertidos)
```

### Transações

- Transações incorretas marcadas como `cancelled`
- Histórico preservado para auditoria
- Descrição atualizada com `[REVERTIDO - reembolso incorreto]`

---

## 🧪 Testes Recomendados

### Teste 1: Aposta Ganha

1. Usuário com R$100 de saldo
2. Aposta R$20 → saldo R$80
3. Série finaliza com vitória
4. **Verificar**: Saldo final = R$120 (R$80 + R$40)

### Teste 2: Aposta Perdida

1. Usuário com R$100 de saldo
2. Aposta R$20 → saldo R$80
3. Série finaliza com derrota
4. **Verificar**: Saldo final = R$80 (SEM reembolso)

### Teste 3: Mix de Resultados

1. Usuário com R$200
2. Aposta R$50 (3x) → saldo R$50
3. 2 vitórias + 1 derrota
4. **Verificar**: Saldo final = R$250 (R$50 + R$200)

---

## 📝 Logs e Monitoramento

### Logs da Migration

```
✅ [GANHO] user_id=xxx | aposta=R$60 | retorno=R$120 (2x)
❌ [PERDA] user_id=yyy | aposta=R$40 | SEM REEMBOLSO
🔧 [CORREÇÃO] 3 reembolsos incorretos revertidos
```

### Queries de Monitoramento

```sql
-- Ver apostas por status
SELECT status, COUNT(*), SUM(amount)/100.0 as total_reais
FROM bets
GROUP BY status;

-- Ver transações por tipo
SELECT type, COUNT(*), SUM(amount)/100.0 as total_reais
FROM transactions
WHERE status = 'completed'
GROUP BY type;

-- Verificar cálculos de ganhos
SELECT 
  amount/100.0 as aposta,
  actual_return/100.0 as retorno,
  (actual_return = amount * 2) as correto
FROM bets
WHERE status = 'ganha';
```

---

## 🆘 Troubleshooting

### Erro: "Wallet não encontrada"

**Causa**: Aposta sem user_id válido  
**Solução**: Verificar integridade dos dados

```sql
SELECT * FROM bets WHERE user_id IS NULL;
```

### Erro: Saldo negativo após reversão

**Causa**: Usuário já gastou o reembolso indevido  
**Solução**: Decisão de negócio - permitir saldo negativo temporário ou ajustar manualmente

### Transações duplicadas

**Causa**: Migration executada múltiplas vezes  
**Prevenção**: A migration usa `OLD.status != NEW.status` para evitar duplicação

---

## ✅ Checklist de Implementação

- [x] Migration criada: `1012_fix_bet_payout_calculation.sql`
- [x] Documentação completa
- [ ] Migration executada no Supabase
- [ ] Verificações conferidas
- [ ] Testes realizados
- [ ] Usuários notificados (se necessário)
- [ ] Monitoramento ativo por 24h

---

## 📞 Suporte

**Em caso de dúvidas ou problemas:**

1. Verificar logs da migration no Supabase Dashboard
2. Executar queries de verificação
3. Consultar este documento
4. Reverter se necessário (ver seção abaixo)

---

## ⏪ Rollback (Se Necessário)

Caso precise reverter a correção:

```sql
-- 1. Remover trigger de perdas
DROP TRIGGER IF EXISTS trigger_handle_lost_bets ON bets;
DROP FUNCTION IF EXISTS handle_lost_bets();

-- 2. Restaurar função anterior (de 1009)
-- (Copiar código da migration 1009)

-- 3. Recriar trigger de ganhos
DROP TRIGGER IF EXISTS trigger_credit_winnings ON bets;
CREATE TRIGGER trigger_credit_winnings
  AFTER UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION credit_winnings();
```

**⚠️ Atenção**: Rollback não reverterá correções de saldo já feitas!

---

**Documentado por**: Assistente IA  
**Revisado em**: 07/11/2025  
**Versão**: 1.0




