import { Result, DomainValidationException } from '@lumora/shared';
import type { InstalledTemplateAggregate } from '../installed-template.aggregate.js';
import { InstalledTemplateStatus } from '../installed-template.aggregate.js';
import type { TemplatePlan } from '../interfaces/template-interfaces.js';
import { TemplateRollbackEngine } from './template-rollback-engine.js';

export class TemplateUpgradeEngine {
  public static async applyUpgrade(
    instance: InstalledTemplateAggregate,
    newPlan: TemplatePlan,
    newVersion: string,
  ): Promise<Result<void>> {
    if (instance.status === InstalledTemplateStatus.UNINSTALLING) {
      return Result.fail(
        new DomainValidationException(
          `Cannot upgrade template '${instance.templateKey}' while in status UNINSTALLING.`,
        ),
      );
    }

    // Take state snapshot before upgrade
    TemplateRollbackEngine.createSnapshot(instance);

    try {
      instance.transitionTo(InstalledTemplateStatus.INSTALLING);
      instance.installedVersion = newVersion;
      instance.transitionTo(InstalledTemplateStatus.UPGRADED);
      return Promise.resolve(Result.ok<void>(undefined));
    } catch (err) {
      await TemplateRollbackEngine.executeRollback(instance);
      return Result.fail(
        new DomainValidationException(
          `Template upgrade failed: ${err instanceof Error ? err.message : String(err)}`,
        ),
      );
    }
  }
}
