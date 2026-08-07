import { Injectable } from '@nestjs/common';
import { BaseQueueProcessor } from './base-queue.processor.js';
import { QUEUES } from '../queue.constants.js';
import { QueueOptionsProvider } from '../queue.options.js';
import { BullMQConnectionProvider } from '../bullmq-connection.provider.js';
import type { DispatchReminderJobDto } from '../../../application/jobs/index.js';

@Injectable()
export class ReminderQueueProcessor extends BaseQueueProcessor<DispatchReminderJobDto> {
  constructor(
    connectionProvider: BullMQConnectionProvider,
    queueOptionsProvider: QueueOptionsProvider,
  ) {
    super(QUEUES.REMINDER, connectionProvider, queueOptionsProvider);
  }

  protected async processJobPayload(
    data: DispatchReminderJobDto,
  ): Promise<void> {
    // Orchestration point: Invokes application service / use-case
    await Promise.resolve(data);
  }
}
