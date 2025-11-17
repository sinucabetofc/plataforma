# 🚨 PROBLEMA CRÍTICO: Cancelamento Credita DOBRO

**Data**: 07/11/2025  
**Status**: 🔴 NÃO RESOLVIDO  
**Prioridade**: 🔥 CRÍTICA

---

## 📊 EVIDÊNCIA DO BUG

### Teste Automatizado com Playwright

**Sequência de eventos:**

| Passo | Ação | Saldo | Screenshot |
|-------|------|-------|------------|
| 1 | Estado inicial | R$ 100,00 | `02_antes_cancelar_saldo_100.png` |
| 2 | Cancelou aposta R$ 60 | R$ 220,00 ❌ | `04_depois_cancelar_DOBRO_220.png` |
| 3 | (deveria ser) | R$ 160,00 ✅ | - |
| **Diferença** | **Creditou** | **R$ 120 ao invés de R$ 60** | **DOBRO!** |

**Segundo teste (após migration 1019):**

| Passo | Ação | Saldo | Screenshot |
|-------|------|-------|------------|
| 1 | Estado após correção | R$ 230,00 | `08_saldo_230_antes_teste.png` |
| 2 | Criou aposta R$ 10 | R$ 220,00 ✅ | `09_aposta_10_criada_220.png` |
| 3 | Cancelou aposta R$ 10 | R$ 240,00 ❌ | `11_PROBLEMA_PERSISTE_240.png` |
| 4 | (deveria ser) | R$ 230,00 ✅ | - |
| **Diferença** | **Creditou** | **R$ 20 ao invés de R$ 10** | **DOBRO!** |

---

## 🔍 ANÁLISE TÉCNICA

### O Que Está Acontecendo

**Fluxo esperado de cancelamento:**
```
1. Service: wallet.balance = balance + bet.amount (R$ 10)
2. Service: Cria transação de reembolso (R$ 10)
3. Service: Atualiza status da aposta para 'cancelada'
4. TOTAL CREDITADO: R$ 10 ✅
```

**Fluxo atual (incorreto):**
```
1. Service: wallet.balance = balance + bet.amount (R$ 10)
2. Service: Cria transação de reembolso (R$ 10)
3. Service: Atualiza status da aposta para 'cancelada'
4. ??? TRIGGER: Credita mais R$ 10 (ou R$ 20?) ???
5. TOTAL CREDITADO: R$ 20 ❌
```

### Hipóteses

**Hipótese 1: Trigger credit_winnings executando em 'cancelada'**
- Status: ❌ Testado, migration 1019 corrigiu mas não resolveu
- Trigger deveria ter condição `WHEN (NEW.status = 'ganha')`
- Função deveria ter `IF NEW.status = 'ganha'`

**Hipótese 2: Dupla chamada ao service**
- Status: 🔍 Possível
- Frontend pode estar chamando cancelBet() duas vezes
- Backend pode estar processando duas vezes

**Hipótese 3: Trigger no UPDATE da wallet**
- Status: 🔍 Possível  
- Pode haver trigger na tabela wallet que credita em certos updates

**Hipótese 4: Bug no cálculo do service**
- Status: ❌ Improvável
- Código claramente faz `+ bet.amount` (não `+ bet.amount * 2`)

---

## 🔧 TENTATIVAS DE CORREÇÃO

### Migration 1018 ❌
- Atualizou função `credit_winnings()`
- Adicionou logs de debug
- Reverteu créditos indevidos
- **Resultado**: NÃO resolveu

### Migration 1019 ❌
- Removeu trigger antigo completamente
- Criou nova função `credit_winnings_v2()`
- Trigger com condição WHEN explícita
- **Resultado**: NÃO resolveu

---

## 📝 PRÓXIMAS AÇÕES NECESSÁRIAS

### 1. Verificar Logs do Backend
```bash
cd backend
tail -f backend.log
```

Durante cancelamento, verificar:
- Quantas vezes a API é chamada
- Se há erro ou duplicação
- Valor sendo creditado

### 2. Verificar Triggers na Wallet
```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'wallet';
```

### 3. Verificar Transaction no Supabase
Execute a migration `1015_diagnose_specific_bet.sql` para ver:
- Todas as transações da última aposta cancelada
- Se há transação de tipo 'ganho' (não deveria!)
- Se há duplicação de reembolsos

### 4. Debug no Service
Adicionar logs explícitos em `bets.service.js`:

```javascript
console.log('=== CANCELAMENTO INICIADO ===');
console.log('Aposta ID:', betId);
console.log('Valor:', bet.amount / 100);
console.log('Saldo ANTES:', wallet.balance / 100);

// ... código de reembolso ...

console.log('Saldo DEPOIS do UPDATE:', (wallet.balance + bet.amount) / 100);
console.log('=== CANCELAMENTO CONCLUÍDO ===');
```

---

## 🎯 SOLUÇÃO TEMPORÁRIA

Até resolver o bug, você pode:

### Opção 1: Desabilitar cancelamento pelo usuário
```javascript
// frontend/pages/partidas/[id].js
canCancel={false} // Desabilita temporariamente
```

### Opção 2: Ajustar manualmente no admin
Quando usuário cancelar e receber dobro:
1. Identificar o excesso
2. Ajustar saldo manualmente no admin
3. Criar transação de débito administrativo

### Opção 3: Usar cancelamento apenas pelo admin
- Admin pode cancelar apostas pendentes
- Monitorar se admin também tem o bug

---

## 📂 ARQUIVOS ENVOLVIDOS

### Backend
```
backend/services/bets.service.js (linha 405-514)
  └─ Função cancelBet()
  
backend/controllers/bets.controller.js (linha 138-165)
  └─ Endpoint DELETE /api/bets/:id

backend/supabase/migrations/
  ├─ 1018_fix_cancel_double_credit.sql
  ├─ 1019_DISABLE_credit_on_cancel.sql
  └─ 1015_diagnose_specific_bet.sql
```

### Frontend
```
frontend/pages/partidas/[id].js
  ├─ handleCancelBet() (linha 564-568)
  └─ BetItem component (linha 397-553)

frontend/components/ConfirmModal.js
  └─ Modal de confirmação customizado
```

---

## 🆘 NEXT STEPS

1. ✅ Execute migration `1015_diagnose_specific_bet.sql`
2. ✅ Veja os resultados no Supabase
3. ✅ Compartilhe os resultados aqui
4. 🔄 Analisaremos juntos
5. 🔧 Criaremos correção definitiva

---

**Criado em**: 07/11/2025  
**Atualizado em**: 07/11/2025 20:45  
**Status**: 🔴 AGUARDANDO DIAGNÓSTICO COMPLETO




