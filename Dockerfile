# ──────────────────────────────────────────────
# Stage 1: build
# Instala TODAS as dependências e compila o TypeScript
# ──────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copia manifests primeiro (cache de layers)
COPY package*.json ./
RUN npm ci

# Copia o restante do código e faz o build
COPY . .
RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: runner (produção)
# Imagem final leve — apenas dist/ + deps de produção
# ──────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instala apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copia o build gerado no stage anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3040

CMD ["node", "dist/main"]
