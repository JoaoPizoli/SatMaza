#!/bin/bash
# ──────────────────────────────────────────────
# Script de deploy — SatMaza API
# Uso: ./deploy.sh
# Requer: git, docker, docker compose
# ──────────────────────────────────────────────
set -e

echo ""
echo "═══════════════════════════════════════════"
echo "  SatMaza — Deploy"
echo "═══════════════════════════════════════════"
echo ""

# 1. Atualiza o código
echo "→ [1/5] Atualizando código (git pull)..."
git pull origin main

# 2. Reconstrói a imagem da API
echo "→ [2/5] Construindo imagem Docker da API..."
docker compose build api

# 3. Sobe APENAS o postgres e aguarda ele ficar saudável
#    (necessário antes da migration — o docker compose run precisa
#     que o postgres já esteja registrado na rede interna do Docker)
echo "→ [3/5] Iniciando PostgreSQL e aguardando ficar pronto..."
docker compose up -d postgres

echo "  Aguardando healthcheck do PostgreSQL..."
until docker inspect --format='{{.State.Health.Status}}' satmaza_postgres 2>/dev/null | grep -q "healthy"; do
  printf "."
  sleep 3
done
echo ""
echo "  PostgreSQL pronto!"

# 4. Executa as migrations (postgres já está na rede, DNS resolve corretamente)
echo "→ [4/5] Executando migrations do banco..."
docker compose run --rm \
  api \
  npx typeorm migration:run -d dist/config/ormconfig.js

# 5. Sobe todos os containers com a nova imagem
echo "→ [5/5] Reiniciando containers..."
docker compose up -d

echo ""
echo "✓ Deploy concluído com sucesso!"
echo ""
echo "  Status dos containers:"
docker compose ps
echo ""
echo "  Para acompanhar os logs da API:"
echo "  docker compose logs api -f"
echo ""
