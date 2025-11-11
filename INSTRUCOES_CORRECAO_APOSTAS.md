# 🎯 INSTRUÇÕES RÁPIDAS: Correção de Apostas

**⏱️ Tempo estimado**: 5 minutos  
**🔧 Dificuldade**: Fácil  
**✅ Status**: Pronto para executar

---

## 🚨 Problemas Corrigidos

### 1. Ganhos Duplicados ❌ → ✅
- **Antes**: Aposta R$60, recebia R$180 (R$60 + R$120)
- **Depois**: Aposta R$60, recebe R$120 (2x a aposta)

### 2. Perdas Reembolsadas ❌ → ✅
- **Antes**: Perdia aposta mas recebia dinheiro de volta
- **Depois**: Perde aposta e NÃO recebe reembolso (correto!)

---

## 🎬 PASSO A PASSO

### 1️⃣ Acesse o Supabase

Abra o link no navegador:
```
https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/editor
```

### 2️⃣ Abra o SQL Editor

Clique no menu lateral:
- **SQL Editor** (ícone de banco de dados)
- Depois em **"New Query"** (botão verde)

### 3️⃣ Copie o Código da Migration

Abra o arquivo:
```
backend/supabase/migrations/1012_fix_bet_payout_calculation.sql
```

**Copie TODO o conteúdo** (`Cmd+A` depois `Cmd+C`)

### 4️⃣ Cole e Execute

1. Cole no editor do Supabase (`Cmd+V`)
2. Clique em **"Run"** (ou `Ctrl+Enter`)
3. Aguarde a execução (pode levar alguns segundos)

### 5️⃣ Verifique os Resultados

Você verá várias tabelas mostrando:
- ✅ Apostas ganhas (cálculo correto)
- ✅ Apostas perdidas (sem reembolso)
- ✅ Transações por tipo
- ✅ Reembolsos incorretos revertidos (se houver)

---

## 📊 O Que Esperar

### Mensagens de Sucesso

```
✅ [MIGRATION 1012] Correção de pagamentos de apostas concluída!
📌 Regras implementadas:
  1. Ganhos = 2x aposta (exemplo: aposta R$60, recebe R$120)
  2. Perdas = SEM reembolso (saldo já foi debitado ao apostar)
  3. Reembolsos incorretos em apostas perdidas foram revertidos
```

### Tabelas de Verificação

1. **Apostas por Status**
   - Total de apostas ganhas, perdidas, pendentes, etc.

2. **Transações por Tipo**
   - Débitos (apostas)
   - Créditos (ganhos)
   - Reembolsos (apenas os corretos)

3. **Cálculos de Ganhos**
   - Verifica se todos os ganhos são 2x a aposta

---

## 🧪 Como Testar

### Teste Rápido no Sistema

1. **Login como usuário**
2. **Veja seu saldo atual**
3. **Faça uma aposta pequena** (ex: R$10)
4. **Admin: Finalize a série**
5. **Verifique:**
   - Se ganhou → saldo aumentou R$20
   - Se perdeu → saldo NÃO mudou

---

## ⚠️ IMPORTANTE

### Antes de Executar

- ✅ Faça backup do banco (opcional, mas recomendado)
- ✅ Avise usuários sobre manutenção (se houver muitos)
- ✅ Execute em horário de baixo tráfego

### Depois de Executar

- ✅ Verifique os logs de sucesso
- ✅ Teste com aposta real
- ✅ Monitore por 24h

### Se Algo Der Errado

1. **Não entre em pânico!**
2. Veja os logs de erro no Supabase
3. Consulte: `docs/fixes/FIX_BET_PAYOUT_CALCULATION.md`
4. Se necessário, faça rollback (instruções no documento acima)

---

## 📱 Notificar Usuários? (Opcional)

Se houver reembolsos revertidos, considere avisar:

```
🔧 Manutenção Concluída!

Corrigimos um problema no sistema de apostas:
- ✅ Ganhos agora pagam 2x seu valor (correto)
- ✅ Apostas perdidas não retornam saldo (correto)

Alguns saldos podem ter sido ajustados automaticamente.
Qualquer dúvida, entre em contato!
```

---

## ✅ Checklist Final

- [ ] Acessei o Supabase Dashboard
- [ ] Executei a migration com sucesso
- [ ] Vi as mensagens de confirmação
- [ ] Testei com uma aposta
- [ ] Sistema funcionando corretamente

---

## 🆘 Ajuda Rápida

### Erro de Permissão
→ Verifique se está logado no projeto correto do Supabase

### Erro de Sintaxe SQL
→ Certifique-se de copiar TODO o código (do início ao fim)

### Saldo Negativo Após Correção
→ Normal se usuário já gastou reembolso indevido. Ajuste manualmente se necessário:

```sql
-- Ver usuários com saldo negativo
SELECT u.name, u.email, w.balance / 100.0 as saldo_reais
FROM users u
JOIN wallet w ON w.user_id = u.id
WHERE w.balance < 0;

-- Ajustar manualmente (substitua os valores)
UPDATE wallet
SET balance = 0
WHERE user_id = 'UUID_DO_USUARIO';
```

---

## 📞 Contato

Em caso de dúvidas:
1. Consulte a documentação completa em `docs/fixes/`
2. Veja os logs do sistema em `backend/backend.log`
3. Revise as migrations anteriores em `backend/supabase/migrations/`

---

**Criado em**: 07/11/2025  
**Tempo de execução**: ~5 minutos  
**Impacto**: ✅ Correção crítica, aplique o quanto antes!



