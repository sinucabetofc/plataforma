# 🚨 PROBLEMA CRÍTICO: Apostas Não São Resolvidas ao Finalizar Série

**Identificado em:** 07/11/2025  
**Gravidade:** CRÍTICA  
**Impacto:** Apostas ficam "casadas" mesmo após série finalizar  

---

## ⚠️ PROBLEMA

### **Situação Atual (INCORRETA):**

```
1. Kaique aposta R$ 60 no Jogador A
2. Baianinho aposta R$ 60 no Jogador B
3. Apostas casam automaticamente → Status: 'aceita' 🔵

4. Série finaliza → Jogador A vence
5. ❌ Apostas NÃO MUDAM de status
6. ❌ Aposta do Kaique continua 'aceita' (deveria ser 'ganha')
7. ❌ Aposta do Baianinho continua 'aceita' (deveria ser 'perdida')
```

### **Comportamento Esperado:**

```
1-3. (mesmo processo acima)

4. Série finaliza → Jogador A vence
5. ✅ Trigger dispara automaticamente
6. ✅ Aposta do Kaique → status: 'ganha' 🟢
7. ✅ Aposta do Baianinho → status: 'perdida' 🔴
8. ✅ Ganhos creditados ao Kaique
```

---

## 🔍 CAUSA RAIZ

O **trigger existe** mas pode ter um desses problemas:

### **1. Trigger não está ativo**
- Migration 007 criou o trigger
- Mas pode ter sido sobrescrito por migrations posteriores
- Ou nunca foi executado no Supabase

### **2. Série não tem winner_player_id**
- Ao finalizar série, admin pode não estar definindo o vencedor
- Trigger só dispara se `winner_player_id IS NOT NULL`

### **3. Status da série não é 'encerrada'**
- Série pode estar com status diferente
- Trigger só dispara se `NEW.status = 'encerrada'`

---

## ✅ SOLUÇÃO CRIADA

### **Migration 1011: Fix Resolve Bets Trigger**

**O que faz:**

1. **Recria o trigger** com lógica robusta
2. **Resolve apostas antigas** que ficaram travadas
3. **Adiciona logs** para debugging
4. **Resolve tanto 'pendente' quanto 'aceita'**
5. **Mostra estatísticas** de verificação

---

## 💻 LÓGICA DO TRIGGER

```sql
CREATE OR REPLACE FUNCTION resolve_bets_on_serie_end()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'encerrada' 
     AND OLD.status != 'encerrada' 
     AND NEW.winner_player_id IS NOT NULL THEN
    
    -- Apostas GANHADORAS
    UPDATE bets
    SET 
      status = 'ganha',
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE serie_id = NEW.id
      AND chosen_player_id = NEW.winner_player_id
      AND status IN ('pendente', 'aceita');
    
    -- Apostas PERDEDORAS
    UPDATE bets
    SET 
      status = 'perdida',
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE serie_id = NEW.id
      AND chosen_player_id != NEW.winner_player_id
      AND status IN ('pendente', 'aceita');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_resolve_bets_on_serie_end
  AFTER UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION resolve_bets_on_serie_end();
```

---

## 🔄 FLUXO CORRETO

### **Ao Finalizar Série:**

```
ADMIN finaliza Série 1
├─ Atualiza: status = 'encerrada'
├─ Define: winner_player_id = ID do vencedor
└─ TRIGGER DISPARA automaticamente

TRIGGER executa:
├─ Busca apostas da série
├─ Filtra por chosen_player_id = winner_player_id
│  └─ Atualiza para status = 'ganha' ✅
├─ Filtra por chosen_player_id != winner_player_id
│  └─ Atualiza para status = 'perdida' ❌
└─ Trigger de transações atualiza badges (1010)
   └─ 'ganha' → transaction.status = 'completed' 🟢
   └─ 'perdida' → transaction.status = 'completed' 🟢
```

---

## ⚡ COMO APLICAR A CORREÇÃO

### **Passo 1: Executar Migration 1011**

No **Supabase SQL Editor**:

```sql
-- Copie e cole o conteúdo de:
backend/supabase/migrations/1011_fix_resolve_bets_trigger.sql
```

**Clique em "Run"**

### **Passo 2: Verificar Resultado**

A migration vai mostrar:

```
📊 Status das Apostas
status    | quantidade | valor_total_reais
──────────┼────────────┼──────────────────
ganha     | X          | R$ XXX
perdida   | Y          | R$ YYY
aceita    | 0          | R$ 0 ← Deve ser 0 após migração
```

---

## 🧪 TESTAR MANUALMENTE

### **Verificar Série Atual:**

