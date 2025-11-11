# 🎲 Fluxo de Apostas - Versão Corrigida

**Data**: 07/11/2025  
**Status**: ✅ Implementado na Migration 1012

---

## 📊 Diagrama do Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO FAZ APOSTA                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │ Saldo: R$ 100   │
            │ Aposta: R$ 60   │
            └────────┬────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ DÉBITO IMEDIATO        │
        │ Balance: 100 - 60 = 40 │
        │ Status: 'aceita'       │
        └────────┬───────────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ SÉRIE FINALIZA        │
     │ Winner definido       │
     └────┬─────────────┬────┘
          │             │
    ┌─────▼─────┐  ┌───▼──────┐
    │  GANHOU   │  │  PERDEU  │
    └─────┬─────┘  └────┬─────┘
          │             │
          │             ▼
          │    ┌─────────────────┐
          │    │ SEM REEMBOLSO!  │
          │    │ Saldo: R$ 40    │
          │    │ (permanece)     │
          │    └─────────────────┘
          │
          ▼
  ┌──────────────────┐
  │ CRÉDITO 2x       │
  │ Return: 60 × 2   │
  │      = R$ 120    │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ Saldo Final      │
  │ 40 + 120 = R$160 │
  │ Lucro: R$ 60     │
  └──────────────────┘
```

---

## 🔄 Ciclo de Vida de uma Aposta

### Estado 1: Criação
```
Trigger: INSERT na tabela 'bets'
Função: validate_bet_on_insert() → create_bet_transaction()

┌─────────────────────────────────┐
│ Usuário clica em "Apostar"      │
└──────────────┬──────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ 1. Validar saldo                 │
│    ✓ Balance >= amount?          │
│                                  │
│ 2. Validar série                 │
│    ✓ Status = 'liberada'?        │
│    ✓ Betting enabled?            │
│                                  │
│ 3. DEBITAR saldo                 │
│    UPDATE wallet                 │
│    SET balance = balance - amount│
│                                  │
│ 4. Criar registro de aposta      │
│    INSERT INTO bets              │
│    status = 'aceita'             │
│                                  │
│ 5. Criar transação               │
│    INSERT INTO transactions      │
│    type = 'aposta'               │
│    amount = -60 (negativo)       │
└──────────────────────────────────┘
```

### Estado 2: Resolução (GANHOU)
```
Trigger: UPDATE bets (status → 'ganha')
Função: credit_winnings()

┌──────────────────────────────────┐
│ Admin finaliza série             │
│ Winner = chosen_player_id        │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ 1. Calcular retorno              │
│    return_amount = amount × 2    │
│    (exemplo: 60 × 2 = 120)       │
│                                  │
│ 2. CREDITAR saldo                │
│    UPDATE wallet                 │
│    SET balance = balance + 120   │
│                                  │
│ 3. Criar transação de ganho      │
│    INSERT INTO transactions      │
│    type = 'ganho'                │
│    amount = 120 (positivo)       │
│                                  │
│ 4. Atualizar aposta              │
│    UPDATE bets                   │
│    actual_return = 120           │
│    resolved_at = NOW()           │
└──────────────────────────────────┘
```

### Estado 3: Resolução (PERDEU)
```
Trigger: UPDATE bets (status → 'perdida')
Função: handle_lost_bets() [apenas log]

┌──────────────────────────────────┐
│ Admin finaliza série             │
│ Winner ≠ chosen_player_id        │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ 1. Apenas atualizar status       │
│    UPDATE bets                   │
│    status = 'perdida'            │
│    resolved_at = NOW()           │
│                                  │
│ 2. LOG de perda                  │
│    RAISE NOTICE                  │
│    '❌ [PERDA] SEM REEMBOLSO'    │
│                                  │
│ 3. NADA MAIS!                    │
│    ✘ SEM crédito                 │
│    ✘ SEM transação               │
│    ✘ SEM reembolso               │
│                                  │
│ Saldo permanece como está        │
└──────────────────────────────────┘
```

---

## 💰 Matemática das Apostas

### Fórmula de Ganhos
```javascript
// Constantes
const MULTIPLIER = 2;

// Ao ganhar
return_amount = bet_amount * MULTIPLIER;
final_balance = current_balance + return_amount;

// Exemplo
bet_amount = 60;       // R$ 60,00
balance_before = 40;   // R$ 40,00 (já debitado)
return_amount = 60 * 2 = 120;
final_balance = 40 + 120 = 160;

// Lucro líquido
net_profit = return_amount - bet_amount;
net_profit = 120 - 60 = 60;  // R$ 60,00
```

### Fórmula de Perdas
```javascript
// Ao perder
return_amount = 0;
final_balance = current_balance;  // NÃO muda!

