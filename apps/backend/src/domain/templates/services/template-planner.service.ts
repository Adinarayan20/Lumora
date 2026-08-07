import {
  Result,
  TemplateValidator,
  DomainValidationException,
  CapabilityCompatibilityRegistry,
} from '@lumora/shared';
import type { TemplatePackage, UniqueEntityId, ICapabilityCompatibilityRegistry } from '@lumora/shared';
import type { ITemplatePlanner, ITemplatePolicyEngine, TemplatePlan } from '../interfaces/template-interfaces.js';
import { TemplateDependencyResolver } from './template-dependency-resolver.js';
import { CompatibilityChecker } from './compatibility-checker.js';
import { TemplatePlannerMetrics } from './template-planner-metrics.js';

export class TemplatePlannerService implements ITemplatePlanner {
  constructor(
    private readonly policyEngine: ITemplatePolicyEngine,
    private readonly compatibilityRegistry: ICapabilityCompatibilityRegistry = new CapabilityCompatibilityRegistry(),
  ) {}

  public async planInstallation(
    pkg: TemplatePackage,
    workspaceId: UniqueEntityId,
    options?: { dryRun?: boolean },
  ): Promise<Result<TemplatePlan>> {
    const startTime = Date.now();
    const isDryRun = options?.dryRun ?? false;

    // Step 1: Validate package manifest & content
    const valResult = TemplateValidator.validate(pkg);
    if (valResult.isFailure) {
      return Result.fail(valResult.getError());
    }

    // Step 2: Policy Engine evaluation
    const policyResult = await this.policyEngine.evaluate(pkg.manifest, workspaceId);
    if (!policyResult.allowed) {
      return Result.fail(
        new DomainValidationException(
          `Template '${pkg.manifest.key}' policy evaluation failed: ${policyResult.violations.join('; ')}`,
        ),
      );
    }

    // Step 3: Capability compatibility check
    const compatResult = CompatibilityChecker.checkCapabilityCompatibility(
      this.compatibilityRegistry,
      pkg.manifest.capabilities,
    );
    if (compatResult.isFailure) {
      return Result.fail(compatResult.getError());
    }

    // Step 4: Topological dependency order resolution
    let installOrder: string[];
    try {
      installOrder = TemplateDependencyResolver.resolveInstallationOrder(pkg, []);
    } catch (err) {
      return Result.fail(
        err instanceof DomainValidationException ? err : new DomainValidationException(String(err)),
      );
    }

    const plan: TemplatePlan = {
      templateKey: pkg.manifest.key,
      targetWorkspaceId: workspaceId.toString(),
      installOrder,
      newObjectDefinitions: pkg.content.objectDefinitions,
      schemaMigrations: pkg.content.schemaDefinitions,
      capabilitiesToAttach: pkg.manifest.capabilities,
      seedObjectsToCreate: pkg.content.seedObjects ?? [],
      warnings: policyResult.warnings,
      isDryRun,
    };

    const durationMs = Date.now() - startTime;
    TemplatePlannerMetrics.recordPlanGenerated(durationMs, isDryRun);

    return Result.ok(plan);
  }
}
