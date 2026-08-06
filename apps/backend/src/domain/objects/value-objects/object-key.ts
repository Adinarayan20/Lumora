import { ValueObject, IdGenerator } from '@lumora/shared';

interface ObjectKeyProps extends Record<string, unknown> {
  value: string;
}

/**
 * Value Object encapsulating a unique business key for a Universal Object.
 */
export class ObjectKey extends ValueObject<ObjectKeyProps> {
  private constructor(props: ObjectKeyProps) {
    super(props);
  }

  public static create(key?: string): ObjectKey {
    const rawKey =
      key && key.trim().length > 0 ? key.trim() : IdGenerator.generate();
    return new ObjectKey({ value: rawKey });
  }

  public toValue(): string {
    return this.props.value;
  }

  public override toString(): string {
    return this.props.value;
  }
}
