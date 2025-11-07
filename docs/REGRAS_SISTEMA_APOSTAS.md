# 🎱 Regras do Sistema de Apostas - SinucaBet

**Versão**: 2.0  
**Data**: 07/11/2025  
**Status**: 📋 Documentação Oficial

---

## 📖 Visão Geral

O SinucaBet utiliza um sistema de **apostas casadas** (peer-to-peer), onde duas pessoas apostam em jogadores opostos e o vencedor leva o total apostado.

---

## 💰 Fluxo de Saldo

### Estados do Saldo

1. **Saldo Disponível**: Pode ser usado para apostas ou saques
2. **Saldo Bloqueado**: Valor apostado (não pode sacar, pode cancelar antes de casar)
3. **Saldo em Apostas Casadas**: Apostas travadas (não pode cancelar)

### Fluxo Visual

```
┌─────────────────┐
│ Saldo Disponível│
│    R$ 100,00    │
└────────┬────────┘
         │ Aposta R$ 10
         ▼
┌─────────────────┐
│ Saldo Disponível│  ┌─────────────────┐
│    R$ 90,00     │  │ Saldo Bloqueado │
└─────────────────┘  │    R$ 10,00     │
                     └────────┬────────┘
                              │ Casou!
                              ▼
                     ┌─────────────────┐
                     │  Aposta Casada  │
                     │ (Não pode mais  │
                     │    cancelar)    │
                     └────────┬────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
              GANHOU                    PERDEU
                 │                         │
                 ▼                         ▼
        ┌─────────────────┐     ┌─────────────────┐
        │ Recebe 2x       │     │ Perde Tudo      │
        │ R$ 20,00        │     │ R$ 0,00         │
        └─────────────────┘     └─────────────────┘
```

---

## 🎯 Regras Detalhadas

### 1. Criar Aposta

**Condições:**
- ✅ Usuário tem saldo suficiente
- ✅ Série está `liberada` ou `em_andamento`
- ✅ Apostas estão habilitadas (`betting_enabled = true`)
- ✅ Valor mínimo: R$ 10,00 (1000 centavos)

**O que acontece:**
```
Saldo Disponível: R$ 100,00
       ↓
Aposta: R$ 10,00
       ↓
Saldo Disponível: R$ 90,00
Saldo Bloqueado: R$ 10,00
```

**Banco de Dados:**
- ✅ Debita o valor imediatamente da `wallet.balance`
- ✅ Cria registro na tabela `bets` com `status = 'pendente'`
- ✅ Cria transação tipo `'aposta'` com valor negativo

---

### 2. Cancelar Aposta (Antes de Casar)

**Condições para Cancelamento:**
- ✅ Aposta está `pendente` (não casou ainda)
- ✅ Série está `liberada` ou `em_andamento` (não finalizou)
- ✅ Usuário é o dono da aposta

**O que acontece:**
```
Saldo Disponível: R$ 90,00
Saldo Bloqueado: R$ 10,00
       ↓
Cancela Aposta
       ↓
Saldo Disponível: R$ 100,00  ← Volta APENAS o valor apostado
Saldo Bloqueado: R$ 0,00
```

**Banco de Dados:**
- ✅ Credita `bet.amount` de volta na `wallet.balance`
- ✅ Atualiza aposta para `status = 'cancelada'`
- ✅ Cria transação tipo `'reembolso'` com o valor da aposta
- ✅ Marca `resolved_at` com timestamp

---

### 3. Matching (Casamento de Apostas)

**Sistema Atual: Valores IGUAIS**

**Regra:**
- ✅ Duas apostas do **MESMO VALOR**
- ✅ Em **jogadores OPOSTOS**
- ✅ Na **MESMA SÉRIE**

**Exemplo:**
```
Usuário A aposta R$ 10 no Jogador 1
Usuário B aposta R$ 10 no Jogador 2
         ↓
    ✅ CASOU!
    (Apostas travadas)
```

**O que acontece:**
- ✅ Ambas apostas mudam para `status = 'aceita'`
- ✅ `matched_bet_id` aponta uma para a outra
- ❌ **NÃO PODEM MAIS SER CANCELADAS**
- ✅ Aguardam finalização da série

