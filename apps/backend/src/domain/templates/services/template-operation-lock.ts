import { DomainValidationException } from '@lumora/shared';

export interface LockAcquisitionResult {
  acquired: boolean;
  lockId?: string;
  expiresAt?: Date;
}

export class TemplateOperationLock {
  private static readonly activeLocks = new Map<string, { lockId: string; expiresAt: Date }>();
  private static readonly DEFAULT_TTL_MS = 30000; // 30 seconds

  public static acquireLock(
    workspaceId: string,
    templateKey: string,
    operationName: 'install' | 'upgrade' | 'uninstall' | 'rollback',
    ttlMs: number = this.DEFAULT_TTL_MS,
  ): LockAcquisitionResult {
    const key = `${workspaceId}:${templateKey}`;
    const now = new Date();
    const existing = this.activeLocks.get(key);

    if (existing) {
      if (existing.expiresAt > now) {
        return { acquired: false };
      }
      // Stale lock recovery: auto-release expired lock
      this.activeLocks.delete(key);
    }

    const lockId = `${operationName}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(now.getTime() + ttlMs);
    this.activeLocks.set(key, { lockId, expiresAt });

    return { acquired: true, lockId, expiresAt };
  }

  public static releaseLock(workspaceId: string, templateKey: string, lockId: string): void {
    const key = `${workspaceId}:${templateKey}`;
    const existing = this.activeLocks.get(key);
    if (existing && existing.lockId === lockId) {
      this.activeLocks.delete(key);
    }
  }

  public static clearAllLocks(): void {
    this.activeLocks.clear();
  }
}
