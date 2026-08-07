import { ValueObject } from "../primitives/value-object.js";
import { DomainValidationException } from "../errors/domain-exceptions.js";

export interface CapabilityIdProps extends Record<string, unknown> {
  value: string;
}

/**
 * Strongly typed Value Object representing a unique capability identifier key.
 */
export class CapabilityId extends ValueObject<CapabilityIdProps> {
  private constructor(props: CapabilityIdProps) {
    super(props);
  }

  public static create(id: string): CapabilityId {
    if (!id || id.trim().length === 0) {
      throw new DomainValidationException("CapabilityId value cannot be empty.");
    }
    return new CapabilityId({ value: id.trim().toLowerCase() });
  }

  public toValue(): string {
    return this.props.value;
  }
}