**Banco de Dados:**
```sql
UPDATE bets
SET 
  status = 'aceita',
  matched_bet_id = <outra_aposta_id>
WHERE id IN (<aposta1_id>, <aposta2_id>);
```

---

### 4. Aposta Casada - GANHOU

**Quando:**
- ✅ Série finalizada
- ✅ Escolheu o jogador vencedor
- ✅ Aposta estava casada (`matched_bet_id IS NOT NULL`)

**O que acontece:**
```
Apostou: R$ 10,00 (já foi debitado)
Resultado: GANHOU
       ↓
Recebe: R$ 20,00 (2x o valor apostado)
       ↓
Saldo Disponível += R$ 20,00
```

**Cálculo:**
```
Retorno = Valor Apostado × 2
Retorno = R$ 10,00 × 2 = R$ 20,00
```

**Banco de Dados:**
- ✅ Credita `bet.amount * 2` na `wallet.balance`
- ✅ Atualiza aposta para `status = 'ganha'`
- ✅ Define `actual_return = bet.amount * 2`
- ✅ Cria transação tipo `'ganho'` com valor do retorno
- ✅ Marca `resolved_at`

---

### 5. Aposta Casada - PERDEU

**Quando:**
- ✅ Série finalizada
- ✅ Escolheu o jogador perdedor
- ✅ Aposta estava casada (`matched_bet_id IS NOT NULL`)

**O que acontece:**
```
Apostou: R$ 10,00 (já foi debitado)
Resultado: PERDEU
       ↓
Recebe: R$ 0,00 (perde tudo)
       ↓
Saldo Disponível: sem alteração
```

**Banco de Dados:**
- ❌ **NÃO** credita nada
- ✅ Atualiza aposta para `status = 'perdida'`
- ✅ `actual_return = 0` (ou NULL)
- ❌ **NÃO** cria transação de crédito
- ✅ Marca `resolved_at`

---

### 6. Aposta NÃO Casada - Série Finaliza

**Quando:**
- ✅ Série finalizada
- ❌ Aposta NÃO casou (`matched_bet_id IS NULL`)
- ✅ Status ainda é `pendente`

**O que acontece:**
```
Apostou: R$ 10,00
Série finalizou sem casar
       ↓
REEMBOLSO AUTOMÁTICO
       ↓
Saldo Disponível += R$ 10,00
```

**Banco de Dados (Trigger Automático):**
- ✅ Credita `bet.amount` de volta na `wallet.balance`
- ✅ Atualiza aposta para `status = 'reembolsada'`
- ✅ Cria transação tipo `'reembolso'`
- ✅ Marca `resolved_at`

**Trigger:** `refund_pending_bets_on_serie_end()`

---

## 📊 Tabela Resumo

| Situação | Apostado | Pode Cancelar? | Status Final | Recebe |
|----------|----------|----------------|--------------|---------|
| Aposta criada (pendente) | R$ 10 | ✅ SIM | `pendente` | - |
| Cancelou antes de casar | R$ 10 | - | `cancelada` | R$ 10 (reembolso) |
| Casou e GANHOU | R$ 10 | ❌ NÃO | `ganha` | R$ 20 (dobro) |
| Casou e PERDEU | R$ 10 | ❌ NÃO | `perdida` | R$ 0 (perdeu tudo) |
| Não casou e série finalizou | R$ 10 | - | `reembolsada` | R$ 10 (reembolso) |

---

## 🔐 Regras de Segurança

### Não Pode Cancelar Se:

1. ❌ Aposta já casou (`matched_bet_id IS NOT NULL`)
2. ❌ Status ≠ `pendente` (já foi resolvida)
3. ❌ Série já foi `finalizada` ou `cancelada`
4. ❌ Usuário não é o dono da aposta

### Pode Cancelar Se:

1. ✅ Aposta está `pendente`
2. ✅ Aposta NÃO casou (`matched_bet_id IS NULL`)
3. ✅ Série está `liberada` ou `em_andamento`
4. ✅ Usuário é o dono da aposta

