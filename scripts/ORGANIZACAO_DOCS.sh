#!/bin/bash

echo "🗂️  Organizando documentação do SinucaBet..."

# Criar estrutura de pastas
mkdir -p docs/admin
mkdir -p docs/auth
mkdir -p docs/deployment
mkdir -p docs/sprints
mkdir -p docs/tests
mkdir -p docs/sessions
mkdir -p docs/fixes
mkdir -p docs/tutorials
mkdir -p docs/migration
mkdir -p docs/analysis

# ADMIN - Documentos sobre painel administrativo
mv ACESSO_ADMIN_INSTRUCOES.md docs/admin/ 2>/dev/null
mv ADMIN_CREDENTIALS.md docs/admin/ 2>/dev/null
mv ADMIN_PANEL_GUIA.md docs/admin/ 2>/dev/null
mv ADMIN_PRONTO_ACESSE_AGORA.md docs/admin/ 2>/dev/null
mv COMO_ACESSAR_ADMIN.md docs/admin/ 2>/dev/null
mv PAINEL_ADMIN_*.md docs/admin/ 2>/dev/null
mv SUCESSO_ADMIN_*.md docs/admin/ 2>/dev/null
mv MELHORIAS_UI_ADMIN_*.md docs/admin/ 2>/dev/null
mv API_USUARIOS_ADMIN_ESTRUTURA.md docs/admin/ 2>/dev/null

# AUTH - Autenticação e cadastro
mv SISTEMA_AUTENTICACAO_COMPLETO.md docs/auth/ 2>/dev/null
mv TESTE_AUTENTICACAO.md docs/auth/ 2>/dev/null
mv RELATORIO_TESTE_AUTENTICACAO.md docs/auth/ 2>/dev/null
mv RELATORIO_TESTE_SUPABASE_AUTH.md docs/auth/ 2>/dev/null
mv RESUMO_TESTES_AUTENTICACAO.md docs/auth/ 2>/dev/null
mv MIGRACAO_SUPABASE_AUTH.md docs/auth/ 2>/dev/null
mv BUG_CREDENCIAIS_INVALIDAS_CORRIGIDO.md docs/auth/ 2>/dev/null
mv ANALISE_PROBLEMA_CADASTRO_LOGIN.md docs/auth/ 2>/dev/null
mv CORRIGIR_CADASTRO.md docs/auth/ 2>/dev/null
mv TESTE_CADASTRO_*.md docs/auth/ 2>/dev/null
mv DIAGNOSTICO_ERRO_CADASTRO_*.md docs/auth/ 2>/dev/null

# DEPLOYMENT - Deploy e configuração de servidores
mv DEPLOYMENT_COMPLETE.md docs/deployment/ 2>/dev/null
mv RAILWAY_DEPLOY.md docs/deployment/ 2>/dev/null
mv RENDER_DEPLOY.md docs/deployment/ 2>/dev/null
mv VERCEL_DEPLOY.md docs/deployment/ 2>/dev/null
mv SERVERS_STATUS.md docs/deployment/ 2>/dev/null

# SPRINTS - Relatórios de sprints
mv SPRINT_*.md docs/sprints/ 2>/dev/null
mv TASKS_POR_SPRINT.md docs/sprints/ 2>/dev/null
mv FINAL_SPRINT_*.md docs/sprints/ 2>/dev/null

# TESTS - Relatórios de testes
mv TESTE_*.md docs/tests/ 2>/dev/null
mv RELATORIO_TESTE_*.md docs/tests/ 2>/dev/null
mv RELATORIO_TESTES_*.md docs/tests/ 2>/dev/null
mv RELATORIO_FINAL_TESTES_*.md docs/tests/ 2>/dev/null
mv CHECKLIST_VALIDACAO_PRD.md docs/tests/ 2>/dev/null

# SESSIONS - Resumos de sessões
mv SESSAO_*.md docs/sessions/ 2>/dev/null
mv RESUMO_SESSAO_*.md docs/sessions/ 2>/dev/null
mv CONQUISTAS_*.md docs/sessions/ 2>/dev/null

