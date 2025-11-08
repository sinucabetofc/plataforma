# 📚 DOCUMENTAÇÃO COMPLETA - INTEGRAÇÃO WOOVI PIX

## 📌 Visão Geral

Esta documentação contém todas as informações técnicas necessárias para integrar o provedor de pagamento PIX Woovi ao sistema SinucaBet. A integração permite que usuários façam depósitos instantâneos via PIX, com atualização automática de saldo.

---

## 📂 Estrutura da Documentação

### 🚀 [WOOVI_QUICK_START.md](./WOOVI_QUICK_START.md)
**Comece por aqui!**

Guia rápido e prático para implementação. Ideal para desenvolvedores que querem começar rapidamente.

**Contém:**
- TL;DR / Resumo executivo
- Passo a passo simplificado
- Código mínimo necessário
- Checklist de implementação
- Troubleshooting comum
- Teste rápido local

**Tempo de leitura:** ~10 minutos  
**Nível:** Iniciante/Intermediário

---

### 📘 [INTEGRACAO_WOOVI_PIX.md](./INTEGRACAO_WOOVI_PIX.md)
**Documentação técnica completa**

Detalhes aprofundados da API Woovi, webhooks, autenticação e fluxos completos.

**Contém:**
- 🔑 Autenticação (AppID)
- 💰 Criar Cobrança PIX (endpoint, body, resposta)
- 🧾 Webhook de Confirmação (payload completo)
- 🔁 Consulta de Status
- 🔧 Integração Backend (código completo)
- 📊 Modelo de Tabela (SQL)
- 🔄 Fluxo Completo (diagrama)
- 🧪 Ambiente de Teste
- 📝 Observações Importantes

**Tempo de leitura:** ~30 minutos  
**Nível:** Intermediário/Avançado

---

### 💻 [INTEGRACAO_WOOVI_FRONTEND_EXAMPLES.md](./INTEGRACAO_WOOVI_FRONTEND_EXAMPLES.md)
**Exemplos práticos de código frontend**

Componentes React completos e prontos para usar.

**Contém:**
- 🎨 Modal de Depósito (componente completo)
- 🎯 Botões de Valores Rápidos
- 📊 Página de Histórico de Transações
- 🔔 Sistema de Notificações (toast)
- 🎨 Componente de Saldo em Tempo Real
- ✅ Validações e Helpers
- 🔄 WebSocket (alternativa ao polling)
- 📱 Responsividade
- 🧪 Testes com Jest

**Tempo de leitura:** ~20 minutos  
**Nível:** Intermediário

---

## 🗺️ Fluxo de Leitura Recomendado

### Para Desenvolvedores Backend

```
1. WOOVI_QUICK_START.md (seção Backend)
   ↓
2. INTEGRACAO_WOOVI_PIX.md (seção Autenticação + Criar Cobrança + Webhook)
   ↓
3. INTEGRACAO_WOOVI_PIX.md (seção Integração Backend)
   ↓
4. Implementar código
   ↓
5. WOOVI_QUICK_START.md (seção Teste Rápido)
```

### Para Desenvolvedores Frontend

```
1. WOOVI_QUICK_START.md (seção Frontend)
   ↓
2. INTEGRACAO_WOOVI_PIX.md (seção Criar Cobrança - campos da resposta)
   ↓
3. INTEGRACAO_WOOVI_FRONTEND_EXAMPLES.md (todos os exemplos)
   ↓
4. Implementar componentes
   ↓
5. WOOVI_QUICK_START.md (seção Checklist)
```

### Para Tech Lead / Arquiteto

```
1. WOOVI_QUICK_START.md (TL;DR + Fluxo Visual)
   ↓
2. INTEGRACAO_WOOVI_PIX.md (documento completo)
   ↓
3. INTEGRACAO_WOOVI_FRONTEND_EXAMPLES.md (visão geral)
   ↓
4. Validar arquitetura proposta
```

---

## 🎯 O que Você Vai Aprender

