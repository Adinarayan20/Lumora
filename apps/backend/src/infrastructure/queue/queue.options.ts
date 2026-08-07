import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface QueueJobConfig {
  readonly concurrency: number;
  readonly maxRetries: number;
  readonly backoffMs: number;
  readonly removeOnComplete: boolean | number;
  readonly removeOnFail: boolean | number;
}

@Injectable()
export class QueueOptionsProvider {
  constructor(private readonly configService: ConfigService) {}

  public get concurrency(): number {
    return this.configService.get<number>('QUEUE_CONCURRENCY', 5);
  }

  public get maxRetries(): number {
    return this.configService.get<number>('QUEUE_RETRIES', 3);
  }

  public get backoffMs(): number {
    return this.configService.get<number>('QUEUE_BACKOFF_MS', 5000);
  }

  public get removeOnComplete(): boolean | number {
    return this.configService.get<boolean>('REMOVE_ON_COMPLETE', true);
  }

  public get removeOnFail(): boolean | number {
    return this.configService.get<number>('REMOVE_ON_FAIL', 100);
  }

  public getJobOptions() {
    return {
      attempts: this.maxRetries,
      backoff: {
        type: 'exponential',
        delay: this.backoffMs,
      },
      removeOnComplete: this.removeOnComplete,
      removeOnFail: this.removeOnFail,
    };
  }
}
