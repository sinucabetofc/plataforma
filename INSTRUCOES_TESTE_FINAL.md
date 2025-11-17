# 🧪 INSTRUÇÕES: Teste Final do Sistema de Apostas

**Data**: 07/11/2025  
**Tempo estimado**: 10 minutos

---

## ✅ O QUE FOI CORRIGIDO

1. ✅ **Ganhos**: Pagam exatamente 2x a aposta
2. ✅ **Perdas**: NÃO reembolsam
3. ✅ **Cancelamento por outros**: Bloqueado
4. ✅ **Modal customizado**: Implementado
5. ✅ **Débito ao criar aposta**: Corrigido (migration 1021)
6. ✅ **Triggers duplicados**: Removidos

---

## 🎬 TESTE COMPLETO - PASSO A PASSO

### Preparação

**1. Backend está rodando?**
```bash
# Ver se está ativo:
lsof -i :3001

# Se não, iniciar:
cd backend
npm start
```

**2. Frontend está rodando?**
```bash
# Ver se está ativo:
lsof -i :3000

# Se não, iniciar:
cd frontend
npm run dev
```

---

### Teste 1: Criar e Cancelar Aposta ⭐

**Objetivo**: Verificar se cancelamento credita apenas o valor apostado

**Passos:**

1. **Acesse**: http://localhost:3000

2. **Faça login** (se não estiver logado)

3. **Anote seu saldo atual**
   ```
   Exemplo: R$ 230,00
   ```

4. **Entre em uma partida ao vivo**
   - Clique em "Partidas"
   - Escolha uma partida com série liberada/em andamento

5. **Faça uma aposta de R$ 10,00**
   - Escolha um jogador
   - Valor: R$ 10,00
   - Clique em "Apostar"

6. **Verifique o saldo APÓS criar aposta**
   ```
   Exemplo: R$ 220,00 (230 - 10)
   ✅ Debitou R$ 10 corretamente
   ```

7. **Cancele a aposta**
   - Clique no botão "🚫 Cancelar Aposta"
   - Confirme no modal customizado
   - Aguarde mensagem de sucesso

8. **Verifique o saldo APÓS cancelar**
   ```
   Esperado: R$ 230,00 (220 + 10)
   ❌ Se for R$ 240,00 → PROBLEMA AINDA EXISTE!
   ✅ Se for R$ 230,00 → PROBLEMA RESOLVIDO!
   ```

---

### Teste 2: Logs do Backend

**Durante o teste acima, verifique os logs:**

```bash
cd backend
tail -f backend.log
```

**Logs esperados:**
```
========================================
🚫 [CANCEL] INÍCIO DO CANCELAMENTO
========================================
Bet ID: [uuid]
User ID: [uuid]
Aposta encontrada:
  - Valor: 10 reais
  - Status atual: pendente
Wallet ANTES do reembolso:
  - Saldo: 220 reais
  - Vai creditar: 10 reais
  - Saldo esperado: 230 reais
✅ Wallet atualizada com sucesso
Wallet DEPOIS do UPDATE:
  - Saldo real: 230 reais     ← DEVE SER 230!
  - Diferença: 10 reais        ← DEVE SER 10!
✅ Transação de reembolso criada
✅ Status da aposta atualizado
========================================
🎯 [CANCEL] RESUMO FINAL
========================================
Saldo INICIAL: 220 reais
Valor REEMBOLSADO: 10 reais
Saldo ESPERADO: 230 reais
Saldo REAL FINAL: 230 reais  ← CHAVE: DEVE SER 230!
DIFERENÇA: 0 reais           ← CHAVE: DEVE SER 0!
========================================
```

**Se DIFERENÇA != 0:** Há um trigger creditando/debitando extra!

---

### Teste 3: Verificar no Supabase

**Execute esta query no SQL Editor:**

