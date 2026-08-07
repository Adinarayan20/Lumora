import { Result } from '@lumora/shared';
import type { InstalledTemplateAggregate } from '../installed-template.aggregate.js';
import { InstalledTemplateStatus } from '../installed-template.aggregate.js';
import { TemplateLifecyclePolicy } from '../policies/template-lifecycle-policy.js';

export interface TemplateSnapshot {
  snapshotId: string;
  workspaceId: string;
  templateKey: string;
  previousVersion: string;
  status: InstalledTemplateStatus;
  createdAt: Date;
}

export class TemplateRollbackEngine {
  private static readonly snapshots = new Map<string, TemplateSnapshot>();

  public static createSnapshot(
    instance: InstalledTemplateAggregate,
  ): TemplateSnapshot {
    const snapshot: TemplateSnapshot = {
      snapshotId: `snap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      workspaceId: instance.workspaceId.toString(),
      templateKey: instance.templateKey,
      previousVersion: instance.installedVersion,
      status: instance.status,
      createdAt: new Date(),
    };

    const key = `${instance.workspaceId.toString()}:${instance.templateKey}`;
    this.snapshots.set(key, snapshot);
    return snapshot;
  }

  public static async executeRollback(
    instance: InstalledTemplateAggregate,
  ): Promise<Result<void>> {
    const policyResult = TemplateLifecyclePolicy.canRollback(instance);
    if (policyResult.isFailure) {
      return Result.fail(policyResult.getError());
    }

    const key = `${instance.workspaceId.toString()}:${instance.templateKey}`;
    const snapshot = this.snapshots.get(key);

    instance.markRollingBack();

    if (snapshot) {
      instance.completeRollback();
    } else {
      instance.markFailed('ROLLBACK', 'Rollback snapshot not found');
    }

    return Promise.resolve(Result.ok<void>(undefined));
  }
}
