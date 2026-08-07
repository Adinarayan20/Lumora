import { CapabilityCompatibilityMatrix, DomainValidationException, Result } from '@lumora/shared';
import type { CapabilityRequirement } from '@lumora/shared';

export class CompatibilityChecker {
  public static checkCapabilityCompatibility(
    requirements: CapabilityRequirement[],
  ): Result<void> {
    for (let i = 0; i < requirements.length; i++) {
      for (let j = i + 1; j < requirements.length; j++) {
        const reqA = requirements[i];
        const reqB = requirements[j];

        const isCompatible = CapabilityCompatibilityMatrix.isCompatible(
          reqA.key,
          reqA.versionConstraint,
          reqB.key,
          reqB.versionConstraint,
        );

        if (!isCompatible) {
          return Result.fail(
            new DomainValidationException(
              `Capability '${reqA.key}' (${reqA.versionConstraint}) is incompatible with capability '${reqB.key}' (${reqB.versionConstraint}).`,
            ),
          );
        }
      }
    }

    return Result.ok<void>(undefined);
  }
}
