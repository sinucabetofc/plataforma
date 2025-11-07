# 🚀 RODAR SINUCABET EM LOCALHOST

## ⚡ MÉTODO RÁPIDO - Execute estes comandos:

```bash
# 1. Ir para a pasta do projeto
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet

# 2. Rodar o script de inicialização
./INICIAR_LOCALHOST.sh
```

**Pronto!** O site vai abrir automaticamente em `http://localhost:3000` 🎉

---

## 📝 O que o script faz:

1. ✅ Verifica Node.js instalado
2. ✅ Cria arquivos `.env` se não existirem
3. ✅ Instala dependências automaticamente
4. ✅ Inicia backend (porta 3001)
5. ✅ Inicia frontend (porta 3000)
6. ✅ Abre o navegador automaticamente

---

## 🔑 CHAVES DO SUPABASE

⚠️ **IMPORTANTE:** Você precisa das chaves corretas!

### Pegar as chaves:

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **atjxmyrkzcumieuayapr**
3. Vá em: **Settings** → **API**
4. Copie:
   - **Project URL** (já configurado ✅)
   - **anon public** → Cole em `frontend/.env.local`
   - **service_role** → Cole em `backend/.env`

---

## 🛠️ MÉTODO MANUAL (Se preferir)

### Terminal 1 - Backend:
```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet/backend
npm install
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet/frontend
npm install
npm run dev
```

Depois acesse: http://localhost:3000

---

## 🐛 PROBLEMAS?

### Erro: "Comando não encontrado"
```bash
# Dar permissão de execução
chmod +x INICIAR_LOCALHOST.sh
```

### Erro: "Port already in use"
```bash
# Matar processos nas portas
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Erro: "Cannot connect to database"
- Verifique se colocou as chaves corretas do Supabase nos arquivos `.env`

---

## 📊 LOGS

Ver logs em tempo real:

```bash
# Backend
tail -f backend.log

# Frontend  
tail -f frontend.log
```

---

## 🛑 PARAR OS SERVIDORES

Pressione **`Ctrl + C`** no terminal onde rodou o script.

---

## ✅ TUDO PRONTO!

Agora é só executar:

```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet
./INICIAR_LOCALHOST.sh
```

🎱 **Bom desenvolvimento!**