```sql
-- Ver última aposta cancelada
WITH last_cancel AS (
  SELECT id, user_id, amount
  FROM bets
  WHERE status = 'cancelada'
  ORDER BY resolved_at DESC
  LIMIT 1
)
SELECT 
  '💰 TRANSAÇÕES DA ÚLTIMA APOSTA CANCELADA' as info,
  t.type,
  t.amount / 100.0 as valor_reais,
  t.balance_before / 100.0 as saldo_antes,
  t.balance_after / 100.0 as saldo_depois,
  t.status,
  t.created_at
FROM last_cancel lc
JOIN transactions t ON t.bet_id = lc.id
ORDER BY t.created_at;
```

**Resultado esperado (CORRETO):**
```
tipo='aposta'    | valor=-10.00 | saldo_antes=230 | saldo_depois=220
tipo='reembolso' | valor=+10.00 | saldo_antes=220 | saldo_depois=230
```

**Resultado incorreto (BUG PERSISTE):**
```
tipo='aposta'    | valor=-10.00 | saldo_antes=230 | saldo_depois=220
tipo='reembolso' | valor=+10.00 | saldo_antes=220 | saldo_depois=230
tipo='ganho'     | valor=+10.00 | saldo_antes=230 | saldo_depois=240  ← EXTRA!
```

---

### Teste 4: Apenas Dono Pode Cancelar

**Passos:**

1. **Usuário A** faz aposta (deve ver botão cancelar)
2. **Usuário B** entra na mesma partida
3. **Verifique**: B NÃO vê botão cancelar nas apostas de A ✅

---

### Teste 5: Ganhos e Perdas

**Ganho:**
```
1. Aposta R$ 20
2. Admin finaliza com vitória
3. ✅ Recebe R$ 40 (2x)
4. ✅ Lucro líquido: R$ 20
```

**Perda:**
```
1. Aposta R$ 20
2. Admin finaliza com derrota
3. ✅ NÃO recebe nada
4. ✅ Perde os R$ 20
```

---

## 📋 CHECKLIST DE VALIDAÇÃO

```
[ ] Backend rodando (porta 3001)
[ ] Frontend rodando (porta 3000)
[ ] Migration 1021 executada no Supabase
[ ] Fez login no sistema
[ ] Teste 1: Cancelamento retorna valor correto ✅
[ ] Teste 2: Logs mostram cálculo correto ✅
[ ] Teste 3: Query no Supabase mostra transações corretas ✅
[ ] Teste 4: Apenas dono vê botão cancelar ✅
[ ] Teste 5: Ganhos pagam 2x ✅
[ ] Teste 6: Perdas não reembolsam ✅
```

---

## 🆘 SE O PROBLEMA PERSISTIR

### 1. Compartilhe os Logs
```bash
cd backend
tail -100 backend.log > logs_cancelamento.txt
```

Envie o arquivo `logs_cancelamento.txt`

### 2. Execute Query de Diagnóstico
```sql
-- No Supabase SQL Editor
\i backend/supabase/migrations/1015_diagnose_specific_bet.sql
```

Compartilhe os resultados

### 3. Verificar Triggers Ativos
```sql
SELECT 
  tgname as trigger,
  tgenabled as ativo
FROM pg_trigger
WHERE tgrelid = 'bets'::regclass
  AND NOT tgisinternal;
```

Compartilhe a lista

---

## 📞 CONTATO

**Arquivos de referência:**
- `RESUMO_TODAS_CORRECOES.md` - Resumo completo
- `PROBLEMA_CANCELAMENTO_DOBRO.md` - Documentação do bug
- `.playwright-mcp/*.png` - Screenshots dos testes

**Migrations importantes:**
- `1012_fix_bet_payout_calculation.sql` - Ganhos e perdas
- `1021_SOLUCAO_DEFINITIVA.sql` - Cancelamento

---

## 🎯 RESULTADO ESPERADO

Após todas as correções:

```
✅ Apostas debitam ao criar
✅ Ganhos pagam 2x
✅ Perdas não reembolsam
✅ Cancelamentos reembolsam 1x (não 2x!)
✅ Apenas dono cancela sua aposta
✅ Modal customizado funcionando
✅ Sistema 100% funcional!
```

---

**BOA SORTE COM O TESTE! 🚀**

**Se funcionar, compartilhe o sucesso!**  
**Se não funcionar, compartilhe os logs!**




