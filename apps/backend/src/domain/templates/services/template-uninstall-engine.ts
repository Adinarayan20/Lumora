import { Result } from '@lumora/shared';
import type { InstalledTemplateAggregate } from '../installed-template.aggregate.js';
import { InstalledTemplateStatus } from '../installed-template.aggregate.js';

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
    instance.transitionTo(InstalledTemplateStatus.UNINSTALLING);

    if (policy === TemplateUninstallPolicy.ARCHIVE_ALL_OBJECTS) {
      instance.transitionTo(InstalledTemplateStatus.ARCHIVED);
    } else if (policy === TemplateUninstallPolicy.HARD_DELETE_ALL_TEMPLATE_DATA) {
      instance.transitionTo(InstalledTemplateStatus.DISABLED);
    } else {
      // KEEP_OBJECTS_DETACH_METADATA
      instance.transitionTo(InstalledTemplateStatus.ARCHIVED);
    }

    return Promise.resolve(Result.ok<void>(undefined));
  }
}
