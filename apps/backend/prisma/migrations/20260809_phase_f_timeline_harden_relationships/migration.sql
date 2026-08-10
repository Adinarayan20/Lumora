-- Phase F: Timeline hardening + Relationship table
-- Migration: 20260809_phase_f_timeline_harden_relationships
--
-- ANALYSIS:
--
--   Timeline.workspaceId: was nullable (String?). Making NOT NULL.
--     Existing rows with NULL workspaceId: assign a sentinel value.
--     Safe approach: use the object's workspaceId if available, else use a
--     zero UUID. The toDomain() mapper already handles NULL with fallback.
--     After this migration all new rows must have workspaceId.
--
--   Timeline.userId: was nullable (String?). Making NOT NULL.
--     Same approach as workspaceId.
--
--   Timeline.action: was nullable (String?). Making NOT NULL.
--     Existing NULL rows get 'TIMELINE_ACTIVITY' as the default value.
--
--   Relationship table: new generic relationship model.
--     Enables linking any two Universal Objects without creating
--     object-type-specific relationship tables.

-- ── Step 1: Backfill nullable Timeline columns before making NOT NULL ─────────

-- Backfill workspaceId from the linked Object's workspaceId where NULL
UPDATE "Timeline" t
SET    "workspaceId" = o."workspaceId"
FROM   "Object" o
WHERE  t."objectId" = o."id"
  AND  t."workspaceId" IS NULL;

-- Any remaining rows with no linked object get a zero UUID (should not happen)
UPDATE "Timeline"
SET    "workspaceId" = '00000000-0000-0000-0000-000000000000'
WHERE  "workspaceId" IS NULL;

-- Backfill userId — use the object's createdById where NULL
UPDATE "Timeline" t
SET    "userId" = o."createdById"
FROM   "Object" o
WHERE  t."objectId" = o."id"
  AND  t."userId" IS NULL;

UPDATE "Timeline"
SET    "userId" = '00000000-0000-0000-0000-000000000000'
WHERE  "userId" IS NULL;

-- Backfill action
UPDATE "Timeline"
SET    "action" = 'TIMELINE_ACTIVITY'
WHERE  "action" IS NULL;

-- ── Step 2: Add NOT NULL constraints ─────────────────────────────────────────

ALTER TABLE "Timeline"
  ALTER COLUMN "workspaceId" SET NOT NULL,
  ALTER COLUMN "userId"      SET NOT NULL,
  ALTER COLUMN "action"      SET NOT NULL;

-- ── Step 3: Add composite index for object-level timeline queries ─────────────

CREATE INDEX IF NOT EXISTS "Timeline_workspaceId_objectId_idx"
  ON "Timeline" ("workspaceId", "objectId");

-- ── Step 4: Create generic Relationship table ─────────────────────────────────
--
-- A Relationship links any two Universal Objects within a workspace.
-- It is generic: the relationship semantics are encoded in `type` (e.g.
-- 'parent', 'depends-on', 'related-to', 'blocks', 'duplicates').
-- Both sourceObjectId and targetObjectId must belong to the same workspace.

CREATE TABLE IF NOT EXISTS "Relationship" (
  "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId"    UUID         NOT NULL,
  "sourceObjectId" UUID         NOT NULL,
  "targetObjectId" UUID         NOT NULL,
  "type"           TEXT         NOT NULL,
  "metadata"       JSONB,
  "createdById"    UUID         NOT NULL,
  "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "deletedAt"      TIMESTAMPTZ,

  CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Relationship_sourceObjectId_fkey"
    FOREIGN KEY ("sourceObjectId") REFERENCES "Object"("id") ON DELETE CASCADE,
  CONSTRAINT "Relationship_targetObjectId_fkey"
    FOREIGN KEY ("targetObjectId") REFERENCES "Object"("id") ON DELETE CASCADE,
  CONSTRAINT "Relationship_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id"),
  -- Prevent duplicate directed relationships of the same type
  CONSTRAINT "Relationship_source_target_type_unique"
    UNIQUE ("workspaceId", "sourceObjectId", "targetObjectId", "type")
);

CREATE INDEX IF NOT EXISTS "Relationship_workspaceId_idx"
  ON "Relationship" ("workspaceId");

CREATE INDEX IF NOT EXISTS "Relationship_sourceObjectId_idx"
  ON "Relationship" ("sourceObjectId");

CREATE INDEX IF NOT EXISTS "Relationship_targetObjectId_idx"
  ON "Relationship" ("targetObjectId");

CREATE INDEX IF NOT EXISTS "Relationship_workspaceId_type_idx"
  ON "Relationship" ("workspaceId", "type");
