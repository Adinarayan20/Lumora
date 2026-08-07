import { Injectable } from '@nestjs/common';
import {
  Result,
  UniqueEntityId,
  TemplateValidator,
  DomainValidationException,
} from '@lumora/shared';
import type { TemplatePackage } from '@lumora/shared';
import type {
  ITemplateImportPipeline,
  ITemplatePlanner,
  TemplatePlan,
} from '../../../domain/templates/interfaces/template-interfaces.js';

@Injectable()
export class TemplateImportPipelineService implements ITemplateImportPipeline {
  constructor(private readonly planner: ITemplatePlanner) {}

  public async importPackage(
    rawJsonPayload: string,
    workspaceId: UniqueEntityId,
  ): Promise<Result<TemplatePlan>> {
    let pkg: TemplatePackage;
    try {
      pkg = JSON.parse(rawJsonPayload) as TemplatePackage;
    } catch {
      return Result.fail(
        new DomainValidationException(
          'Invalid JSON payload provided for template import.',
        ),
      );
    }

    // Step 1: Sandbox Validation
    const valResult = TemplateValidator.validate(pkg);
    if (valResult.isFailure) {
      return Result.fail(valResult.getError());
    }

    // Step 2: Policy & Signature Verification (Handled in planner)
    return this.planner.planInstallation(pkg, workspaceId, { dryRun: true });
  }
}
