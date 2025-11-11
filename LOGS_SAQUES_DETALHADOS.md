# 📊 Logs Detalhados - Sistema de Saques

## ✅ Logs Implementados

### 🟢 APROVAÇÃO DE SAQUE (`approveWithdrawal`)

Quando você **aprovar** um saque, verá no terminal do backend:

```
================================================================================
💰 [APPROVE_WITHDRAWAL] Iniciando aprovação de saque
💰 [APPROVE_WITHDRAWAL] ID do saque: abc-123-xyz
================================================================================
📋 [APPROVE_WITHDRAWAL] Passo 1: Buscando dados do saque...
✅ [APPROVE_WITHDRAWAL] Saque encontrado:
   - User ID: user-uuid
   - Valor: 70 reais
   - Status atual: pending
   - Data criação: 2025-11-10...
📝 [APPROVE_WITHDRAWAL] Passo 2: Atualizando status para completed...
✅ [APPROVE_WITHDRAWAL] Status atualizado para completed
   - Processado em: 2025-11-10...
💳 [APPROVE_WITHDRAWAL] Passo 3: Atualizando total_withdrawn da carteira...
💰 [APPROVE_WITHDRAWAL] Valores:
   - total_withdrawn anterior: 0 reais
   - Valor do saque: 70 reais
   - total_withdrawn novo: 70 reais
✅ [APPROVE_WITHDRAWAL] total_withdrawn atualizado com sucesso!
   - Novo total_withdrawn: 70 reais
💵 [APPROVE_WITHDRAWAL] Taxa da plataforma (8%): 5.6 reais
================================================================================
✅ [APPROVE_WITHDRAWAL] Saque aprovado com sucesso!
================================================================================
```

---

### 🔴 REJEIÇÃO DE SAQUE (`rejectWithdrawal`)

Quando você **rejeitar** um saque, verá:

```
================================================================================
❌ [REJECT_WITHDRAWAL] Iniciando rejeição de saque
❌ [REJECT_WITHDRAWAL] ID do saque: abc-123-xyz
❌ [REJECT_WITHDRAWAL] Motivo: Dados incorretos
================================================================================
📋 [REJECT_WITHDRAWAL] Passo 1: Buscando dados do saque...
✅ [REJECT_WITHDRAWAL] Saque encontrado:
   - User ID: user-uuid
   - Valor: 70 reais
   - Status atual: pending
📝 [REJECT_WITHDRAWAL] Passo 2: Atualizando status para failed...
✅ [REJECT_WITHDRAWAL] Status atualizado para failed
💳 [REJECT_WITHDRAWAL] Passo 3: Buscando saldo da carteira...
💰 [REJECT_WITHDRAWAL] Devolvendo saldo:
   - Saldo atual: 0 reais
   - Valor a devolver: 70 reais
   - Novo saldo: 70 reais
💳 [REJECT_WITHDRAWAL] Passo 4: Atualizando saldo da carteira...
✅ [REJECT_WITHDRAWAL] Saldo devolvido com sucesso!
   - Novo saldo disponível: 70 reais
================================================================================
✅ [REJECT_WITHDRAWAL] Saque rejeitado com sucesso!
================================================================================
```

---

## 🔍 Como Usar os Logs

### 1️⃣ **Abra o terminal** onde o backend está rodando

### 2️⃣ **Aprove ou Rejeite** um saque no painel admin

### 3️⃣ **Veja os logs** no terminal em tempo real

### 4️⃣ **Procure por:**
- ✅ Marcas verdes = sucesso
- ❌ Marcas vermelhas = erro
- 💰 Valores em reais
- 📋 Cada passo do processo

---

## 🐛 Debugando Problemas

### Problema: Saque não é aprovado
**Procure por:**
```
❌ [APPROVE_WITHDRAWAL] Erro ao buscar saque:
❌ [APPROVE_WITHDRAWAL] Saque não encontrado!
```

**Causa possível:**
- ID incorreto
- Saque já foi processado
- Tipo não é 'saque'

---

### Problema: Saldo não volta ao rejeitar
**Procure por:**
```
❌ [REJECT_WITHDRAWAL] Erro ao atualizar carteira:
```

**Causa possível:**
- Permissões do banco
- Carteira não encontrada
- Cálculo incorreto

---

### Problema: total_withdrawn não atualiza
**Procure por:**
```
❌ [APPROVE_WITHDRAWAL] Erro ao atualizar total_withdrawn:
❌ [APPROVE_WITHDRAWAL] Carteira não encontrada!
```

**Causa possível:**
- user_id incorreto
- Coluna não existe

---

## 📋 Etapas de cada Operação

### ✅ Aprovar Saque:
1. Buscar saque (type='saque', status='pending')
2. Atualizar status → 'completed'
3. Buscar carteira do usuário
4. Calcular novo total_withdrawn
5. Atualizar carteira
6. Calcular e logar taxa de 8%

### ❌ Rejeitar Saque:
1. Buscar saque (type='saque', status='pending')
2. Atualizar status → 'failed'
3. Buscar saldo atual da carteira
4. Calcular novo saldo (atual + valor do saque)
5. Atualizar saldo da carteira
6. Logar devolução

---

## 🎯 Próximo Teste

1. **Aprove um saque** em `/admin/withdrawals`
2. **Veja os logs** no terminal do backend
3. **Me envie** os logs completos
4. **Vamos identificar** exatamente onde está o problema!

---

**Backend reiniciado com logs completos!** 🎱

Agora **aprove um saque** e me envie os logs que aparecem no terminal!