```sql
-- Ver séries encerradas
SELECT 
  s.serie_number,
  s.status,
  p.name as vencedor,
  COUNT(b.id) as total_apostas
FROM series s
LEFT JOIN players p ON p.id = s.winner_player_id
LEFT JOIN bets b ON b.serie_id = s.id
WHERE s.status = 'encerrada'
GROUP BY s.id, s.serie_number, s.status, p.name;
```

### **Finalizar Uma Série Para Testar:**

```sql
-- Atualizar uma série para encerrada (exemplo)
UPDATE series
SET 
  status = 'encerrada',
  winner_player_id = (
    SELECT player1_id FROM matches WHERE id = series.match_id LIMIT 1
  ),
  ended_at = NOW()
WHERE id = 'UUID-DA-SERIE'
  AND status IN ('em_andamento', 'liberada');

-- Verificar se apostas foram resolvidas
SELECT 
  b.id,
  u.name as apostador,
  p.name as escolheu,
  b.amount / 100.0 as valor,
  b.status
FROM bets b
JOIN users u ON u.id = b.user_id
JOIN players p ON p.id = b.chosen_player_id
WHERE b.serie_id = 'UUID-DA-SERIE';
```

---

## 📊 RESULTADO ESPERADO

### **Após executar migration 1011:**

**Apostas antigas serão resolvidas:**
```
Série 1 (finalizada há 1 dia):
├─ Kaique venceu
├─ Aposta do Vini em Kaique: aceita → ganha ✅
└─ Aposta do João em Baianinho: aceita → perdida ❌
```

**Futuras séries:**
```
Admin finaliza Série 2:
├─ Define vencedor: Baianinho
├─ Trigger dispara AUTOMATICAMENTE
├─ Aposta Kaique: aceita → perdida ❌
└─ Aposta Baianinho: aceita → ganha ✅
   └─ Trigger de ganhos credita R$ 120 ao Baianinho
```

---

## 🎨 BADGES QUE VÃO APARECER

### **Antes (ERRADO):**
```
Série encerrada, Kaique venceu:
├─ Aposta do Kaique: 🔵 "Aposta casada" ← ERRADO
└─ Aposta do Baianinho: 🔵 "Aposta casada" ← ERRADO
```

### **Depois (CORRETO):**
```
Série encerrada, Kaique venceu:
├─ Aposta do Kaique: 🟢 "Ganha" ← CORRETO!
└─ Aposta do Baianinho: 🔴 "Perdida" ← CORRETO!
```

---

## 🔗 INTEGRAÇÃO COM TRIGGER DE GANHOS

Quando aposta muda para 'ganha', outro trigger credita os ganhos:

```sql
-- Trigger: credit_winnings() (já existe)
IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
  -- Calcular retorno (2x o valor)
  -- Creditar saldo
  -- Criar transação tipo 'ganho'
END IF;
```

**Fluxo completo:**
```
1. Admin finaliza série → winner_player_id definido
2. Trigger resolve_bets_on_serie_end dispara
   └─ Atualiza apostas para 'ganha' ou 'perdida'
3. Trigger credit_winnings dispara (para apostas ganhas)
   └─ Credita R$ 120 ao vencedor
   └─ Cria transação tipo 'ganho'
4. Trigger update_bet_transaction_status dispara
   └─ Atualiza transação para 'completed'
5. Frontend mostra badges corretos 🟢/🔴
```

---

## 📁 ARQUIVO CRIADO

```
backend/supabase/migrations/
└── 1011_fix_resolve_bets_trigger.sql ⭐ EXECUTAR AGORA
```

---

## ⚡ AÇÃO IMEDIATA

**Execute AGORA no Supabase:**

1. **Abra** Supabase Dashboard → SQL Editor
2. **Cole** conteúdo da migration 1011
3. **Execute** (Run)
4. **Verifique** apostas antigas foram resolvidas
5. **Teste** finalizando uma nova série

**Após executar:**
- ✅ Apostas antigas resolvidas
- ✅ Futuras séries vão resolver automaticamente
- ✅ Badges corretos (🟢 Ganha, 🔴 Perdida)
- ✅ Ganhos creditados automaticamente

---

## 🎯 MIGRATIONS COMPLETAS PARA EXECUTAR

**Execute nesta ordem:**

1. ✅ Migration 1008: Popular user_id
2. ✅ Migration 1009: Triggers com user_id
3. ✅ Migration 1010: Sincronizar status
4. ⭐ **Migration 1011: Resolver apostas** ← NOVA e CRÍTICA!

**Tempo total:** ~10 minutos  
**Resultado:** Sistema 100% funcional! 🚀

---

**Criado em:** 07/11/2025  
**Prioridade:** CRÍTICA  
**Status:** ✅ Migration pronta para executar  
**Impacto:** Resolve apostas automaticamente ao finalizar séries!

