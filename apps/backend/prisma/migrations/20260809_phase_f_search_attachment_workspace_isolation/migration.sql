-- Phase F: Search workspace isolation + FileAsset workspace attribution
-- Migration: 20260809_phase_f_search_attachment_workspace_isolation
--
-- ANALYSIS:
--   SearchIndex: derived read-side projection. Adding nullable workspaceId.
--     Existing rows (if any) get NULL, meaning they are orphaned projections
--     from before workspace scoping. They will be excluded from scoped queries
--     and naturally replaced when the Outbox re-indexes objects.
--     This is safe: search is a derived projection, not source of truth.
--
--   FileAsset: user-uploaded files. Adding nullable workspaceId.
--     Cannot safely derive workspace from uploadedById alone (user can be in
--     multiple workspaces). Existing rows remain with NULL workspaceId.
--     New uploads must supply workspaceId.
--
-- Both columns are nullable to ensure zero downtime and safe rollforward.

-- ── SearchIndex: add workspaceId ──────────────────────────────────────────
ALTER TABLE "SearchIndex"
  ADD COLUMN IF NOT EXISTS "workspaceId" UUID;

-- Index for workspace-scoped search
CREATE INDEX IF NOT EXISTS "SearchIndex_workspaceId_entity_idx"
  ON "SearchIndex" ("workspaceId", "entity");

-- ── FileAsset: add workspaceId ────────────────────────────────────────────
ALTER TABLE "FileAsset"
  ADD COLUMN IF NOT EXISTS "workspaceId" UUID;

CREATE INDEX IF NOT EXISTS "FileAsset_workspaceId_idx"
  ON "FileAsset" ("workspaceId");

-- ── Clean up orphaned SearchIndex projections (workspaceId IS NULL) ───────
-- These are pre-migration projections that cannot be workspace-attributed.
-- They will be rebuilt by the Outbox worker when objects are next mutated.
-- Safe to delete because search is a derived/replaceable projection.
DELETE FROM "SearchIndex" WHERE "workspaceId" IS NULL;
