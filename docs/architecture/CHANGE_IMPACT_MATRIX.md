# Lumora Change-Impact Matrix & Governance Review Checklist

> **STATUS**: Mandatory Engineering Review Checklist  
> **LAST RECONCILED**: 2026-08-10  

---

## 1. Change-Impact Review Matrix

Before submitting code changes, human developers and AI coding agents MUST consult this matrix to determine the required layer reviews and verification tests:

| Change Description | Affected Monorepo Package | Modifies DB Schema? | Requires Security Review? | Requires Architecture Review? | Required Verification Tests |
|---|---|:---:|:---:|:---:|---|
| **Color Tokens / Typography Scale** | `packages/theme` | **NO** | NO | NO | Theme unit tests |
| **Button / Card UI Components** | `packages/ui` | **NO** | NO | NO | Component unit tests |
| **Navigation Flows / Screen Layout** | `apps/mobile` | **NO** | NO | NO | Screen rendering tests |
| **Add Object `typeKey` (e.g. `BOOK`)** | `@lumora/shared` enum | **NO** | NO | Domain Review | Typecheck + DTO tests |
| **Add Attribute Field to Schema** | `SchemaRegistry` | **NO** (JSON attribute) | NO | Domain Review | Attribute validation tests |
| **Add Relationship Type** | `@lumora/shared` enum | **NO** | NO | Domain Review | Relationship API tests |
| **Modify API DTO / Response Shape** | `apps/backend/src/**/dto/*` | **NO** | MAYBE | Application Review | API contract tests |
| **New API Endpoint** | `apps/backend/src/**/controllers/*` | **NO** | YES | Architecture Review | Integration tests |
| **Remove/Rename Endpoint** | API Controllers | **NO** | YES | **MANDATORY** | API contract tests |
| **New Top-Level DB Column** | `prisma/schema.prisma` | **YES** | MAYBE | **MANDATORY** | Migration + DB tests |
| **Remove Top-Level DB Column** | `prisma/schema.prisma` | **YES (Data Loss)** | YES | **MANDATORY** | Migration + Rollback test |
| **New DB Model / Table** | `prisma/schema.prisma` | **YES** | YES | **MANDATORY** | Migration + DB tests |
| **Workspace Isolation Logic** | `WorkspaceExecutionContext` | **NO** | **MANDATORY** | **MANDATORY** | Isolation test suite |
| **CAS Concurrency Logic** | `PrismaObjectRepository` | **NO** | NO | **MANDATORY** | Real PostgreSQL CAS suite |
| **JWT / Authentication Service** | `apps/backend/src/modules/auth/*` | **NO** | **MANDATORY** | **MANDATORY** | Auth test suite |
| **RBAC / Permission Rules** | `apps/backend/src/modules/rbac/*` | **NO** | **MANDATORY** | Architecture Review | Permission guard tests |
| **Offline / Sync Architecture** | `apps/mobile` + Backend | MAYBE | **MANDATORY** | **MANDATORY** | E2E Sync tests |
