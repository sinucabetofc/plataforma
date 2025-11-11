# 🧪 Guia de Testes - Matching Fracionado

## 📋 Pré-requisitos

✅ Migrations aplicadas:
- 1040_drop_and_recreate_matching.sql
- 1041_fix_matching_index.sql
- 1042_fix_partial_bet_payout.sql

---

## 🧪 TESTE 1: Verificar Estrutura

Execute no SQL Editor:

```sql
-- Verificar colunas
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bets' 
AND column_name IN ('matched_amount', 'remaining_amount');

-- Deve retornar 2 linhas ✅
```

---

## 🧪 TESTE 2: Verificar Apostas Parciais Atuais

Execute: `TEST_PARTIAL_BETS.sql` - Seção 1

```sql
-- Ver apostas parcialmente casadas
SELECT * FROM bets 
WHERE matched_amount > 0 
  AND matched_amount < amount;
```

**Resultado esperado:**
```
c53d2aae-f2ec-4ec1-a53c-70727e4aba0d
R$ 20 apostados
R$ 10 casados (50%)
R$ 10 pendentes
```

---

## 🧪 TESTE 3: Criar Cenário de Matching Fracionado

### **Via Interface (Recomendado):**

**Passo 1:** Criar 2 usuários de teste
- User A: vinitest1@test.com
- User B: vinitest2@test.com

**Passo 2:** Liberar uma série para apostas

**Passo 3:** User A aposta R$ 20 no Jogador A
```
POST /api/bets
{
  "serie_id": "...",
  "chosen_player_id": "jogador-a-id",
  "amount": 2000
}

Resultado esperado:
{
  "bet": {
    "matched_amount": 0,
    "remaining_amount": 2000,
    "status": "pendente"
  }
}
```

**Passo 4:** User B aposta R$ 10 no Jogador B
```
POST /api/bets
{
  "serie_id": "...",
  "chosen_player_id": "jogador-b-id",
  "amount": 1000
}

Resultado esperado:
{
  "bet": {
    "matched_amount": 1000,
    "remaining_amount": 0,
    "status": "aceita"
  },
  "matching": {
    "success": true,
    "total_matches": 1,
    "message": "Aposta totalmente casada com 1 aposta(s)!"
  }
}

User A atualiza para:
{
  "matched_amount": 1000,
  "remaining_amount": 1000,
  "status": "parcialmente_aceita"  // 🔄 50%
}
```

---

## 🧪 TESTE 4: Finalizar Série (Jogador A Ganha)

Via Admin Panel:
1. Finalizar série
2. Definir vencedor = Jogador A

**Resultado esperado para User A:**
```sql
-- User A (GANHOU com 50% casado)
Apostou: R$ 20
Casado: R$ 10
Não casado: R$ 10

Cálculo:
- Ganho: R$ 10 × 2 = R$ 20
- Reembolso: R$ 10
- Total: R$ 30 ✅

Verificar:
SELECT 
    actual_return / 100.0 as recebeu,
    (matched_amount * 2 + remaining_amount) / 100.0 as deveria
FROM bets WHERE id = 'user-a-bet-id';

Deve retornar: recebeu = 30.00, deveria = 30.00
```

**Resultado esperado para User B:**
```sql
-- User B (PERDEU com 100% casado)
Apostou: R$ 10
Casado: R$ 10
Não casado: R$ 0

Cálculo:
- Perde: R$ 10
- Reembolso: R$ 0
- Total: R$ 0 ❌

Verificar:
SELECT actual_return FROM bets WHERE id = 'user-b-bet-id';

Deve retornar: 0 ou NULL
```

---

## 🧪 TESTE 5: Finalizar Série (Jogador B Ganha)

Repetir teste anterior, mas:
- Definir vencedor = Jogador B

**Resultado esperado:**

**User A (PERDEU com 50% casado):**
```
Apostou: R$ 20
Casado: R$ 10
Não casado: R$ 10

- Perde: R$ 10
- Reembolso: R$ 10
- Total recebe: R$ 10 ✅
```

