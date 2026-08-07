import { UniqueEntityId, Result } from '@lumora/shared';
import type { InstalledTemplateAggregate } from '../installed-template.aggregate.js';
import { InstalledTemplateStatus } from '../installed-template.aggregate.js';

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

  public static createSnapshot(instance: InstalledTemplateAggregate): TemplateSnapshot {
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
    const key = `${instance.workspaceId.toString()}:${instance.templateKey}`;
    const snapshot = this.snapshots.get(key);

    instance.transitionTo(InstalledTemplateStatus.ROLLING_BACK);

    if (snapshot) {
      instance.installedVersion = snapshot.previousVersion;
      instance.transitionTo(snapshot.status);
    } else {
      instance.transitionTo(InstalledTemplateStatus.FAILED);
    }

    return Promise.resolve(Result.ok<void>(undefined));
  }
}
