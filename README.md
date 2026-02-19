# SatMaza — Backend API

API REST para o sistema de Solicitações de Assistência Técnica (SAT) da Maza. Gerencia o ciclo de vida completo das SATs, desde a abertura pelo representante até a conclusão da análise técnica (AVT) e envio de notificações por email.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | NestJS 11 + TypeScript 5.7 |
| Banco principal | PostgreSQL 16 (TypeORM 0.3) |
| Banco legado | MySQL (ERP AUTCOM) |
| Autenticação | JWT + Passport + bcrypt |
| Armazenamento | Azure Blob Storage |
| Email | Microsoft Graph API |
| PDF | PDFKit |
| Deploy | Docker Compose + Nginx |
| Documentação | Swagger / OpenAPI |

---

## Módulos

| Módulo | Responsabilidade |
|---|---|
| `auth` | Login, logout, JWT, blacklist de tokens, RBAC |
| `usuario` | Cadastro e gestão de usuários (5 roles) |
| `sat` | CRUD de SATs, status, redirecionamento, dashboard |
| `avt` | Averiguação Técnica vinculada à SAT |
| `mediaAttachment` | Upload/download de evidências e laudos via Azure |
| `mail` | Notificações por email com PDF anexado |
| `shared/erp` | Consultas ao ERP legado (MySQL) |
| `health` | Endpoints de health check para monitoramento |

### Roles de usuário

| Role | Acesso |
|---|---|
| `ADMIN` | Acesso total |
| `ORQUESTRADOR` | Gerencia e distribui SATs |
| `BAGUA` | Laboratório Base Água |
| `BSOLVENTE` | Laboratório Base Solvente |
| `REPRESENTANTE` | Abre SATs e acompanha status |

---

## Pré-requisitos

- Node.js 22+
- Docker + Docker Compose (para produção)
- Credenciais Azure (Blob Storage + Graph API)

---

## Configuração do Ambiente

Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `DB_HOST` | Host do PostgreSQL (`localhost` em dev, `postgres` em Docker) |
| `DB_PORT` | Porta do PostgreSQL (padrão: `5432`) |
| `DB_USER` | Usuário do banco |
| `DB_PASS` | Senha do banco |
| `DB_DATABASE` | Nome do banco (`dbsatmaza`) |
| `ERP_HOST` | Host do MySQL do ERP |
| `ERP_PORT` | Porta do MySQL |
| `ERP_USER` | Usuário do ERP |
| `ERP_PASS` | Senha do ERP |
| `ERP_DB` | Database do ERP (`AUTCOM`) |
| `JWT_SECRET` | Segredo JWT — gere com `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `AZURE_STORAGE_ACCOUNT_NAME` | Nome da conta Azure Storage |
| `AZURE_STORAGE_ACCOUNT_KEY` | Chave da conta Azure Storage |
| `AZURE_STORAGE_CONTAINER_NAME` | Nome do container de blobs |
| `AZURE_TENANT_ID` | Tenant ID do Azure AD |
| `AZURE_CLIENT_ID` | Client ID do App Registration |
| `AZURE_CLIENT_SECRET` | Client Secret do App Registration |
| `MAIL_SENDER_UPN` | Email remetente (UPN do usuário no Graph) |
| `MAIL_NOTIFICACAO_SAT` | Email de notificação de SATs |
| `PORT` | Porta da API (padrão: `3040`) |

---

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar em modo watch
npm run start:dev
```

A API sobe em `http://localhost:3040`.
Documentação Swagger disponível em `http://localhost:3040/api`.

---

## Banco de Dados (Migrations)

O projeto usa **TypeORM Migrations** em produção. Em desenvolvimento, o `synchronize` está habilitado automaticamente.

```bash
# Rodar todas as migrations pendentes
npm run migration:run

# Criar nova migration
npm run migration:generate -- src/migrations/NomeDaMigration

# Reverter última migration
npm run migration:revert

# Ver status das migrations
npm run migration:show
```

---

## Build

```bash
npm run build
# Saída gerada em dist/
```

---

## Deploy com Docker Compose

### Setup inicial (1x na VPS)

```bash
# 1. Instalar Docker
curl -fsSL https://get.docker.com | sh && systemctl enable docker

# 2. Clonar o repositório
git clone <URL_DO_REPO> /opt/satmaza && cd /opt/satmaza

# 3. Criar o arquivo de variáveis de produção
cp .env.example .env.production
nano .env.production
# Atenção: DB_HOST deve ser "postgres" (nome do serviço no compose)

# 4. Subir os containers
docker compose up -d

# 5. Rodar as migrations no banco recém-criado
docker compose exec api npx typeorm migration:run -d dist/config/ormconfig.js
```

### Configurar Nginx (reverse proxy)

Crie `/etc/nginx/sites-available/satmaza`:

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3040;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 60M;
        proxy_read_timeout 120s;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/satmaza /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL gratuito com Let's Encrypt
certbot --nginx -d api.seudominio.com
```

### Deployar atualizações

```bash
./deploy.sh
```

O script faz automaticamente: `git pull` → build da imagem → migrations → restart dos containers.

---

## Comandos Docker úteis

```bash
# Ver status dos containers
docker compose ps

# Acompanhar logs em tempo real
docker compose logs api -f
docker compose logs postgres -f

# Acessar o banco diretamente
docker compose exec postgres psql -U satmaza_user -d dbsatmaza

# Reiniciar apenas a API (após atualização manual)
docker compose restart api

# Parar tudo (dados persistem no volume)
docker compose down

# Parar e apagar o banco (CUIDADO: destrói os dados)
docker compose down -v
```

---

## Health Check

```bash
# Verifica PostgreSQL + ERP MySQL
GET /health

# Verifica apenas o PostgreSQL
GET /health/db

# Verifica conectividade Azure
GET /health/azure
```

Resposta esperada:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "erp_mysql": { "status": "up" }
  }
}
```

---

## Estrutura do Projeto

```
src/
├── auth/               # JWT, guards, estratégias, token blacklist
├── avt/                # Averiguação Técnica (AVT)
├── common/
│   ├── dto/            # PaginationDto, PaginatedResult
│   └── filters/        # HttpExceptionFilter (erros padronizados)
├── config/
│   └── ormconfig.ts    # DataSource para migrations CLI
├── health/             # Endpoints /health, /health/db, /health/azure
├── mail/               # Notificações por email com PDF (retry automático)
├── mediaAttachment/    # Upload/download Azure Blob Storage
├── migrations/         # Histórico de migrations do banco
├── sat/                # SATs, dashboard, filtros, paginação
├── shared/
│   └── erp/            # Consultas ao ERP MySQL legado
└── usuario/            # Gestão de usuários e roles
```

---

## Paginação nas Listagens

Os endpoints de listagem de SAT suportam paginação via query params:

```
GET /sat?page=1&limit=20
GET /sat/status/PENDENTE?page=2&limit=10
GET /sat/laboratorio/BASE_AGUA?page=1&limit=50
GET /sat/representante/123?page=1&limit=20
```

Resposta:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Testes

```bash
# Unitários
npm run test

# Com cobertura
npm run test:cov

# E2E
npm run test:e2e
```