# FIXES - Correções aplicadas
mv CORRECAO_*.md docs/fixes/ 2>/dev/null
mv CORRECOES_*.md docs/fixes/ 2>/dev/null
mv CORREÇÕES_*.md docs/fixes/ 2>/dev/null
mv CORRIGIR_*.md docs/fixes/ 2>/dev/null

# MIGRATION - Migrations e banco de dados
mv COMO_APLICAR_MIGRATIONS.md docs/migration/ 2>/dev/null
mv EXECUTAR_MIGRATION_*.md docs/migration/ 2>/dev/null
mv MIGRACAO_*.md docs/migration/ 2>/dev/null
mv RELATORIO_FINAL_MIGRACAO.md docs/migration/ 2>/dev/null
mv MIGRATION_COMPLETA_PLAYERS.sql docs/migration/ 2>/dev/null

# ANALYSIS - Análises técnicas
mv ANALISE_*.md docs/analysis/ 2>/dev/null
mv DIAGNOSTICO_*.md docs/analysis/ 2>/dev/null

# TUTORIALS - Guias e tutoriais
mv GUIA_*.md docs/tutorials/ 2>/dev/null
mv COMO_*.md docs/tutorials/ 2>/dev/null
mv RODAR_AQUI.md docs/tutorials/ 2>/dev/null
mv EXECUTAR_*.md docs/tutorials/ 2>/dev/null
mv EXECUTE_*.md docs/tutorials/ 2>/dev/null
mv INSTRUCOES_*.md docs/tutorials/ 2>/dev/null
mv PROXIMO_PASSO_DESENVOLVIMENTO.md docs/tutorials/ 2>/dev/null

# IMPLEMENTATION - Implementações
mv IMPLEMENTACAO_*.md docs/ 2>/dev/null
mv FRONTEND_*.md docs/ 2>/dev/null
mv SISTEMA_*.md docs/ 2>/dev/null
mv MODAL_*.md docs/ 2>/dev/null
mv FUNCIONALIDADE_*.md docs/ 2>/dev/null
mv JOGADORES_IMPLEMENTADO.md docs/ 2>/dev/null
mv HEADER_NAVEGACAO_COMPLETA.md docs/ 2>/dev/null
mv MUDANCAS_IMPLEMENTADAS_RESUMO.md docs/ 2>/dev/null

# COLORS & UI
mv ALTERACOES_*.md docs/ 2>/dev/null
mv CORES_*.md docs/ 2>/dev/null
mv VERSAO_FINAL_PARTIDAS.md docs/ 2>/dev/null

# MISC
mv RESUMO_*.md docs/sessions/ 2>/dev/null
mv LOGS_MELHORADOS.md docs/ 2>/dev/null
mv MCP_SUPABASE_QUERIES.md docs/ 2>/dev/null
mv TROUBLESHOOTING_PERFIL.md docs/tutorials/ 2>/dev/null
mv VERIFICAR_SUPABASE.md docs/tutorials/ 2>/dev/null

# PRD & DECISIONS
mv PRD_*.md docs/ 2>/dev/null
mv DECISOES_MVP.md docs/ 2>/dev/null

# BACKEND ANÁLISE
mv ANALISE_BACKEND_FRONTEND_ATUAL.md docs/analysis/ 2>/dev/null

echo "✅ Organização completa!"
echo "📊 Estrutura criada:"
echo "   docs/admin/ - Painel administrativo"
echo "   docs/auth/ - Autenticação"
echo "   docs/deployment/ - Deploy"
echo "   docs/sprints/ - Sprints"
echo "   docs/tests/ - Testes"
echo "   docs/sessions/ - Sessões"
echo "   docs/fixes/ - Correções"
echo "   docs/tutorials/ - Tutoriais"
echo "   docs/migration/ - Migrations"
echo "   docs/analysis/ - Análises"
