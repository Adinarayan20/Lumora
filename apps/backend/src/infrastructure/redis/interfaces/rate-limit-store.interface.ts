export const RATE_LIMIT_STORE_TOKEN = Symbol('IRateLimitStore');

export interface RateLimitResult {
  totalHits: number;
  resetTimeMs: number;
}

export interface IRateLimitStore {
  increment(identifier: string, ttlSeconds: number): Promise<RateLimitResult>;
  get(identifier: string): Promise<number | null>;
  reset(identifier: string): Promise<void>;
}
