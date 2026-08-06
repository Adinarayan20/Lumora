export class TimelineRecordResponseDto {
  id!: string;
  workspaceId!: string;
  userId!: string;
  entityCategory!: string;
  entityId!: string;
  action!: string;
  timestamp!: string;
  metadata?: Record<string, unknown> | undefined;
}
