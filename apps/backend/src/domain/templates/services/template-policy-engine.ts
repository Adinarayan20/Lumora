import type { TemplateManifest, UniqueEntityId } from '@lumora/shared';
import type { ITemplatePolicyEngine, PolicyEvaluationResult } from '../interfaces/template-interfaces.js';

export class DefaultTemplatePolicyEngine implements ITemplatePolicyEngine {
  public async evaluate(
    manifest: TemplateManifest,
    workspaceId: UniqueEntityId,
  ): Promise<PolicyEvaluationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Rule 1: Check dangerous permissions
    if (manifest.permissions?.dangerousPermissions) {
      for (const dangerousPerm of manifest.permissions.dangerousPermissions) {
        warnings.push(
          `Template '${manifest.key}' requests dangerous permission '${dangerousPerm}'. Requires explicit admin approval.`,
        );
      }
    }

    // Rule 2: Minimum platform version verification
    if (!manifest.minPlatformVersion) {
      violations.push(`Template '${manifest.key}' missing required minPlatformVersion.`);
    }

    const allowed = violations.length === 0;

    return Promise.resolve({
      allowed,
      violations,
      warnings,
    });
  }
}
