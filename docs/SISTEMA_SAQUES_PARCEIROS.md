# 💰 Sistema de Saques para Parceiros - Documentação Completa

## 📋 Visão Geral

Sistema completo de gerenciamento de saques para parceiros/influencers da plataforma. Permite que parceiros solicitem saques de suas comissões e que admins aprovem ou rejeitem manualmente após efetuar o PIX.

---

## 🎯 Funcionalidades Implementadas

### Para Parceiros (Influencers)
✅ Visualizar saldo disponível para saque  
✅ Solicitar novo saque (valor mínimo: R$ 50,00)  
✅ Visualizar histórico completo de saques  
✅ Cancelar saques pendentes  
✅ Ver chave PIX que será utilizada  
✅ Ver motivo de rejeição (se aplicável)  

### Para Admins
✅ Listar todos os saques com filtros  
✅ Ver informações completas (nome, telefone, chave PIX)  
✅ Aprovar saques (deduz automaticamente do saldo)  
✅ Rejeitar saques (com motivo obrigatório)  
✅ Estatísticas (total, pendentes, aprovados, rejeitados)  

---

## 📊 Estrutura do Banco de Dados

### Tabela: `influencer_withdrawals`

```sql
CREATE TABLE influencer_withdrawals (
    id UUID PRIMARY KEY,
    influencer_id UUID REFERENCES influencers(id),
    amount DECIMAL(10, 2) NOT NULL,
    
    -- Dados PIX (copiados no momento da solicitação)
    pix_key VARCHAR(255) NOT NULL,
    pix_type pix_type_enum NOT NULL,
    
    -- Status
    status withdrawal_status_enum DEFAULT 'pending',
    
    -- Datas
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    
    -- Referências
    approved_by UUID REFERENCES users(id),
    rejected_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- Metadados
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ENUM: `withdrawal_status_enum`

```sql
CREATE TYPE withdrawal_status_enum AS ENUM (
    'pending',     -- Aguardando aprovação
    'approved',    -- Aprovado e pago
    'rejected',    -- Rejeitado pelo admin
    'cancelled'    -- Cancelado pelo parceiro
);
```

---

## 🔐 Row Level Security (RLS)

### Políticas Implementadas

1. **Parceiros** podem:
   - Ver apenas seus próprios saques
   - Criar novos saques
   - Cancelar saques pendentes

2. **Admins** podem:
   - Ver todos os saques
   - Aprovar/rejeitar qualquer saque

3. **Validações automáticas**:
   - Saldo disponível é verificado antes de criar saque
   - Saques pendentes são considerados no cálculo de saldo

---

## 🔄 Fluxo Completo

### 1. Parceiro Solicita Saque

```
Parceiro → Página Saques → Informa valor → Confirma
         ↓
API valida saldo disponível
         ↓
Saque criado com status 'pending'
         ↓
Notificação: "Saque solicitado com sucesso!"
```

### 2. Admin Aprova Saque

```
Admin → Página Admin Withdrawals → Ver saque pendente
       ↓
Admin realiza PIX manualmente
       ↓
Admin clica em "Aprovar Saque"
       ↓
Sistema deduz valor do saldo do parceiro
       ↓
Status atualizado para 'approved'
       ↓
Notificação: "Saque aprovado com sucesso!"
```

### 3. Admin Rejeita Saque

```
Admin → Página Admin Withdrawals → Ver saque pendente
       ↓
Admin clica em "Rejeitar"
       ↓
Admin informa motivo (obrigatório)
       ↓
Status atualizado para 'rejected'
       ↓
Parceiro pode ver motivo da rejeição
```

### 4. Parceiro Cancela Saque

```
Parceiro → Histórico de Saques → Saque Pendente
         ↓
Clica em "Cancelar Saque"
         ↓
Confirma ação
         ↓
Status atualizado para 'cancelled'
         ↓
