export class NotificationResponseDto {
  id!: string;
  workspaceId!: string;
  userId!: string;
  reminderId?: string | undefined;
  title!: string;
  body!: string;
  type!: string;
  channel!: string;
  status!: string;
  scheduledFor!: string;
  deliveredAt?: string | undefined;
  readAt?: string | undefined;
  createdAt!: string;
  updatedAt!: string;
}
