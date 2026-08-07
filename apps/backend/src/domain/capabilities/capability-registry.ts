import { Injectable } from '@nestjs/common';
import { CapabilityId, DomainValidationException } from '@lumora/shared';
import type { CapabilityDescriptor } from '@lumora/shared';

export interface ICapabilityRegistry {
  register(descriptor: CapabilityDescriptor): void;
  get(id: CapabilityId | string): CapabilityDescriptor | null;
  has(id: CapabilityId | string): boolean;
  list(): readonly CapabilityDescriptor[];
}

@Injectable()
export class CapabilityRegistry implements ICapabilityRegistry {
  private readonly descriptors = new Map<string, CapabilityDescriptor>();

  public register(descriptor: CapabilityDescriptor): void {
    const key = CapabilityId.create(descriptor.key).toValue();
    if (this.descriptors.has(key)) {
      throw new DomainValidationException(
        `Capability with key '${descriptor.key}' is already registered.`,
      );
    }

    // Validate dependency references
    if (descriptor.dependencies) {
      for (const dep of descriptor.dependencies) {
        if (dep.capabilityKey.toLowerCase() === key) {
          throw new DomainValidationException(
            `Capability '${descriptor.key}' cannot declare a self-dependency.`,
          );
        }
      }
    }

    this.descriptors.set(key, Object.freeze({ ...descriptor }));
  }

  public get(id: CapabilityId | string): CapabilityDescriptor | null {
    const key =
      typeof id === 'string' ? CapabilityId.create(id).toValue() : id.toValue();
    return this.descriptors.get(key) ?? null;
  }

  public has(id: CapabilityId | string): boolean {
    const key =
      typeof id === 'string' ? CapabilityId.create(id).toValue() : id.toValue();
    return this.descriptors.has(key);
  }

  public list(): readonly CapabilityDescriptor[] {
    return Object.freeze(
      Array.from(this.descriptors.values()).sort(
        (a, b) => a.executionOrder - b.executionOrder,
      ),
    );
  }
}
