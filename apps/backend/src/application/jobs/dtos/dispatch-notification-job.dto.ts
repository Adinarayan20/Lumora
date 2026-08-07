export interface DispatchNotificationJobDto {
  readonly notificationId: string;
  readonly recipientUserId: string;
  readonly channel: string;
  readonly message: string;
  readonly correlationId?: string;
}
