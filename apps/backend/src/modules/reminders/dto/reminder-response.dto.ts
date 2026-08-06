export class ReminderResponseDto {
  id!: string;
  workspaceId!: string;
  objectId!: string;
  createdById!: string;
  remindAt!: string;
  status!: string;
  priority!: string;
  recurrenceRule?: string;
  timezone!: string;
  snoozedUntil?: string;
  completedAt?: string;
  executionCount!: number;
  createdAt!: string;
  updatedAt!: string;
}