### Conceitos Técnicos
- ✅ Autenticação Header-Based (AppID)
- ✅ Criação de cobranças PIX dinâmicas
- ✅ Processamento de Webhooks
- ✅ Idempotência de transações
- ✅ Polling vs WebSocket
- ✅ Validações de valores
- ✅ Tratamento de erros

### Implementação Prática
- ✅ Serviço de integração com API externa
- ✅ Controller de depósitos
- ✅ Controller de webhooks
- ✅ Modelo de dados (SQL)
- ✅ Componentes React
- ✅ Gestão de estado
- ✅ UX de pagamento

---

## 🛠️ Stack Técnica

### Backend
- **Runtime:** Node.js
- **Framework:** Express/Fastify
- **Banco de Dados:** PostgreSQL (Supabase)
- **HTTP Client:** Axios
- **Validação:** Manual (pode usar Zod/Joi)

### Frontend
- **Framework:** React/Next.js
- **Estilo:** TailwindCSS
- **QR Code:** react-qr-code
- **Notificações:** react-toastify
- **HTTP Client:** Axios/Fetch

### Infraestrutura
- **Provedor PIX:** Woovi (OpenPix)
- **Ambiente de Teste:** Ngrok (local) ou domínio público
- **Webhook:** Endpoint público sem autenticação
- **Logs:** Console (pode usar Winston/Pino)

---

## 📋 Pré-requisitos

### Conhecimentos
- [ ] JavaScript/TypeScript intermediário
- [ ] Node.js e Express/Fastify
- [ ] React/Next.js
- [ ] SQL básico
- [ ] Conceitos de REST API
- [ ] Entendimento de webhooks

### Ferramentas
- [ ] Node.js v18+ instalado
- [ ] PostgreSQL/Supabase configurado
- [ ] Editor de código (VS Code recomendado)
- [ ] Terminal/CLI
- [ ] Navegador moderno
- [ ] Ngrok (para testes locais)

### Acessos
- [ ] Conta Woovi criada
- [ ] AppID gerado
- [ ] Acesso ao painel Woovi
- [ ] Acesso ao banco de dados
- [ ] Permissões no repositório

---

## 🚀 Início Rápido (5 minutos)

### 1. Configure o Ambiente

```bash
# Backend
echo "WOOVI_APP_ID=seu_app_id_aqui" >> backend/.env

# Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" >> frontend/.env
```

### 2. Crie a Tabela

```sql
-- Execute no Supabase
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  correlation_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Implemente o Básico

```bash
# Backend
cd backend
npm install axios uuid

