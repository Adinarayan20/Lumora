import { DomainValidationException, Result } from '@lumora/shared';
import type {
  CapabilityRequirement,
  ICapabilityCompatibilityRegistry,
} from '@lumora/shared';

export class CompatibilityChecker {
  public static checkCapabilityCompatibility(
    registry: ICapabilityCompatibilityRegistry,
    requirements: CapabilityRequirement[],
  ): Result<void> {
    for (let i = 0; i < requirements.length; i++) {
      for (let j = i + 1; j < requirements.length; j++) {
        const reqA = requirements[i];
        const reqB = requirements[j];

        const definitions = registry.getDefinitions(reqA.key, reqB.key);
        for (const def of definitions) {
          if (!def.compatible) {
            return Result.fail(
              new DomainValidationException(
                def.reason ??
                  `Capability '${reqA.key}' (${reqA.versionConstraint}) is incompatible with capability '${reqB.key}' (${reqB.versionConstraint}).`,
              ),
            );
          }
        }
      }
    }

    return Result.ok<void>(undefined);
  }
}
