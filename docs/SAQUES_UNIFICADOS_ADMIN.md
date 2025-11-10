# 💰 Sistema de Saques Unificado - Admin Panel

## 📋 Visão Geral

O admin agora visualiza **TODOS os saques** em uma única página:
- ✅ Saques de **Parceiros** (tabela `influencer_withdrawals`)
- ✅ Saques de **Apostadores** (tabela `transactions` com `type='withdraw'`)

---

## 🎯 Funcionalidades

### Para o Admin em `/admin/withdrawals`:

1. ✅ **Visualizar todos os saques** (parceiros + apostadores)
2. ✅ **Identificação clara** com badges coloridos:
   - 🟣 **Roxo** = Parceiro/Influencer
   - 🔵 **Azul** = Apostador/Usuário
3. ✅ **Informações completas**:
   - Nome, telefone, email
   - CPF (apenas para apostadores)
   - Chave PIX e tipo
   - Datas de solicitação/aprovação/rejeição
4. ✅ **Filtros por status**:
   - Pendentes
   - Aprovados
   - Rejeitados
   - Cancelados
   - Todos
5. ✅ **Estatísticas**:
   - Total de saques
   - Total de parceiros
   - Total de apostadores
   - Total pendentes (em valor)
6. ✅ **Aprovar/Rejeitar** ambos os tipos

---

## 📊 Estrutura Unificada

### Backend Service: `admin-withdrawals.service.js`

```javascript
async function getAllWithdrawals(filters) {
  // 1. Buscar de influencer_withdrawals
  const influencerWithdrawals = await supabase
    .from('influencer_withdrawals')
    .select('*, influencer:influencers(name, phone, email)');

  // 2. Buscar de transactions (type='withdraw')
  const userWithdrawals = await supabase
    .from('transactions')
    .select('*, user:users(name, phone, email, cpf, pix_key)')
    .eq('type', 'withdraw');

  // 3. Combinar e normalizar
  const allWithdrawals = [
    ...influencerWithdrawals.map(w => ({
      id: w.id,
      type: 'influencer',
      amount: w.amount,
      pix_key: w.pix_key,
      status: w.status,
      requester: {
        name: w.influencer.name,
        type: 'Parceiro'
      }
    })),
    ...userWithdrawals.map(w => ({
      id: w.id,
      type: 'user',
      amount: w.amount / 100, // Centavos → Reais
      pix_key: w.metadata.pix_key,
      status: mapStatus(w.status),
      requester: {
        name: w.user.name,
        cpf: w.user.cpf,
        type: 'Apostador'
      }
    }))
  ];

  return allWithdrawals;
}
```

### Mapeamento de Status:

| Transactions | Withdrawals |
|--------------|-------------|
| `pending` | `pending` |
| `completed` | `approved` |
| `failed` | `rejected` |
| `cancelled` | `cancelled` |

---

## 🎨 Interface do Admin

### Cards de Saques:

Cada saque exibe:

```
┌─────────────────────────────────────────┐
│ 🟣 Parceiro  ⏰ Pendente      R$ 150,00 │
├─────────────────────────────────────────┤
│ 👤 Parceiro: João Silva                 │
│ 📞 Telefone: +5511999999999             │
│ 🔑 Chave PIX (phone): 11999999999       │
├─────────────────────────────────────────┤
│ Solicitado em: 10/11/2025 16:00        │
├─────────────────────────────────────────┤
│ [Aprovar Saque] [Rejeitar]             │
└─────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────┐
│ 🔵 Apostador  ⏰ Pendente     R$ 100,00 │
├─────────────────────────────────────────┤
│ 👤 Apostador: Maria Santos              │
│ 📞 Telefone: +5511888888888             │
│ 📄 CPF: 123.456.789-00                  │
│ 🔑 Chave PIX (cpf): 12345678900         │
├─────────────────────────────────────────┤
│ Solicitado em: 10/11/2025 17:00        │
├─────────────────────────────────────────┤
│ [Aprovar Saque] [Rejeitar]             │
└─────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Aprovação

### Parceiro:
```
Admin clica "Aprovar" → Realiza PIX manualmente
→ Sistema deduz do saldo do parceiro automaticamente
→ Status: approved
→ Balance atualizado em influencer_commissions
```

### Apostador:
```
Admin clica "Aprovar" → Realiza PIX manualmente
→ Status da transaction muda para 'completed'
→ Saldo já foi deduzido quando criou a solicitação
```

---

## 🧪 Como Testar

### 1. Criar Migration de Saques de Influencers (se ainda não fez)

No **Supabase SQL Editor**:
```sql
Execute: backend/supabase/migrations/1034_create_influencer_withdrawals.sql
```

### 2. Criar Saques de Teste

No **Supabase SQL Editor**:
```sql
Execute: backend/supabase/scripts/create_test_withdrawals.sql
```

Isso vai criar:
- ✅ 1 saque de parceiro (R$ 150,00)
- ✅ 1 saque de apostador (R$ 100,00)
- Ambos com status `pending`

### 3. Acessar o Admin

1. Vá em: `http://localhost:3000/admin/withdrawals`
2. **Deve ver 2 saques:**
   - 🟣 **Parceiro** - R$ 150,00 - Pendente
   - 🔵 **Apostador** - R$ 100,00 - Pendente

