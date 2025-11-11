# ✅ Correção: Dashboard contabiliza apenas saques de APOSTADORES

## 🔍 Problema identificado:

O dashboard estava buscando saques com `type='withdraw'`, mas os saques são salvos com `type='saque'`. Além disso, precisávamos garantir que **NÃO contabilize saques de influencers/parceiros**.

---

## 🎯 Solução implementada:

### **Dashboard (`admin.service.js`) - Contabiliza APENAS apostadores:**

```javascript
// Busca APENAS da tabela transactions (apostadores)
.from('transactions')
.in('type', ['withdraw', 'saque']) // Aceita ambos os tipos
.eq('status', 'completed')
```

**NÃO busca** da tabela `influencer_withdrawals` (parceiros).

---

## 📊 Estrutura de Saques:

### 1. **Saques de APOSTADORES** ✅ Contabiliza no dashboard
- **Tabela:** `transactions`
- **Type:** `'withdraw'` ou `'saque'`
- **Status:** `pending`, `completed`, `failed`
- **Aparece em:**
  - `/admin/withdrawals` (página de saques)
  - Dashboard (indicadores)

### 2. **Saques de INFLUENCERS/PARCEIROS** ❌ NÃO contabiliza no dashboard
- **Tabela:** `influencer_withdrawals`
- **Status:** `pending`, `approved`, `rejected`
- **Aparece em:**
  - `/admin/withdrawals` (página de saques)
  - **NÃO aparece** no dashboard

---

## 📈 Indicadores do Dashboard (apenas apostadores):

### ✅ **Saques Pendentes:**
- Valor total de saques pendentes de apostadores
- Quantidade de solicitações

### ✅ **Lucro da Plataforma (8%):**
- **Hoje:** 8% dos saques aprovados hoje
- **Semana:** 8% dos saques aprovados nos últimos 7 dias
- **Mês:** 8% dos saques aprovados no mês
- **Total:** 8% de todos os saques aprovados

**Cálculo:** `valor_do_saque * 0.08`

---

## 🔧 O que foi alterado:

### Arquivo: `backend/services/admin.service.js`

#### **Antes (ERRADO):**
```javascript
.eq('type', 'withdraw') // Não encontrava saques
```

#### **Depois (CORRETO):**
```javascript
.in('type', ['withdraw', 'saque']) // Encontra ambos os tipos
```

### Queries atualizadas:
1. ✅ Saques pendentes
2. ✅ Saques aprovados hoje
3. ✅ Saques aprovados na semana
4. ✅ Saques aprovados no mês
5. ✅ Saques aprovados total

---

## 📋 Verificação:

Para verificar se está funcionando, execute este SQL no Supabase:

```sql
-- Ver tipos de saque que existem
SELECT 
    type,
    COUNT(*) as quantidade,
    SUM(amount) / 100.0 as total_reais
FROM transactions
WHERE type IN ('withdraw', 'saque')
GROUP BY type;
```

---

## 🎯 Resultado:

### **Dashboard agora mostra:**
- ✅ Apenas saques de **apostadores** (tabela `transactions`)
- ✅ **NÃO inclui** saques de influencers (tabela `influencer_withdrawals`)
- ✅ Lucro da plataforma calculado **apenas sobre saques de apostadores**
- ✅ Funciona com ambos os tipos: `'withdraw'` e `'saque'`

### **Página `/admin/withdrawals` mostra:**
- ✅ **TODOS os saques** (apostadores + influencers)
- ✅ Separados por tipo para fácil identificação

---

## 🚀 Para produção:

1. ✅ Dashboard contabiliza apenas apostadores
2. ✅ Sistema pronto para deletar transações de teste
3. ✅ Cálculo de lucro correto (8% dos saques)
4. ✅ Separação clara entre apostadores e influencers

---

**Criado em:** 10/11/2025  
**Status:** ✅ Corrigido e funcional

