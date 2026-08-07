import { Result } from '@lumora/shared';
import type { InstalledTemplateAggregate } from '../installed-template.aggregate.js';
import { TemplateLifecyclePolicy } from '../policies/template-lifecycle-policy.js';

export enum TemplateUninstallPolicy {
  KEEP_OBJECTS_DETACH_METADATA = 'KEEP_OBJECTS_DETACH_METADATA',
  ARCHIVE_ALL_OBJECTS = 'ARCHIVE_ALL_OBJECTS',
  HARD_DELETE_ALL_TEMPLATE_DATA = 'HARD_DELETE_ALL_TEMPLATE_DATA',
}

export class TemplateUninstallEngine {
  public static async uninstall(
    instance: InstalledTemplateAggregate,
    policy: TemplateUninstallPolicy = TemplateUninstallPolicy.KEEP_OBJECTS_DETACH_METADATA,
  ): Promise<Result<void>> {
    const policyResult = TemplateLifecyclePolicy.canUninstall(instance);
    if (policyResult.isFailure) {
      return Result.fail(policyResult.getError());
    }

    instance.markUninstalling();

    if (policy === TemplateUninstallPolicy.ARCHIVE_ALL_OBJECTS) {
      instance.markArchived();
    } else if (policy === TemplateUninstallPolicy.HARD_DELETE_ALL_TEMPLATE_DATA) {
      instance.markDisabled();
    } else {
      // KEEP_OBJECTS_DETACH_METADATA
      instance.markArchived();
    }

    return Promise.resolve(Result.ok<void>(undefined));
  }
}
