import { Injectable, Logger } from '@nestjs/common';
import {
  Result,
  CapabilityId,
  DomainValidationException,
} from '@lumora/shared';
import type {
  CapabilityDescriptor,
  CapabilityReference,
  SystemTrait,
} from '@lumora/shared';
import type { CapabilityRegistry } from './capability-registry.js';
import type { CapabilityExecutor } from './capability-executor.js';

export interface IUniversalCapabilityEngine {
  validateCapabilitiesForObject(
    requestedCapabilities: readonly CapabilityReference[],
    objectTraits: readonly SystemTrait[],
  ): Result<void>;
  registerCapability(descriptor: CapabilityDescriptor): void;
  getCapability(id: CapabilityId | string): CapabilityDescriptor | null;
}

@Injectable()
export class UniversalCapabilityEngine implements IUniversalCapabilityEngine {
  private readonly logger = new Logger(UniversalCapabilityEngine.name);

  constructor(
    private readonly capabilityRegistry: CapabilityRegistry,
    private readonly capabilityExecutor: CapabilityExecutor,
  ) {}

  public registerCapability(descriptor: CapabilityDescriptor): void {
    this.capabilityRegistry.register(descriptor);
    this.logger.log(
      `Registered capability '${descriptor.key}' (v${descriptor.version}) in UniversalCapabilityEngine.`,
    );
  }

  public getCapability(id: CapabilityId | string): CapabilityDescriptor | null {
    return this.capabilityRegistry.get(id);
  }

  public validateCapabilitiesForObject(
    requestedCapabilities: readonly CapabilityReference[],
    objectTraits: readonly SystemTrait[],
  ): Result<void> {
    const traitsSet = new Set(objectTraits);

    for (const ref of requestedCapabilities) {
      if (ref.enabled === false) continue;

      const descriptor = this.capabilityRegistry.get(ref.key);
      if (!descriptor) {
        return Result.fail(
          new DomainValidationException(
            `Capability '${ref.key}' is not registered in the Lumora Capability Registry.`,
          ),
        );
      }

      // Check trait prerequisites
      for (const requiredTrait of descriptor.requiredTraits) {
        if (!traitsSet.has(requiredTrait)) {
          return Result.fail(
            new DomainValidationException(
              `Capability '${descriptor.key}' requires trait '${requiredTrait}', which is missing on target object.`,
            ),
          );
        }
      }

      // Check dependency prerequisites
      for (const dep of descriptor.dependencies) {
        if (dep.dependencyType === 'REQUIRED') {
          const hasDep = requestedCapabilities.some(
            (c) =>
              c.key.toLowerCase() === dep.capabilityKey.toLowerCase() &&
              c.enabled !== false,
          );
          if (!hasDep) {
            return Result.fail(
              new DomainValidationException(
                `Capability '${descriptor.key}' requires prerequisite capability '${dep.capabilityKey}'.`,
              ),
            );
          }
        }
      }
    }

    return Result.ok<void>(undefined);
  }

  public get executor(): CapabilityExecutor {
    return this.capabilityExecutor;
  }
}
