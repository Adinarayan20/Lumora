export const QUEUES = {
  REMINDER: 'lumora-reminder-queue',
  NOTIFICATION: 'lumora-notification-queue',
  EMAIL: 'lumora-email-queue',
  WEBHOOK: 'lumora-webhook-queue',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

export const JOB_NAMES = {
  PROCESS_REMINDER: 'process-reminder',
  PROCESS_NOTIFICATION: 'process-notification',
  PROCESS_EMAIL: 'process-email',
  PROCESS_WEBHOOK: 'process-webhook',
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];
