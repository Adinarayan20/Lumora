# Lumora Security & Access Control Architecture

> **STATUS**: Authoritative Security Architecture Specification  
> **LAST RECONCILED**: 2026-08-10  

---

## 1. Authentication & Token Security

- **JWT Model**: Stateless bearer access tokens (15m expiration) paired with session refresh tokens (7d expiration).
- **Session Token Hashing**: In `SessionRepository`, refresh tokens are hashed using `crypto.createHash('sha256')` before persistence. Plaintext tokens are returned once to the caller and NEVER stored in the database.
- **Password Security**: Hashed via `bcrypt` with salt round 10.
- **Fail-Fast Secrets Invariant**: `TokenService` throws `InternalServerErrorException` at boot if `JWT_SECRET` or `JWT_REFRESH_SECRET` is missing. Hardcoded fallback strings are strictly prohibited.

---

## 2. Authorization & Workspace Multitenancy

- **Workspace Execution Context**: `WorkspaceExecutionContext(workspaceId, userId)` enforces tenant scoping at repository initialization. Repositories automatically append `WHERE workspaceId = context.workspaceId`.
- **Role-Based Access Control (RBAC)**: Endpoint authorization is enforced by `@RequirePermissions()` decorators evaluated by NestJS `PermissionsGuard`.
- **Open Security Fix (P0)**: `PermissionsGuard` currently falls back to `request.params?.id` when `workspaceId` is missing; will be restricted to `request.params?.workspaceId` strictly in P0 remediation.

---

## 3. Web & Transport Security Boundaries

- **CORS Configuration**: CORS will be enabled globally in `main.ts` via `app.enableCors()` during P0 remediation.
- **Validation Pipe**: `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` prevents extra field injection.
- **Rate Limiting**: Auth endpoints (login, register, refresh, password reset) are rate-limited via `RedisRateLimiterGuard`.
