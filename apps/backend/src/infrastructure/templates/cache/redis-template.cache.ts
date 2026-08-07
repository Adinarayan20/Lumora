import type { TemplatePackage } from '@lumora/shared';

export interface IPlannerCache {
  get(key: string): Promise<TemplatePackage | null>;
  set(key: string, value: TemplatePackage, ttlSeconds?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
}

export class MemoryPlannerCache implements IPlannerCache {
  private readonly cache = new Map<string, { value: TemplatePackage; expiresAt: number }>();

  public get(key: string): Promise<TemplatePackage | null> {
    const entry = this.cache.get(key);
    if (!entry) return Promise.resolve(null);
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(entry.value);
  }

  public set(key: string, value: TemplatePackage, ttlSeconds = 300): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
    return Promise.resolve();
  }

  public invalidate(key: string): Promise<void> {
    this.cache.delete(key);
    return Promise.resolve();
  }
}
