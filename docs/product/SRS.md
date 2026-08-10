# Lumora Software Requirements Specification (SRS)

> **STATUS**: Authoritative System Requirements Contract  
> **VERSION**: 1.0.0  
> **LAST RECONCILED**: 2026-08-10 (HEAD `92fb2fe`)  
> **GOAL**: Define the complete functional, non-functional, security, data, and behavioral specifications for Lumora Personal Life Operating System across 21 reconciled requirements (`REQ-OBJ-001` through `REQ-GAME-001`) with strict status discipline.

---

## 1. System Requirements & Reconciled Statuses

Every requirement in this specification is governed by strict status discipline:
- `IMPLEMENTED (FULL)`: Both backend API and mobile/product UI exist and are verified.
- `BACKEND READY (MOBILE MISSING)`: Backend endpoints, aggregate, and outbox exist, but no mobile client or product UI connects to it. Product is **blocked**.
- `PARTIALLY IMPLEMENTED (BACKEND)`: Backend schema or partial use case exists, but logic is incomplete.
- `NOT IMPLEMENTED (APPROVED)`: Feature specification approved, 0% code written.
- `PLANNED`: Roadmap feature approved for future phase.
- `DEFERRED`: Reviewed and deliberately postponed.

---

### REQ-OBJ-001: Universal Attributes Storage
- **Requirement ID**: `REQ-OBJ-001`
- **Version**: `1.0.0`
- **Status**: `IMPLEMENTED (FULL)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/prisma/schema.prisma` (`Object` table `attributes Json?` column)
- **Description**: The system MUST persist all type-specific object data within a single, universal `Object` database table utilizing an indexed JSONB `attributes` column. Introducing new domain object types MUST NOT require database migrations or new table creation.
- **Acceptance Criteria**: Creating a new object type (e.g. `TASK`, `NOTE`, `MEDICINE`) inserts a row into `"Object"` with `typeKey` string and JSON payload in `attributes`.

---

### REQ-OBJ-002: Dynamic Custom Attributes & Metadata
- **Requirement ID**: `REQ-OBJ-002`
- **Version**: `1.0.0`
- **Status**: `IMPLEMENTED (FULL)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/domain/objects/object.aggregate.ts`
- **Description**: Domain objects MUST support dynamic key-value attribute extension without altering top-level database columns.
- **Acceptance Criteria**: Attribute mutations validate against schema definitions while retaining arbitrary un-schema'd metadata properties safely.

---

### REQ-OBJ-003: Dynamic Schema Versioning
- **Requirement ID**: `REQ-OBJ-003`
- **Version**: `1.0.0`
- **Status**: `BACKEND READY (MOBILE MISSING)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/infrastructure/prisma/repositories/prisma-object.repository.ts`
- **Description**: Objects MUST store an integer `schemaVersion` column. Schema updates automatically resolve missing fields via default value initializers.
- **Acceptance Criteria**: Objects rehydrated from persistence populate missing fields with default values defined in `SchemaRegistry`.

---

