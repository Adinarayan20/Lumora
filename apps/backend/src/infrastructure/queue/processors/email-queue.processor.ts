import { Injectable } from '@nestjs/common';
import { BaseQueueProcessor } from './base-queue.processor.js';
import { QUEUES } from '../queue.constants.js';
import { QueueOptionsProvider } from '../queue.options.js';
import { BullMQConnectionProvider } from '../bullmq-connection.provider.js';
import type { DispatchEmailJobDto } from '../../../application/jobs/index.js';

@Injectable()
export class EmailQueueProcessor extends BaseQueueProcessor<DispatchEmailJobDto> {
  constructor(
    connectionProvider: BullMQConnectionProvider,
    queueOptionsProvider: QueueOptionsProvider,
  ) {
    super(QUEUES.EMAIL, connectionProvider, queueOptionsProvider);
  }

  protected async processJobPayload(data: DispatchEmailJobDto): Promise<void> {
    await Promise.resolve(data);
  }
}