Valor volta a ficar disponível para novo saque
```

---

## 🛠️ Arquitetura Backend

### Service: `influencer-withdrawals.service.js`

**Funções principais:**

| Função | Descrição | Permissão |
|--------|-----------|-----------|
| `requestWithdrawal()` | Solicitar novo saque | Influencer |
| `listWithdrawals()` | Listar saques | Influencer/Admin |
| `getWithdrawalById()` | Buscar saque específico | Influencer/Admin |
| `approveWithdrawal()` | Aprovar saque | Admin |
| `rejectWithdrawal()` | Rejeitar saque | Admin |
| `cancelWithdrawal()` | Cancelar saque | Influencer |
| `getWithdrawalsStats()` | Estatísticas | Admin |

### Routes

**Parceiros:**
```
POST   /api/influencers/withdrawals        - Solicitar saque
GET    /api/influencers/withdrawals        - Listar meus saques
GET    /api/influencers/withdrawals/:id    - Ver saque específico
DELETE /api/influencers/withdrawals/:id    - Cancelar saque
```

**Admin:**
```
GET    /api/admin/withdrawals              - Listar todos
GET    /api/admin/withdrawals/stats        - Estatísticas
GET    /api/admin/withdrawals/:id          - Ver específico
PATCH  /api/admin/withdrawals/:id/approve  - Aprovar
PATCH  /api/admin/withdrawals/:id/reject   - Rejeitar
```

---

## 🎨 Frontend

### Páginas Criadas

1. **`/parceiros/saques`** - Página do parceiro
   - Solicitar novo saque
   - Ver saldo disponível
   - Histórico de saques
   - Cancelar saques pendentes

2. **`/admin/withdrawals`** - Página do admin
   - Listar todos os saques
   - Filtrar por status
   - Aprovar/rejeitar saques
   - Ver informações completas

### Hooks React Query

**Para Parceiros:**
```javascript
import { 
  useInfluencerWithdrawals,
  useRequestWithdrawal,
  useCancelWithdrawal 
} from '../hooks/useInfluencerWithdrawals';
```

**Para Admins:**
```javascript
import {
  useWithdrawals,
  useApproveWithdrawal,
  useRejectWithdrawal,
  useWithdrawalsStats
} from '../hooks/admin/useWithdrawals';
```

---

## 📝 Validações Implementadas

### No Backend

1. ✅ Valor mínimo de R$ 50,00
2. ✅ Saldo disponível suficiente
3. ✅ Saques pendentes são descontados do saldo disponível
4. ✅ Apenas saques `pending` podem ser cancelados
5. ✅ Apenas saques `pending` podem ser aprovados/rejeitados
6. ✅ Motivo obrigatório para rejeição
7. ✅ Chave PIX copiada do perfil no momento da solicitação

### No Frontend

1. ✅ Formatação de moeda brasileira
2. ✅ Validação de valor mínimo
3. ✅ Confirmação antes de cancelar
4. ✅ Loading states em todas as ações
5. ✅ Toasts de sucesso/erro

---

## 🔒 Segurança

1. **RLS habilitado** - Cada usuário só vê seus dados
2. **Autenticação obrigatória** - Todas as rotas requerem token
3. **Autorização por role** - Admin vs Influencer
4. **Validação de saldo** - Trigger automático no banco
5. **Auditoria completa** - Logs de quem aprovou/rejeitou e quando

---

## 🧪 Como Testar

### 1. Aplicar Migration

```bash
# No Supabase SQL Editor
Execute: backend/supabase/migrations/1034_create_influencer_withdrawals.sql
```

### 2. Testar como Parceiro

1. Acesse `/parceiros/saques`
2. Veja saldo disponível
3. Solicite um saque de R$ 100,00
4. Veja o saque aparecer no histórico como "Pendente"
5. Tente cancelar o saque

### 3. Testar como Admin

1. Acesse `/admin/withdrawals`
2. Veja o saque pendente
3. Clique em "Aprovar Saque"
4. Confirme a aprovação
5. Veja o saque mudar para "Aprovado"

### 4. Testar Rejeição

1. Crie novo saque como parceiro
2. Como admin, clique em "Rejeitar"
3. Informe motivo: "Dados bancários incorretos"
4. Como parceiro, veja o motivo no histórico

---

## 📦 Commits

| Hash | Descrição |
|------|-----------|
| `19c34129` | Backend + Hooks (migration, service, routes) |
| `3c2538fc` | Página de saques do parceiro |
| `3e1888a2` | Página admin de aprovação |

---

## 🚀 Próximos Passos (Opcional)

- [ ] Notificações por email quando saque é aprovado/rejeitado
- [ ] Limite diário/semanal de saques
- [ ] Histórico de saques em PDF
- [ ] Webhook para notificar parceiro
- [ ] Dashboard de estatísticas avançadas
- [ ] Exportar relatório de saques

---

## ⚠️ Importante

### Para o Admin
- **SEMPRE efetue o PIX antes de aprovar** no sistema
- Verifique os dados bancários cuidadosamente
- Ao aprovar, o valor é **automaticamente deduzido** do saldo

### Para o Parceiro
- Chave PIX é copiada do seu perfil no momento da solicitação
- Alterações no perfil **não afetam** saques já solicitados
- Saques pendentes **bloqueiam** o valor do saldo disponível

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do backend
2. Verifique as permissões RLS no Supabase
3. Verifique se a migration foi aplicada corretamente

---

**Sistema implementado e testado em 10/11/2025** ✅

