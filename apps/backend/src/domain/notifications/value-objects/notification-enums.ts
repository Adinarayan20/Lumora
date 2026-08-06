export const NotificationStatus = {
  PENDING: 'PENDING',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  READ: 'READ',
  CANCELLED: 'CANCELLED',
} as const;

export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NotificationChannel = {
  IN_APP: 'IN_APP',
  PUSH: 'PUSH',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
} as const;

export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationType = {
  REMINDER_TRIGGER: 'REMINDER_TRIGGER',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  INVITATION_RECEIVED: 'INVITATION_RECEIVED',
  WORKSPACE_ACTIVITY: 'WORKSPACE_ACTIVITY',
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type NotificationPriority =
  (typeof NotificationPriority)[keyof typeof NotificationPriority];
