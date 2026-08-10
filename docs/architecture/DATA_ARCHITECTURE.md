# Lumora Data & Persistence Architecture

> **STATUS**: Authoritative Persistence & Database Specification  
> **LAST RECONCILED**: 2026-08-10  

---

## 1. Universal Object Persistence Model

Lumora persists all domain entities inside a single PostgreSQL table named `"Object"`.

```sql
CREATE TABLE "Object" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
    "spaceId" UUID REFERENCES "Space"("id") ON DELETE SET NULL,
    "createdById" UUID NOT NULL REFERENCES "User"("id"),
    "updatedById" UUID REFERENCES "User"("id"),
    "objectKey" TEXT NOT NULL,
    "typeKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "emoji" TEXT,
    "cover" TEXT,
    "color" TEXT,
    "pinnedAt" TIMESTAMP(3),
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "status" "ObjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "schemaVersion" INT NOT NULL DEFAULT 1,
    "systemData" JSONB,
    "attributes" JSONB,
    "revision" INT NOT NULL DEFAULT 1,
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Compare-And-Swap (CAS) Concurrency Protocol

All object updates in Tier 1 (`PrismaObjectRepository`) and Tier 2 (`ObjectAggregateRepositoryAdapter`) execute parameterized raw SQL RETURNING statements:

```sql
UPDATE "Object"
SET "title" = $1, "attributes" = $2::jsonb, "revision" = "revision" + 1, "updatedAt" = $3
WHERE "id" = $4 AND "workspaceId" = $5 AND "revision" = $6 AND "status" != 'DELETED'
RETURNING *;
```

### Invariants:
- If 0 rows return, the repository evaluates whether the object was deleted (`ObjectNotFoundException`), archived (`ObjectLifecycleConflictException`), or stale (`ObjectConcurrencyException`).
- Network round-trip window for read-after-write is ZERO.

---

## 3. Multitenancy & Index Coverage

Tenant scope is structurally bound to `WorkspaceExecutionContext`. Key composite indexes:
- `@@index([workspaceId, status])`
- `@@index([workspaceId, typeKey, status])`
- `@@index([workspaceId, updatedAt(sort: Desc), id(sort: Desc)])`
- `@@unique([workspaceId, objectKey])`
