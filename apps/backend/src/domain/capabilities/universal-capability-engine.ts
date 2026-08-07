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
    this.detectCircularDependencies();
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

      // Check dependency prerequisites and version ranges
      for (const dep of descriptor.dependencies) {
        if (dep.dependencyType === 'REQUIRED') {
          const targetCapRef = requestedCapabilities.find(
            (c) =>
              c.key.toLowerCase() === dep.capabilityKey.toLowerCase() &&
              c.enabled !== false,
          );

          if (!targetCapRef) {
            return Result.fail(
              new DomainValidationException(
                `Capability '${descriptor.key}' requires prerequisite capability '${dep.capabilityKey}'.`,
              ),
            );
          }

          // Validate Version Range
          const targetDescriptor = this.capabilityRegistry.get(
            targetCapRef.key,
          );
          const activeVersion =
            targetCapRef.version ?? targetDescriptor?.version ?? '1.0.0';

          if (!this.matchesVersionRange(activeVersion, dep.versionRange)) {
            return Result.fail(
              new DomainValidationException(
                `Capability '${descriptor.key}' requires '${dep.capabilityKey}' version '${dep.versionRange}', but version '${activeVersion}' is active.`,
              ),
            );
          }
        }
      }
    }

    return Result.ok<void>(undefined);
  }

  private matchesVersionRange(version: string, range: string): boolean {
    if (!range || range === '*' || range === 'latest') return true;

    const cleanVersion = version.replace(/^v/, '');
    const cleanRange = range.trim();

    // Major wildcard (e.g. 1.x or 1.*)
    if (cleanRange.endsWith('.x') || cleanRange.endsWith('.*')) {
      const major = cleanRange.split('.')[0];
      const targetMajor = cleanVersion.split('.')[0];
      return major === targetMajor;
    }

    // Caret range (e.g. ^1.2.0 -> same major version)
    if (cleanRange.startsWith('^')) {
      const targetMajor = cleanRange.slice(1).split('.')[0];
      const actualMajor = cleanVersion.split('.')[0];
      return targetMajor === actualMajor;
    }

    // Greater than or equal (e.g. >=1.0.0)
    if (cleanRange.startsWith('>=')) {
      const minVer = cleanRange.slice(2).trim();
      return (
        cleanVersion.localeCompare(minVer, undefined, { numeric: true }) >= 0
      );
    }

    // Exact version match
    return cleanVersion === cleanRange;
  }

  private detectCircularDependencies(): void {
    const list = this.capabilityRegistry.list();
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (key: string, path: string[]) => {
      visited.add(key);
      recursionStack.add(key);

      const cap = this.capabilityRegistry.get(key);
      if (cap?.dependencies) {
        for (const dep of cap.dependencies) {
          const depKey = dep.capabilityKey.toLowerCase();
          if (!visited.has(depKey) && this.capabilityRegistry.has(depKey)) {
            dfs(depKey, [...path, depKey]);
          } else if (recursionStack.has(depKey)) {
            throw new DomainValidationException(
              `Circular dependency detected in Capability Registry: ${[...path, depKey].join(' -> ')}`,
            );
          }
        }
      }

      recursionStack.delete(key);
    };

    for (const cap of list) {
      const key = cap.key.toLowerCase();
      if (!visited.has(key)) {
        dfs(key, [key]);
      }
    }
  }

  public get executor(): CapabilityExecutor {
    return this.capabilityExecutor;
  }
}
