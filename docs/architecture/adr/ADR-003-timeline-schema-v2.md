# ADR-003: Prisma Timeline Schema v2 Audit Columns Migration

## Context & Problem Statement
The legacy `Timeline` Prisma model only persisted 5 base fields: `id`, `objectId`, `startedAt`, `endedAt`, and `timezone`. When `PrismaTimelineRepository` rehydrated `TimelineRecordEntity` domain aggregates, it was forced to synthesize placeholder UUIDs and fallback action values (TD-014 and TD-018) because `workspaceId`, `userId`, `action`, and `metadata` did not exist as physical columns in the database.

Furthermore, querying timeline activity for a workspace or user required fetching unindexed table slices without tenant-scoped filtering, creating performance bottlenecks as transaction volume grows.

## Decision Drivers
- **Data Integrity & Rehydration Accuracy**: `TimelineRecordEntity` aggregates must rehydrate true workspace, user, and action audit data from physical database columns without synthetic fallbacks.
- **Migration Safety**: Schema changes must be purely additive. New columns (`workspaceId`, `userId`, `action`, `metadata`) are nullable (`?`) in the Prisma schema to ensure zero downtime and zero backfill requirements during migration deploy.
- **Query Performance**: Indexing on `workspaceId`, `userId`, and `action` composite access paths eliminates unindexed table scans.
- **Backward Compatibility**: Preserves existing `objectId`, `startedAt`, `endedAt`, `timezone` columns unchanged.

## Decision
We modify the `Timeline` model in `apps/backend/prisma/schema.prisma`:
1. Add `workspaceId String? @db.Uuid`, `userId String? @db.Uuid`, `action String?`, and `metadata Json?`.
2. Add composite database indexes `@@index([workspaceId])`, `@@index([userId])`, and `@@index([action])`.
3. Update `PrismaTimelineRepository` to persist and rehydrate real audit properties directly from/to database columns.
4. Remove all hardcoded synthetic placeholder fallbacks (`TD-014` and `TD-018` resolution).

## Status
Accepted

## Consequences

### Positive
- **Complete Audit Trail**: Read-side temporal ledger records persist exact tenant ID, user ID, action type, and custom JSON metadata payload.
- **Tenant Isolation**: Workspace timeline queries explicitly filter via database index (`WHERE workspaceId = ...`).
- **Elimination of Tech Debt**: Resolves TD-014 and TD-018 cleanly.

### Negative / Trade-offs
- Legacy rows created prior to schema v2 will contain `null` in new audit columns, rehydrating with safe fallbacks in `toDomain()` mapping for historical compatibility.
