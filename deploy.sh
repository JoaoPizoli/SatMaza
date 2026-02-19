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
echo "→ [1/4] Atualizando código (git pull)..."
git pull origin main

# 2. Reconstrói a imagem da API
echo "→ [2/4] Construindo imagem Docker da API..."
docker compose build api

# 3. Executa as migrations antes de trocar a imagem
echo "→ [3/4] Executando migrations do banco..."
docker compose run --rm \
  -e DB_HOST=postgres \
  api \
  npx typeorm migration:run -d dist/config/ormconfig.js

# 4. Reinicia os containers com a nova imagem
echo "→ [4/4] Reiniciando containers..."
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
