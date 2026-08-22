-- Remove Space (domain aggregate violation) and Relationship (V1 scope violation)
-- Migration: 20260820_remove_space_and_relationship
--
-- See: Lumora Repository Reset / Cleanup Report §4, §6, §14.
--
-- CONTEXT / KNOWN LIMITATION OF THIS MIGRATION:
--   The migration chain has a pre-existing, separate defect: migration
--   20260808_phase_e_persistence_foundation creates an index on
--   Object.workspaceId/typeKey/status, but no migration in this history
--   ever adds those columns via ALTER TABLE. This means `prisma migrate
--   deploy` against a genuinely empty database fails at that migration,
--   independent of anything in this file. This migration is written
--   against the actual current table shape (as declared in schema.prisma
--   and as any real dev/staging database reached via prior direct
--   schema sync almost certainly has), not against what a from-scratch
--   `migrate deploy` would produce today. That from-scratch gap is a
--   separate, pre-existing issue and is NOT fixed here — do not treat
--   a clean apply of this migration as evidence that the chain as a
--   whole is deployable from zero.
--
-- SPACE:
--   Space had acquired lifecycle, hierarchy, and its own persistence/
--   permission surface — violates 02_DOMAIN_BUSINESS_LOGIC.md Invariant 38.
--   Object.spaceId is dropped with it. No data-preservation path: per
--   Invariant 38 there is no correct destination for this data within the
--   authorized domain model. If real Space/Object.spaceId data exists in
--   the target environment, decide before running this migration whether
--   any of it needs to be captured as plain non-relational Object
--   attributes first — this migration does not do that automatically.
--
-- RELATIONSHIP:
--   Deferred to LATER per 02 §41 / 03 §11 — no V1 storage, API, or
--   service. This table WAS migrated in
--   20260809_phase_f_timeline_harden_relationships (via CREATE TABLE IF
--   NOT EXISTS), which an earlier pass of this cleanup incorrectly
--   reported as "never migrated" — correcting that here with a real
--   DROP TABLE rather than leaving it orphaned in the database after
--   removing it from schema.prisma.

-- ── Step 1: Drop Relationship (correcting the earlier "never migrated" error) ──

DROP TABLE IF EXISTS "Relationship";

-- ── Step 2: Drop Object → Space foreign key and index ──────────────────────────

ALTER TABLE "Object" DROP CONSTRAINT IF EXISTS "Object_spaceId_fkey";

DROP INDEX IF EXISTS "Object_spaceId_idx";

-- ── Step 3: Drop Object.spaceId column ──────────────────────────────────────────

ALTER TABLE "Object" DROP COLUMN IF EXISTS "spaceId";

-- ── Step 4: Drop Space → Workspace foreign key, Space → Space self-relation ────

ALTER TABLE "Space" DROP CONSTRAINT IF EXISTS "Space_workspaceId_fkey";
ALTER TABLE "Space" DROP CONSTRAINT IF EXISTS "Space_parentId_fkey";
ALTER TABLE "Space" DROP CONSTRAINT IF EXISTS "Space_createdById_fkey";
ALTER TABLE "Space" DROP CONSTRAINT IF EXISTS "Space_updatedById_fkey";

-- ── Step 5: Drop Space indexes ──────────────────────────────────────────────────

DROP INDEX IF EXISTS "Space_workspaceId_idx";
DROP INDEX IF EXISTS "Space_workspaceId_slug_idx";
DROP INDEX IF EXISTS "Space_workspaceId_status_idx";
DROP INDEX IF EXISTS "Space_workspaceId_parentId_idx";
DROP INDEX IF EXISTS "Space_workspaceId_isFavorite_idx";
DROP INDEX IF EXISTS "Space_workspaceId_pinnedAt_idx";
DROP INDEX IF EXISTS "Space_createdById_idx";

-- ── Step 6: Drop Space table ─────────────────────────────────────────────────────

DROP TABLE IF EXISTS "Space";

-- ── Step 7: Drop orphaned enums (SpaceType, SpaceStatus — confirmed zero other usages) ──

DROP TYPE IF EXISTS "SpaceType";
DROP TYPE IF EXISTS "SpaceStatus";
