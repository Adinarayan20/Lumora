import { Result, DomainValidationException } from '@lumora/shared';
import type { InstalledTemplateAggregate } from '../installed-template.aggregate.js';
import { InstalledTemplateStatus } from '../installed-template.aggregate.js';

export class TemplateLifecyclePolicy {
  public static canUpgrade(
    instance: InstalledTemplateAggregate,
    targetVersion: string,
  ): Result<void> {
    if (instance.status === InstalledTemplateStatus.UNINSTALLING) {
      return Result.fail(
        new DomainValidationException(
          `Cannot upgrade template '${instance.templateKey}' while in status UNINSTALLING.`,
        ),
      );
    }
    if (instance.status === InstalledTemplateStatus.ROLLING_BACK) {
      return Result.fail(
        new DomainValidationException(
          `Cannot upgrade template '${instance.templateKey}' while in status ROLLING_BACK.`,
        ),
      );
    }
    if (instance.installedVersion === targetVersion) {
      return Result.fail(
        new DomainValidationException(
          `Template '${instance.templateKey}' is already at version ${targetVersion}.`,
        ),
      );
    }

    return Result.ok<void>(undefined);
  }

  public static canUninstall(instance: InstalledTemplateAggregate): Result<void> {
    if (instance.status === InstalledTemplateStatus.INSTALLING) {
      return Result.fail(
        new DomainValidationException(
          `Cannot uninstall template '${instance.templateKey}' while in status INSTALLING.`,
        ),
      );
    }
    if (instance.status === InstalledTemplateStatus.ROLLING_BACK) {
      return Result.fail(
        new DomainValidationException(
          `Cannot uninstall template '${instance.templateKey}' while in status ROLLING_BACK.`,
        ),
      );
    }

    return Result.ok<void>(undefined);
  }

  public static canRollback(instance: InstalledTemplateAggregate): Result<void> {
    if (instance.status === InstalledTemplateStatus.DRAFT) {
      return Result.fail(
        new DomainValidationException(
          `Cannot rollback template '${instance.templateKey}' in DRAFT state.`,
        ),
      );
    }

    return Result.ok<void>(undefined);
  }
}