# Copie os exemplos de código dos documentos
# - services/wooviService.js
# - controllers/depositController.js
# - controllers/webhookController.js
```

### 4. Teste Localmente

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
ngrok http 3000

# Configure webhook no painel Woovi com a URL do Ngrok
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Woovi Developers](https://developers.woovi.com)
- [API Reference](https://developers.woovi.com/api)
- [Webhooks Guide](https://developers.woovi.com/docs/category/webhook-1)

### Repositórios de Exemplo
- [Woovi GitHub](https://github.com/Open-Pix)
- [SDKs Oficiais](https://developers.woovi.com/docs/category/sdks)

### Comunidade
- Discord Woovi (verificar no site)
- GitHub Issues
- Suporte via painel

---

## 🐛 Problemas Comuns

### "AppID inválido"
➡️ Consulte [WOOVI_QUICK_START.md - Troubleshooting](./WOOVI_QUICK_START.md#troubleshooting)

### "Webhook não chega"
➡️ Consulte [INTEGRACAO_WOOVI_PIX.md - Observações](./INTEGRACAO_WOOVI_PIX.md#-observações-importantes)

### "QR Code não aparece"
➡️ Consulte [INTEGRACAO_WOOVI_FRONTEND_EXAMPLES.md - Modal](./INTEGRACAO_WOOVI_FRONTEND_EXAMPLES.md#-modal-de-depósito)

---

## ✅ Checklist de Implementação

### Planejamento
- [ ] Ler WOOVI_QUICK_START.md
- [ ] Entender fluxo completo
- [ ] Validar requisitos técnicos

### Backend
- [ ] Configurar variáveis de ambiente
- [ ] Criar tabela transactions
- [ ] Implementar wooviService
- [ ] Implementar depositController
- [ ] Implementar webhookController
- [ ] Configurar rotas
- [ ] Adicionar logs
- [ ] Testar endpoints

### Frontend
- [ ] Criar DepositModal
- [ ] Implementar validações
- [ ] Exibir QR Code
- [ ] Implementar polling
- [ ] Atualizar saldo
- [ ] Adicionar notificações
- [ ] Criar página de histórico
- [ ] Testar fluxo completo

### Configuração Woovi
- [ ] Criar conta
- [ ] Gerar AppID
- [ ] Configurar webhook
- [ ] Testar no sandbox
- [ ] Migrar para produção

### Testes
- [ ] Teste local com Ngrok
- [ ] Teste depósito R$ 10
- [ ] Teste depósito R$ 50
- [ ] Teste webhook recebido
- [ ] Teste saldo atualizado
- [ ] Teste histórico exibido
- [ ] Teste validações
- [ ] Teste erros

### Deploy
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Configurar webhook produção
- [ ] Testar em produção
- [ ] Monitorar logs
- [ ] Documentar processo

---

## 📊 Métricas de Sucesso

Após implementação completa, você deve ter:

✅ **Funcional**
- Usuário consegue criar depósito
- QR Code é exibido corretamente
- Webhook é recebido em < 10s
- Saldo é atualizado automaticamente
- Histórico mostra transações

✅ **Técnico**
- Taxa de erro < 5%
- Tempo de resposta API < 2s
- Uptime webhook > 99%
- Todos os logs funcionando

✅ **UX**
- Processo claro e intuitivo
- Feedback visual adequado
- Erros compreensíveis
- Confirmação visível

---

## 🎓 Níveis de Implementação

### Nível 1: MVP (4-6 horas)
- ✅ Criar depósito
- ✅ Exibir QR Code
- ✅ Receber webhook
- ✅ Atualizar saldo

### Nível 2: Completo (8-12 horas)
- ✅ Tudo do Nível 1
- ✅ Página de histórico
- ✅ Validações robustas
- ✅ Tratamento de erros
- ✅ Polling/WebSocket
- ✅ Notificações

### Nível 3: Produção (16-24 horas)
- ✅ Tudo do Nível 2
- ✅ Testes automatizados
- ✅ Logs estruturados
- ✅ Monitoramento
- ✅ Alertas
- ✅ Documentação completa
- ✅ CI/CD

---

## 💡 Dicas Finais

1. **Comece simples** - Implemente o MVP primeiro, depois adicione features
2. **Teste localmente** - Use Ngrok para expor webhook local
3. **Leia os logs** - Sempre adicione logs detalhados
4. **Valide tudo** - Nunca confie em dados do usuário
5. **Use o sandbox** - Teste exaustivamente antes de produção
6. **Documente mudanças** - Mantenha esta documentação atualizada

---

## 🤝 Contribuindo

Encontrou um erro? Tem uma sugestão?

1. Abra uma issue
2. Envie um PR
3. Atualize a documentação

---

## 📞 Suporte

### Dúvidas sobre a integração?
- Consulte os documentos desta pasta
- Verifique o troubleshooting no WOOVI_QUICK_START.md

### Dúvidas sobre a API Woovi?
- Documentação oficial: https://developers.woovi.com
- Suporte Woovi: Painel > Suporte

### Problemas no código?
- Revise os exemplos fornecidos
- Verifique logs de erro
- Consulte a comunidade

---

## 📅 Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | 08/11/2025 | Documentação inicial completa |

---

## 📜 Licença

Esta documentação faz parte do projeto SinucaBet.

---

**Bom desenvolvimento! 🚀**

*Qualquer dúvida, consulte primeiro o [WOOVI_QUICK_START.md](./WOOVI_QUICK_START.md)*

---

**Gerado em**: 08/11/2025  
**Autor**: AI Agent - Cursor  
**Projeto**: SinucaBet - Integração Woovi PIX
