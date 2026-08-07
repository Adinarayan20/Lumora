import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BACKGROUND_JOB_DISPATCHER_TOKEN } from '../../application/jobs/interfaces/background-job-dispatcher.interface.js';
import { QueueOptionsProvider } from './queue.options.js';
import { BullMQJobDispatcher } from './bullmq-job-dispatcher.js';
import { ReminderQueueProcessor } from './processors/reminder-queue.processor.js';
import { NotificationQueueProcessor } from './processors/notification-queue.processor.js';
import { EmailQueueProcessor } from './processors/email-queue.processor.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    QueueOptionsProvider,
    BullMQJobDispatcher,
    ReminderQueueProcessor,
    NotificationQueueProcessor,
    EmailQueueProcessor,
    {
      provide: BACKGROUND_JOB_DISPATCHER_TOKEN,
      useClass: BullMQJobDispatcher,
    },
  ],
  exports: [
    QueueOptionsProvider,
    BACKGROUND_JOB_DISPATCHER_TOKEN,
    BullMQJobDispatcher,
  ],
})
export class BullMQModule {}
