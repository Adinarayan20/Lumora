import { Result } from '@lumora/shared';
import type { InstalledTemplateAggregate } from '../installed-template.aggregate.js';
import type { TemplatePlan } from '../interfaces/template-interfaces.js';
import { TemplateLifecyclePolicy } from '../policies/template-lifecycle-policy.js';
import { TemplateRollbackEngine } from './template-rollback-engine.js';

export class TemplateUpgradeEngine {
  public static async applyUpgrade(
    instance: InstalledTemplateAggregate,
    newPlan: TemplatePlan,
    newVersion: string,
  ): Promise<Result<void>> {
    const policyResult = TemplateLifecyclePolicy.canUpgrade(
      instance,
      newVersion,
    );
    if (policyResult.isFailure) {
      return Result.fail(policyResult.getError());
    }

    // Take state snapshot before upgrade
    TemplateRollbackEngine.createSnapshot(instance);

    try {
      instance.markInstalling();
      instance.completeUpgrade(newVersion);
      return Promise.resolve(Result.ok<void>(undefined));
    } catch (err) {
      await TemplateRollbackEngine.executeRollback(instance);
      return Result.fail(
        err instanceof Error ? (err as any) : new Error(String(err)),
      );
    }
  }
}
