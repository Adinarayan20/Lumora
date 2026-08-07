export interface DispatchReminderJobDto {
  readonly reminderId: string;
  readonly workspaceId: string;
  readonly scheduledAt: string;
  readonly title: string;
  readonly correlationId?: string;
}
