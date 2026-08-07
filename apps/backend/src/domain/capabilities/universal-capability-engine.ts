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

interface SemVer {
  major: number;
  minor: number;
  patch: number;
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

          // Validate Version Range using numeric semver comparison
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

  public matchesVersionRange(versionStr: string, rangeStr: string): boolean {
    if (!rangeStr || rangeStr === '*' || rangeStr === 'latest') return true;

    const version = this.parseSemVer(versionStr);
    if (!version) return false;

    const range = rangeStr.trim();

    // Wildcards (e.g. 1.x or 1.* or 1.2.x)
    if (range.includes('.x') || range.includes('.*')) {
      const parts = range.split('.');
      if (parts[0] !== '*' && parts[0] !== 'x') {
        if (parseInt(parts[0], 10) !== version.major) return false;
      }
      if (parts[1] && parts[1] !== '*' && parts[1] !== 'x') {
        if (parseInt(parts[1], 10) !== version.minor) return false;
      }
      return true;
    }

    // Caret ^ (same major)
    if (range.startsWith('^')) {
      const target = this.parseSemVer(range.slice(1));
      if (!target) return false;
      if (version.major !== target.major) return false;
      return this.compareSemVer(version, target) >= 0;
    }

    // Tilde ~ (same major and minor)
    if (range.startsWith('~')) {
      const target = this.parseSemVer(range.slice(1));
      if (!target) return false;
      if (version.major !== target.major || version.minor !== target.minor)
        return false;
      return this.compareSemVer(version, target) >= 0;
    }

    // Comparison operators (>=, <=, >, <, =)
    if (range.startsWith('>=')) {
      const target = this.parseSemVer(range.slice(2));
      return target ? this.compareSemVer(version, target) >= 0 : false;
    }
    if (range.startsWith('<=')) {
      const target = this.parseSemVer(range.slice(2));
      return target ? this.compareSemVer(version, target) <= 0 : false;
    }
    if (range.startsWith('>')) {
      const target = this.parseSemVer(range.slice(1));
      return target ? this.compareSemVer(version, target) > 0 : false;
    }
    if (range.startsWith('<')) {
      const target = this.parseSemVer(range.slice(1));
      return target ? this.compareSemVer(version, target) < 0 : false;
    }
    if (range.startsWith('=')) {
      const target = this.parseSemVer(range.slice(1));
      return target ? this.compareSemVer(version, target) === 0 : false;
    }

    // Exact version comparison
    const target = this.parseSemVer(range);
    return target ? this.compareSemVer(version, target) === 0 : false;
  }

  private parseSemVer(v: string): SemVer | null {
    const clean = v.replace(/^v/, '').trim();
    const parts = clean.split('.').map((p) => parseInt(p, 10));
    if (parts.some((p) => isNaN(p))) return null;
    return {
      major: parts[0] ?? 0,
      minor: parts[1] ?? 0,
      patch: parts[2] ?? 0,
    };
  }

  private compareSemVer(a: SemVer, b: SemVer): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
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
