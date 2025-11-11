# 🔍 Diagnóstico: Webhook Woovi não está atualizando status

## ⚠️ Problema identificado:

Os depósitos são **creditados na carteira** (saldo está correto), mas a transação **não é marcada como `completed`** automaticamente.

---

## 🔎 Causas possíveis:

### 1. **URL do Webhook não configurada na Woovi**
- O webhook da Woovi precisa estar apontando para: `https://SEU_DOMINIO/api/wallet/webhook/woovi`
- Verifique no painel da Woovi se a URL está configurada

### 2. **Webhook não está sendo enviado**
- A Woovi só envia webhook quando o pagamento é confirmado
- Verifique se há logs no terminal do backend quando você paga um depósito

### 3. **Erro no processamento do webhook**
- O código do webhook está funcionando, mas pode estar falhando silenciosamente
- Verifique os logs do backend

---

## ✅ Como verificar:

### Teste 1: Ver se o webhook está sendo chamado

Faça um depósito e procure nos logs do backend por:
```
📥 [WEBHOOK] Woovi webhook recebido em:
```

**Se NÃO aparecer:** O webhook não está configurado na Woovi  
**Se aparecer:** O webhook está chegando, mas pode estar falhando

### Teste 2: Testar webhook manualmente

Execute este comando para testar o webhook:

```bash
curl -X POST http://localhost:5000/api/wallet/webhook/woovi \
  -H "Content-Type: application/json" \
  -d '{
    "event": "teste_webhook"
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Webhook de teste recebido com sucesso"
}
```

---

## 🔧 Como configurar o Webhook na Woovi:

1. **Acesse:** Painel da Woovi/OpenPix
2. **Vá em:** Configurações → Webhooks
3. **Configure:**
   - **URL:** `https://SEU_DOMINIO_BACKEND/api/wallet/webhook/woovi`
   - **Eventos:** Marque `CHARGE_COMPLETED`
   - **Ativo:** ✅ Sim

4. **Teste:** Clique em "Testar Webhook"

---

## 📋 Logs importantes do webhook:

O webhook está configurado para logar:
- ✅ Quando recebe uma requisição
- ✅ Dados completos (body e headers)
- ✅ Status do processamento
- ✅ Erros se houver

**Localização dos logs:** Terminal onde o backend está rodando

---

## 🚀 Solução temporária:

Enquanto o webhook não está funcionando, use a **Página de Gerenciamento de Depósitos** que vou criar agora para aprovar depósitos manualmente.

---

## 📝 Próximos passos:

1. ✅ Verificar se webhook está configurado na Woovi
2. ✅ Ver logs do backend quando fizer um depósito
3. ✅ Usar página admin para aprovar depósitos manualmente
4. ✅ Configurar webhook corretamente na Woovi

