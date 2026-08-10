/**
 * Stable API response DTO for Reminder resources.
 * Does NOT expose Prisma model types.
 */
export class ReminderResponseDto {
  id!: string;
  workspaceId!: string;
  objectId!: string;
  createdById!: string;
  updatedById?: string;
  status!: string;
  executionStatus!: string;
  remindAt!: string;
  snoozedUntil?: string;
  nextOccurrenceAt?: string;
  lastTriggeredAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  timezone!: string;
  recurrenceRule?: string;
  priority?: string;
  source!: string;
  triggerType!: string;
  revision!: number;
  createdAt!: string;
  updatedAt!: string;
}
