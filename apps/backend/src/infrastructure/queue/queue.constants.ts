export const QUEUES = {
  REMINDER: 'lumora-reminder-queue',
  NOTIFICATION: 'lumora-notification-queue',
  EMAIL: 'lumora-email-queue',
  WEBHOOK: 'lumora-webhook-queue',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