### REQ-OBJ-004: User-Customizable Schemas
- **Requirement ID**: `REQ-OBJ-004`
- **Version**: `1.0.0`
- **Status**: `NOT IMPLEMENTED (APPROVED)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: None
- **Description**: Users MUST be able to define custom object schemas, custom fields, and validation rules at runtime.
- **Acceptance Criteria**: API allows creating and updating user-defined `ObjectDefinition` schemas per workspace.

---

### REQ-LIFE-001: Optimistic Compare-And-Swap (CAS) Concurrency
- **Requirement ID**: `REQ-LIFE-001`
- **Version**: `1.0.0`
- **Status**: `IMPLEMENTED (FULL)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/infrastructure/prisma/repositories/prisma-object.repository.ts` (Lines 133-147)
- **Description**: Object mutations MUST enforce atomic Compare-And-Swap (CAS) via raw SQL `UPDATE "Object" SET revision = revision + 1 WHERE id = $id AND revision = $expectedRevision RETURNING *`.
- **Acceptance Criteria**: Concurrent writes with mismatched revision numbers throw `ObjectConcurrencyException` without writing stale data.

---

### REQ-LIFE-002: Soft-Delete Scoping
- **Requirement ID**: `REQ-LIFE-002`
- **Version**: `1.0.0`
- **Status**: `IMPLEMENTED (FULL)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/infrastructure/prisma/extensions/soft-delete.extension.ts`
- **Description**: Object deletion MUST update `status = 'DELETED'` and set `deletedAt = NOW()`. All standard queries MUST filter out soft-deleted records by default.
- **Acceptance Criteria**: Calling delete marks `deletedAt` timestamp; subsequent `findMany` queries omit deleted records.

---

### REQ-WS-001: Strict Workspace Isolation
- **Requirement ID**: `REQ-WS-001`
- **Version**: `1.0.0`
- **Status**: `IMPLEMENTED (FULL)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/infrastructure/prisma/context/workspace-execution-context.ts`
- **Description**: Every data access path MUST enforce workspace scoping (`workspaceId`). Workspace A MUST NOT read, mutate, archive, or list objects from Workspace B under any circumstances.
- **Acceptance Criteria**: Queries executed through `WorkspaceExecutionContext` append `WHERE workspaceId = context.workspaceId`.

---

### REQ-AUTH-001: Authentication Engine
- **Requirement ID**: `REQ-AUTH-001`
- **Version**: `1.0.0`
- **Status**: `BACKEND READY (MOBILE MISSING)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/modules/auth/auth.controller.ts`
- **Description**: User registration and login MUST issue short-lived JWT access tokens (15m) and long-lived refresh tokens (7d).
- **Acceptance Criteria**: Backend authenticates credentials, returns JWT tokens; mobile app currently lacks UI login screens.

---

### REQ-AUTH-002: SHA-256 Hashed Refresh Token Storage
- **Requirement ID**: `REQ-AUTH-002`
- **Version**: `1.0.0`
- **Status**: `IMPLEMENTED (FULL)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/modules/auth/repositories/session.repository.ts` (Lines 31-33)
- **Description**: Refresh tokens MUST be hashed using SHA-256 before database storage. Plaintext refresh tokens MUST NEVER be stored in persistence.
- **Acceptance Criteria**: `Session.refreshToken` column contains hex-encoded SHA-256 hash.

---

### REQ-RBAC-001: Role-Based Access Control
- **Requirement ID**: `REQ-RBAC-001`
- **Version**: `1.0.0`
- **Status**: `BACKEND READY (MOBILE MISSING)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/modules/rbac/guards/permissions.guard.ts`
- **Description**: API endpoints MUST enforce permission checks using `@RequirePermissions()` decorators and `PermissionsGuard`.
- **Acceptance Criteria**: Requests lacking required workspace permissions return `403 Forbidden`.

---

### REQ-SEARCH-001: Asynchronous Search Projection Indexing
- **Requirement ID**: `REQ-SEARCH-001`
- **Version**: `1.0.0`
- **Status**: `BACKEND READY (MOBILE MISSING)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/infrastructure/events/outbox/outbox-event-handler.service.ts`
- **Description**: Object state changes MUST asynchronously update the `SearchIndex` projection table via the transactional outbox worker.
- **Acceptance Criteria**: Creating or updating an object automatically triggers search index entry creation/update.

---

### REQ-TIME-001: Event-Driven Outbox Activity Logging
- **Requirement ID**: `REQ-TIME-001`
- **Version**: `1.0.0`
- **Status**: `BACKEND READY (MOBILE MISSING)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/infrastructure/events/outbox/outbox-event-handler.service.ts`
- **Description**: Domain events MUST be staged in `OutboxMessage` table inside `PrismaUnitOfWork.$transaction()` and asynchronously processed to project activity records into `Timeline`.
- **Acceptance Criteria**: Object creation stages outbox event; background worker creates `Timeline` record.

---

### REQ-REL-001: Universal Relationship Engine
- **Requirement ID**: `REQ-REL-001`
- **Version**: `1.0.0`
- **Status**: `BACKEND READY (MOBILE MISSING)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/modules/relationships/relationships.service.ts`
- **Description**: System MUST support bi-directional graph relationship links (`DEPENDS_ON`, `PARENTS`, `REFERENCES`, `BLOCKS`, `ATTACHED_TO`) between any two Universal Objects within a workspace.
- **Acceptance Criteria**: Relationship CRUD endpoints store and list graph links with workspace scoping.

---

### REQ-COLL-001: Static Collection Aggregation
- **Requirement ID**: `REQ-COLL-001`
- **Version**: `1.0.0`
- **Status**: `BACKEND READY (MOBILE MISSING)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/modules/collections/collections.service.ts`
- **Description**: Users MUST be able to create static collections and group objects manually via `CollectionItem` link rows.
- **Acceptance Criteria**: Objects can be added to or removed from static collections.

---

### REQ-COLL-002: Dynamic Smart Collections Evaluator
- **Requirement ID**: `REQ-COLL-002`
- **Version**: `1.0.0`
- **Status**: `NOT IMPLEMENTED (APPROVED)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: Prisma schema supports `CollectionType.DYNAMIC` and `query Json?` field; query evaluator engine 0% built.
- **Description**: System MUST evaluate dynamic query expressions to group objects into Smart Collections automatically.
- **Acceptance Criteria**: Query evaluator parses JSON query and returns matching objects dynamically.

