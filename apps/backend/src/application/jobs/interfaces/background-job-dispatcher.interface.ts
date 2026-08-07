import type { DispatchReminderJobDto } from '../dtos/dispatch-reminder-job.dto.js';
import type { DispatchNotificationJobDto } from '../dtos/dispatch-notification-job.dto.js';
import type { DispatchEmailJobDto } from '../dtos/dispatch-email-job.dto.js';

export const BACKGROUND_JOB_DISPATCHER_TOKEN = Symbol(
  'IBackgroundJobDispatcher',
);

export interface IBackgroundJobDispatcher {
  dispatchReminder(payload: DispatchReminderJobDto): Promise<void>;
  dispatchNotification(payload: DispatchNotificationJobDto): Promise<void>;
  dispatchEmail(payload: DispatchEmailJobDto): Promise<void>;
}
