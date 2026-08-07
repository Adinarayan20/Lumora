import { Result, UniqueEntityId, DomainValidationException } from '@lumora/shared';
import type { ITemplateInstaller, TemplatePlan } from '../interfaces/template-interfaces.js';
import { InstalledTemplateAggregate, InstalledTemplateStatus } from '../installed-template.aggregate.js';
import { TemplateOperationLock } from './template-operation-lock.js';

export class TemplateInstallerService implements ITemplateInstaller {
  public async install(plan: TemplatePlan, contextUserId: UniqueEntityId): Promise<Result<void>> {
    if (plan.isDryRun) {
      return Promise.resolve(Result.ok<void>(undefined));
    }

    const lockResult = TemplateOperationLock.acquireLock(
      plan.targetWorkspaceId,
      plan.templateKey,
      'install',
    );

    if (!lockResult.acquired) {
      return Result.fail(
        new DomainValidationException(
          `Concurrent template operation detected for template '${plan.templateKey}' in workspace '${plan.targetWorkspaceId}'.`,
        ),
      );
    }

    try {
      const installedTemplate = InstalledTemplateAggregate.create({
        workspaceId: new UniqueEntityId(plan.targetWorkspaceId),
        templateKey: plan.templateKey,
        installedVersion: '1.0.0',
        status: InstalledTemplateStatus.DRAFT,
      });

      installedTemplate.markInstalling();
      installedTemplate.markActive('1.0.0');

      return Result.ok<void>(undefined);
    } finally {
      TemplateOperationLock.releaseLock(
        plan.targetWorkspaceId,
        plan.templateKey,
        lockResult.lockId!,
      );
    }
  }
}
