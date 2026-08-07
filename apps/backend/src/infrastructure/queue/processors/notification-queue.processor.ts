import { Injectable } from '@nestjs/common';
import { BaseQueueProcessor } from './base-queue.processor.js';
import { QUEUES } from '../queue.constants.js';
import { QueueOptionsProvider } from '../queue.options.js';
import { BullMQConnectionProvider } from '../bullmq-connection.provider.js';
import type { DispatchNotificationJobDto } from '../../../application/jobs/index.js';

@Injectable()
export class NotificationQueueProcessor extends BaseQueueProcessor<DispatchNotificationJobDto> {
  constructor(
    connectionProvider: BullMQConnectionProvider,
    queueOptionsProvider: QueueOptionsProvider,
  ) {
    super(QUEUES.NOTIFICATION, connectionProvider, queueOptionsProvider);
  }

  protected async processJobPayload(
    data: DispatchNotificationJobDto,
  ): Promise<void> {
    await Promise.resolve(data);
  }
}