---

### REQ-REM-001: Recurrence Rule Specification (RRule)
- **Requirement ID**: `REQ-REM-001`
- **Version**: `1.0.0`
- **Status**: `BACKEND READY (MOBILE MISSING)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/backend/src/modules/reminders/reminders.service.ts`
- **Description**: Reminders MUST support iCalendar RFC 5545 recurrence rules via `rrule` library.
- **Acceptance Criteria**: Recurring reminders calculate next trigger dates accurately.

---

### REQ-MOB-001: Design Token System
- **Requirement ID**: `REQ-MOB-001`
- **Version**: `1.0.0`
- **Status**: `IMPLEMENTED (FULL)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `packages/ui/src/tokens/*` and `packages/theme`
- **Description**: The mobile application MUST consume design tokens exclusively through `@lumora/theme` and `@lumora/ui`. Zero hardcoded colors or ad-hoc style values allowed.
- **Acceptance Criteria**: Changing theme tokens updates UI components cleanly across Light, Dark, AMOLED, and High Contrast modes.

---

### REQ-MOB-002: Mobile API Client Stack
- **Requirement ID**: `REQ-MOB-002`
- **Version**: `1.0.0`
- **Status**: `NOT IMPLEMENTED (APPROVED)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/mobile/package.json` lacks `axios`, `@tanstack/react-query`, `zustand`, `expo-secure-store`
- **Description**: The mobile app MUST contain an HTTP API client with JWT refresh interceptors, Zustand auth state management, and TanStack Query state caching.
- **Acceptance Criteria**: Mobile client authenticates with backend and caches workspace queries.

---

### REQ-MOB-003: Mobile Product Screens
- **Requirement ID**: `REQ-MOB-003`
- **Version**: `1.0.0`
- **Status**: `NOT IMPLEMENTED (APPROVED)`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: `apps/mobile/app/` contains design system playground only
- **Description**: The mobile app MUST provide Home screen object list, Quick Add universal creation sheet, Object Detail view, and Search screen.
- **Acceptance Criteria**: Users can log in, view their workspace objects, and create new objects on their mobile device.

---

### REQ-OFFLINE-001: Offline Synchronization
- **Requirement ID**: `REQ-OFFLINE-001`
- **Version**: `1.0.0`
- **Status**: `DEFERRED`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: None
- **Description**: System MUST support local offline persistence and delta synchronization.
- **Acceptance Criteria**: Deferred until online data foundation is established.

---

### REQ-GAME-001: Gamification Framework
- **Requirement ID**: `REQ-GAME-001`
- **Version**: `1.0.0`
- **Status**: `PLANNED`
- **Last Verified**: 2026-08-10 (HEAD `92fb2fe`)
- **Evidence Path**: None
- **Description**: System MUST track completion streaks, badges, and milestones via passive outbox event handlers.
- **Acceptance Criteria**: Activity events update streak counters asynchronously without blocking core CRUD.