---

## 💻 Implementação Técnica

### Status de Apostas

```sql
CREATE TYPE bet_status AS ENUM (
  'pendente',      -- Aguardando casamento
  'aceita',        -- Casou com outra aposta
  'ganha',         -- Ganhou a aposta
  'perdida',       -- Perdeu a aposta
  'cancelada',     -- Cancelada pelo usuário
  'reembolsada'    -- Reembolsada automaticamente
);
```

### Campos Importantes

```sql
CREATE TABLE bets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  serie_id UUID NOT NULL,
  chosen_player_id UUID NOT NULL,
  amount INTEGER NOT NULL,              -- Valor em centavos
  potential_return INTEGER,             -- Retorno potencial
  actual_return INTEGER,                -- Retorno real (se ganhou)
  status bet_status NOT NULL,           -- Status atual
  placed_at TIMESTAMP NOT NULL,         -- Quando apostou
  resolved_at TIMESTAMP,                -- Quando resolveu
  matched_bet_id UUID,                  -- Aposta casada (se houver)
  odds DECIMAL,                         -- Odds (futuro)
  ...
);
```

---

## 🎮 Exemplo Completo

### Cenário 1: Ganhou a Aposta

```
1. João aposta R$ 10 no Jogador A
   → Saldo: R$ 100 - R$ 10 = R$ 90
   → Status: pendente

2. Maria aposta R$ 10 no Jogador B
   → Apostas CASAM
   → Status: aceita
   → Não podem mais cancelar

3. Jogo termina: Jogador A vence
   → João GANHOU
   → João recebe: R$ 10 × 2 = R$ 20
   → Saldo João: R$ 90 + R$ 20 = R$ 110
   → Status: ganha

   → Maria PERDEU
   → Maria recebe: R$ 0
   → Saldo Maria: não muda
   → Status: perdida
```

### Cenário 2: Cancelou a Aposta

```
1. João aposta R$ 10 no Jogador A
   → Saldo: R$ 100 - R$ 10 = R$ 90
   → Status: pendente

2. João cancela a aposta (antes de casar)
   → João recebe reembolso: R$ 10
   → Saldo João: R$ 90 + R$ 10 = R$ 100
   → Status: cancelada
```

### Cenário 3: Não Casou

```
1. João aposta R$ 10 no Jogador A
   → Saldo: R$ 100 - R$ 10 = R$ 90
   → Status: pendente

2. Ninguém mais aposta no Jogador B

3. Jogo termina sem casar a aposta
   → Reembolso AUTOMÁTICO
   → João recebe: R$ 10
   → Saldo João: R$ 90 + R$ 10 = R$ 100
   → Status: reembolsada
```

---

## 🚀 Sistema Futuro (Múltiplas Apostas)

**Versão 3.0** permitirá apostas de valores diferentes:

```
Lado A:
- João: R$ 30
- Maria: R$ 50
Total: R$ 80

Lado B:
- Pedro: R$ 80
Total: R$ 80

✅ Valores totais iguais = PODE CASAR
```

**Cálculo de Retorno:**
```
Se Lado A ganhar:
- João recebe: R$ 30 + (R$ 30/R$ 80 × R$ 80) = R$ 60
- Maria recebe: R$ 50 + (R$ 50/R$ 80 × R$ 80) = R$ 100
```

---

## 📝 Checklist de Implementação

### Já Implementado ✅

- [x] Criar aposta e debitar saldo
- [x] Cancelar aposta e reembolsar
- [x] Reembolso automático se não casar
- [x] Creditar ganhos (2x)
- [x] Sistema de transações
- [x] Validações de segurança

### A Implementar 🔄

- [ ] Sistema de matching automático (valores iguais)
- [ ] Bloquear cancelamento após casar
- [ ] Interface mostrando saldo bloqueado
- [ ] Notificações de casamento
- [ ] Sistema de odds dinâmicas
- [ ] Matching com valores diferentes (v3.0)

---

## 🎱 SinucaBet - Sistema de Apostas

**Documentação Oficial**  
**Atualizado em:** 07/11/2025