**User B (GANHOU com 100% casado):**
```
Apostou: R$ 10
Casado: R$ 10

- Ganho: R$ 10 × 2 = R$ 20
- Total recebe: R$ 20 ✅
```

---

## 🧪 TESTE 6: Validar com SQL

Execute `TEST_PARTIAL_BETS.sql` - Seção 6:

```sql
-- Ver se fórmulas estão corretas
SELECT 
    status,
    apostou,
    casado,
    nao_casado,
    recebeu,
    deveria_receber,
    correto  -- TRUE se está correto
FROM ...
```

---

## 🧪 TESTE 7: Ver Transações

```sql
SELECT 
    type,
    amount / 100.0 as valor,
    description,
    metadata
FROM transactions
WHERE bet_id = 'bet-id-aqui'
ORDER BY created_at DESC;
```

**Deve conter:**
- 1x `aposta` (débito)
- 1x `ganho` OU `reembolso` (crédito)
- Metadata com detalhes do cálculo

---

## ✅ Checklist de Validação

Execute cada item e marque:

- [ ] **1.** Colunas matched_amount e remaining_amount existem
- [ ] **2.** Aposta parcial aparece com status "parcialmente_aceita" (laranja 🔄)
- [ ] **3.** Barra de progresso mostra 50%
- [ ] **4.** Ao finalizar série com ganho: recebe (matched * 2) + remaining
- [ ] **5.** Ao finalizar série com perda: recebe apenas remaining
- [ ] **6.** Transações criadas com metadata correto
- [ ] **7.** Saldo da wallet está correto
- [ ] **8.** UI mostra valores corretos no frontend
- [ ] **9.** Apostas antigas corrigidas automaticamente
- [ ] **10.** Logs detalhados aparecem no console

---

## 🎯 Cenários Práticos

### **Cenário A: 50% Casado + Ganhou**
```
Aposta: R$ 20
Casado: R$ 10 (50%)

Finaliza com VITÓRIA:
→ R$ 10 × 2 = R$ 20 (ganho)
→ R$ 10 (reembolso)
→ Total: R$ 30 ✅
```

### **Cenário B: 50% Casado + Perdeu**
```
Aposta: R$ 20
Casado: R$ 10 (50%)

Finaliza com DERROTA:
→ R$ 10 perdido
→ R$ 10 (reembolso)
→ Total: R$ 10 ✅
```

### **Cenário C: 100% Casado + Ganhou**
```
Aposta: R$ 20
Casado: R$ 20 (100%)

Finaliza com VITÓRIA:
→ R$ 20 × 2 = R$ 40
→ R$ 0 (reembolso)
→ Total: R$ 40 ✅
```

### **Cenário D: 100% Casado + Perdeu**
```
Aposta: R$ 20
Casado: R$ 20 (100%)

Finaliza com DERROTA:
→ R$ 20 perdido
→ R$ 0 (reembolso)
→ Total: R$ 0 ❌
```

---

## 🔍 Como Debugar

Se algo não funcionar:

```sql
-- 1. Ver triggers ativos
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'bets'::regclass;

-- Deve ter:
-- trigger_calculate_remaining_amount
-- trigger_update_bet_status
-- trigger_credit_winnings

-- 2. Ver logs de uma aposta
SELECT * FROM debug_serie_matching('serie-id');

-- 3. Ver se remaining_amount está sendo calculado
SELECT 
    id,
    amount,
    matched_amount,
    remaining_amount,
    amount - matched_amount as deveria_ser
FROM bets
WHERE matched_amount > 0;
```

---

## 📝 Notas Importantes

1. **Reembolso Automático:** O valor não casado sempre volta
2. **Ganho Justo:** Paga 2x apenas o que foi casado
3. **Transações Detalhadas:** Metadata tem todos os cálculos
4. **Correção Retroativa:** A migration corrige apostas antigas automaticamente

---

## 🚀 Pronto para Produção

Se todos os testes passarem, o sistema está pronto! ✅

