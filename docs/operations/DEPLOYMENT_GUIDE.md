# Lumora Platform Production Deployment Guide

## Prerequisites & Environment Requirements
- **Node.js**: `v22.x` (LTS)
- **pnpm**: `v9.x`
- **PostgreSQL**: `v16+` with UUID extension enabled
- **Docker / Docker Compose**: Recommended for containerized deployment

## Environment Variables Configuration

Ensure the following variables are set in production `.env`:

```env
NODE_ENV=production
PORT=3000

# Database Persistence Connection
DATABASE_URL="postgresql://lumora_user:secure_password@postgres-db:5432/lumora_db?schema=public&connection_limit=20"

# JWT Authentication Secrets
JWT_SECRET="production_jwt_secret_min_64_chars"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="production_refresh_secret_min_64_chars"
JWT_REFRESH_EXPIRATION="7d"

# Operational Timeouts
DEFAULT_AUTH_TRANSACTION_TIMEOUT_MS=60000
DEFAULT_WORKSPACE_TRANSACTION_TIMEOUT_MS=20000
```

## Step-by-Step Production Build & Deployment Pipeline

### 1. Installation & Dependency Assembly
```bash
pnpm install --frozen-lockfile
```

### 2. Database Migration & Client Generation
Execute schema migrations against production database target:
```bash
pnpm --filter @lumora/backend prisma migrate deploy
pnpm --filter @lumora/backend prisma generate
```

### 3. Build Monorepo Bundles
```bash
pnpm run build
```

### 4. Run Quality Verification Gates
```bash
pnpm run typecheck
pnpm run lint
pnpm run test
```

### 5. Launch Node.js Production Process
```bash
pnpm --filter @lumora/backend start:prod
```

## Health Checks & Readiness Probes
- **Liveness Probe**: `GET /api/v1/health` (HTTP 200)
- **Readiness Probe**: `GET /api/v1/health/readiness` (Checks PostgreSQL database pool connectivity)
