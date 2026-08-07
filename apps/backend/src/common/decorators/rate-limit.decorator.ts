import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  limit?: number;
  ttlSeconds?: number;
}

export const RATE_LIMIT_METADATA_KEY = 'lumora:rate-limit-metadata';

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_METADATA_KEY, options);