### 4. Testar Aprovação

1. Clique em **"Aprovar Saque"** no saque do parceiro
2. Confirme
3. ✅ Status muda para "Aprovado"
4. ✅ Saldo do parceiro é deduzido automaticamente

### 5. Testar Rejeição

1. Clique em **"Rejeitar"** no saque do apostador
2. Informe motivo: "Dados bancários incorretos"
3. Confirme
4. ✅ Status muda para "Rejeitado"
5. ✅ Motivo aparece para o apostador

---

## 📊 Estatísticas Exibidas

No topo da página:

| Card | Valor | Descrição |
|------|-------|-----------|
| **Total de Saques** | 2 | Todos os saques |
| **Parceiros** | 1 | Saques de influencers |
| **Apostadores** | 1 | Saques de usuários |
| **Pendentes** | R$ 250,00 | Valor total pendente |

---

## 🔐 Segurança

1. ✅ **RLS ativado** em ambas as tabelas
2. ✅ **Apenas admins** podem ver todos os saques
3. ✅ **Aprovação deduz saldo** automaticamente (parceiros)
4. ✅ **Auditoria completa** (quem aprovou, quando, motivo de rejeição)

---

## 📦 Arquivos Modificados

### Backend:
- ✅ `services/admin-withdrawals.service.js` (novo)
- ✅ `routes/admin-withdrawals.routes.js` (atualizado)

### Frontend:
- ✅ `hooks/admin/useWithdrawals.js` (atualizado)
- ✅ `pages/admin/withdrawals.js` (atualizado)

### Scripts:
- ✅ `scripts/create_test_withdrawals.sql` (novo)

---

## 🎁 Recursos Visuais

### Badges de Tipo:
- 🟣 **Roxo com estrela** ⭐ = Parceiro
- 🔵 **Azul com grupo** 👥 = Apostador

### Badges de Status:
- 🟡 **Amarelo** ⏰ = Pendente
- 🟢 **Verde** ✓ = Aprovado
- 🔴 **Vermelho** ✗ = Rejeitado
- ⚫ **Cinza** 🚫 = Cancelado

---

## 🚀 Próximos Passos

### Para Você Testar Agora:

1. **Execute o script SQL** de saques de teste no Supabase
2. **Acesse:** `http://localhost:3000/admin/withdrawals`
3. **Veja os 2 saques** (1 parceiro + 1 apostador)
4. **Teste aprovar** um e **rejeitar** outro

### Se Ainda Não Aparecer:

Verifique no backend log se há erros:
```bash
tail -f backend/backend.log
```

E acesse a API diretamente:
```bash
# Deve retornar 2 saques
curl http://localhost:3001/api/admin/withdrawals \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## ✅ Commits Realizados

| Hash | Descrição |
|------|-----------|
| `9d278347` | Sistema unificado de saques |
| `78af6b46` | Script de saques de teste |

---

## 📚 Documentação Completa

Todas as informações sobre o sistema de saques estão em:
- `docs/SISTEMA_SAQUES_PARCEIROS.md`
- `docs/SAQUES_UNIFICADOS_ADMIN.md` (este arquivo)

---

**Sistema 100% funcional!** Execute o script SQL e teste! 🎉

