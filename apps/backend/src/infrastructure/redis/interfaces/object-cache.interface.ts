export const OBJECT_CACHE_TOKEN = Symbol('IObjectCache');

export interface IObjectCache {
  get<T = unknown>(objectId: string): Promise<T | null>;
  set<T = unknown>(
    objectId: string,
    data: T,
    ttlSeconds?: number,
  ): Promise<void>;
  delete(objectId: string): Promise<void>;
}
