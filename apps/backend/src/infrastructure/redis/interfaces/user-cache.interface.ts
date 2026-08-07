export const USER_CACHE_TOKEN = Symbol('IUserCache');

export interface IUserCache {
  get<T = unknown>(userId: string): Promise<T | null>;
  set<T = unknown>(userId: string, data: T, ttlSeconds?: number): Promise<void>;
  delete(userId: string): Promise<void>;
}
