-- AlterTable
ALTER TABLE "objects" ADD COLUMN "schemaVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "outbox_messages" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "aggregateId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "payloadSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 5,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idempotencyKey" TEXT NOT NULL,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "outbox_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outbox_messages_idempotencyKey_key" ON "outbox_messages"("idempotencyKey");

-- CreateIndex
CREATE INDEX "outbox_messages_status_nextAttemptAt_idx" ON "outbox_messages"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "outbox_messages_workspaceId_aggregateId_idx" ON "outbox_messages"("workspaceId", "aggregateId");

-- CreateIndex
CREATE INDEX "objects_workspaceId_typeKey_status_idx" ON "objects"("workspaceId", "typeKey", "status");

-- CreateIndex
CREATE INDEX "objects_workspaceId_updatedAt_id_idx" ON "objects"("workspaceId", "updatedAt" DESC, "id");