// Exemplo
bet_amount = 60;       // R$ 60,00
balance_before = 40;   // R$ 40,00 (já debitado)
return_amount = 0;     // ZERO!
final_balance = 40;    // Permanece R$ 40,00

// Perda líquida
net_loss = bet_amount;
net_loss = 60;  // R$ 60,00
```

---

## 📈 Cenários Detalhados

### Cenário A: Uma Aposta Ganha
```
┌──────────────┬─────────────┬────────────┐
│ Momento      │ Ação        │ Saldo      │
├──────────────┼─────────────┼────────────┤
│ Início       │ -           │ R$ 100,00  │
│ Criar aposta │ -R$ 60      │ R$  40,00  │
│ Ganhou!      │ +R$ 120     │ R$ 160,00  │
└──────────────┴─────────────┴────────────┘

Lucro: R$ 60,00 ✅
ROI: 100% (ganhou o que apostou)
```

### Cenário B: Uma Aposta Perdida
```
┌──────────────┬─────────────┬────────────┐
│ Momento      │ Ação        │ Saldo      │
├──────────────┼─────────────┼────────────┤
│ Início       │ -           │ R$ 100,00  │
│ Criar aposta │ -R$ 60      │ R$  40,00  │
│ Perdeu!      │  R$  0      │ R$  40,00  │
└──────────────┴─────────────┴────────────┘

Perda: R$ 60,00 ❌
ROI: -100% (perdeu tudo)
```

### Cenário C: Três Apostas Mistas
```
Saldo inicial: R$ 200,00

┌───────┬──────────┬─────────┬──────────┬──────────┬──────────┐
│ Passo │ Ação     │ Valor   │ Resultado│ Crédito  │ Saldo    │
├───────┼──────────┼─────────┼──────────┼──────────┼──────────┤
│   1   │ Aposta 1 │ -R$ 50  │ (aguarda)│    -     │ R$ 150   │
│   2   │ Aposta 2 │ -R$ 50  │ (aguarda)│    -     │ R$ 100   │
│   3   │ Aposta 3 │ -R$ 50  │ (aguarda)│    -     │ R$  50   │
│   -   │ Resolve  │    -    │ A1: WIN  │ +R$ 100  │ R$ 150   │
│   -   │ Resolve  │    -    │ A2: LOSS │  R$   0  │ R$ 150   │
│   -   │ Resolve  │    -    │ A3: WIN  │ +R$ 100  │ R$ 250   │
└───────┴──────────┴─────────┴──────────┴──────────┴──────────┘

Resumo:
• Apostou:  R$ 150 (3 × R$ 50)
• Ganhou:   R$ 200 (2 × R$ 100)
• Lucro:    R$  50
• Taxa:     33% ROI
```

---

## 🔍 Comparação: Antes vs Depois

### Sistema ANTERIOR (Incorreto)
```
┌─────────────────────────────────┐
│ PROBLEMA: Reembolso em perdas   │
└─────────────────────────────────┘

Saldo: R$ 100
Aposta: R$ 60 → Saldo: R$ 40
Status: 'perdida'

❌ Bug: Trigger devolvia R$ 60
Saldo final: R$ 100 (ERRADO!)

Resultado: Usuário não perdia nada! 🤯
```

### Sistema ATUAL (Corrigido)
```
┌─────────────────────────────────┐
│ CORREÇÃO: SEM reembolso         │
└─────────────────────────────────┘

Saldo: R$ 100
Aposta: R$ 60 → Saldo: R$ 40
Status: 'perdida'

✅ Correção: Nenhum crédito
Saldo final: R$ 40 (CORRETO!)

Resultado: Usuário perde aposta normalmente ✅
```

---

## 🗃️ Estrutura de Dados

### Tabela: bets
```sql
┌─────────────┬──────────────────────────────────┐
│ Campo       │ Descrição                        │
├─────────────┼──────────────────────────────────┤
│ id          │ UUID da aposta                   │
│ user_id     │ Quem apostou                     │
│ serie_id    │ Em qual série                    │
│ amount      │ Valor apostado (centavos)        │
│ chosen_...  │ Jogador escolhido                │
│ status      │ 'aceita', 'ganha', 'perdida'     │
│ actual_...  │ Retorno real (se ganhou)         │
│ resolved_at │ Quando foi resolvida             │
└─────────────┴──────────────────────────────────┘
```

### Tabela: transactions
```sql
┌──────────────┬──────────────────────────────────┐
│ Campo        │ Descrição                        │
├──────────────┼──────────────────────────────────┤
│ id           │ UUID da transação                │
│ wallet_id    │ Carteira afetada                 │
│ user_id      │ Dono da carteira                 │
│ bet_id       │ Aposta relacionada (opcional)    │
│ type         │ 'aposta', 'ganho', 'reembolso'   │
│ amount       │ Valor (+ ou -)                   │
│ balance_...  │ Saldo antes                      │
│ balance_...  │ Saldo depois                     │
│ status       │ 'completed', 'pending'           │
│ description  │ Descrição legível                │
└──────────────┴──────────────────────────────────┘
```

### Exemplo de Registros

**Aposta:**
```json
{
  "id": "abc-123",
  "user_id": "user-456",
  "serie_id": "serie-789",
  "amount": 6000,           // R$ 60,00 em centavos
  "chosen_player_id": "player-1",
  "status": "ganha",
  "actual_return": 12000,   // R$ 120,00
  "resolved_at": "2025-11-07T10:30:00Z"
}
```

**Transação de Débito (criar aposta):**
```json
{
  "id": "trans-1",
  "wallet_id": "wallet-abc",
  "user_id": "user-456",
  "bet_id": "abc-123",
  "type": "aposta",
  "amount": -6000,          // Negativo = débito
  "balance_before": 10000,  // R$ 100,00
  "balance_after": 4000,    // R$ 40,00
  "status": "completed",
  "description": "Aposta na série 5"
}
```

**Transação de Crédito (ganhou):**
```json
{
  "id": "trans-2",
  "wallet_id": "wallet-abc",
  "user_id": "user-456",
  "bet_id": "abc-123",
  "type": "ganho",
  "amount": 12000,          // Positivo = crédito
  "balance_before": 4000,   // R$ 40,00
  "balance_after": 16000,   // R$ 160,00
  "status": "completed",
  "description": "Ganho na aposta da série 5"
}
```

---

## 🎯 Regras de Negócio

### ✅ PERMITIDO
- Apostar em série 'liberada' ou 'em_andamento'
- Apostar se saldo >= valor da aposta
- Ganhar 2x o valor apostado
- Criar múltiplas apostas na mesma série
- Ver histórico completo de transações

### ❌ NÃO PERMITIDO
- Apostar com saldo insuficiente
- Apostar em série finalizada/cancelada
- Editar aposta após criação
- Receber reembolso em aposta perdida
- Manipular saldo manualmente (apenas via transações)

---

## 🔐 Segurança e Integridade

### Validações Implementadas

1. **Saldo Suficiente**
```sql
IF user_balance < bet_amount THEN
  RAISE EXCEPTION 'Saldo insuficiente';
END IF;
```

2. **Série Válida**
```sql
IF serie_status != 'liberada' AND serie_status != 'em_andamento' THEN
  RAISE EXCEPTION 'Série não disponível';
END IF;
```

3. **Jogador Válido**
```sql
IF chosen_player NOT IN (player1, player2) THEN
  RAISE EXCEPTION 'Jogador não está nesta partida';
END IF;
```

4. **Evitar Duplicação**
```sql
IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
  -- Só executa se status mudou PARA 'ganha'
  -- Evita re-executar se já estava 'ganha'
END IF;
```

---

## 📊 Relatórios e Queries Úteis

### Ver apostas de um usuário
```sql
SELECT 
  b.created_at,
  s.serie_number,
  b.amount / 100.0 as aposta_reais,
  b.status,
  CASE 
    WHEN b.status = 'ganha' THEN b.actual_return / 100.0
    ELSE NULL
  END as retorno_reais,
  CASE
    WHEN b.status = 'ganha' THEN (b.actual_return - b.amount) / 100.0
    WHEN b.status = 'perdida' THEN -b.amount / 100.0
    ELSE 0
  END as lucro_liquido_reais
FROM bets b
JOIN series s ON s.id = b.serie_id
WHERE b.user_id = 'SEU_USER_ID'
ORDER BY b.created_at DESC;
```

### Ver balanço total do sistema
```sql
SELECT 
  SUM(balance) / 100.0 as saldo_total_sistema,
  COUNT(DISTINCT user_id) as total_usuarios,
  AVG(balance) / 100.0 as saldo_medio_por_usuario
FROM wallet;
```

### Ver apostas por resultado
```sql
SELECT 
  status,
  COUNT(*) as quantidade,
  SUM(amount) / 100.0 as valor_total_apostado,
  SUM(actual_return) / 100.0 as valor_total_retorno
FROM bets
WHERE status IN ('ganha', 'perdida')
GROUP BY status;
```

---

**Documentado por**: Sistema Corrigido  
**Última atualização**: 07/11/2025  
**Versão**: 2.0 (Pós-correção)



