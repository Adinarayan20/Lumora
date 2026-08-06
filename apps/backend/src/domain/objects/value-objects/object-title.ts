import { ValueObject, Guard } from '@lumora/shared';

interface ObjectTitleProps extends Record<string, unknown> {
  value: string;
}

/**
 * Value Object encapsulating a validated Universal Object title (1-512 characters).
 */
export class ObjectTitle extends ValueObject<ObjectTitleProps> {
  private constructor(props: ObjectTitleProps) {
    super(props);
  }

  public static create(title: string): ObjectTitle {
    const lengthGuard = Guard.againstInvalidLength(title, 1, 512, 'title');
    if (lengthGuard.isFailure) throw lengthGuard.getError();

    return new ObjectTitle({ value: title.trim() });
  }

  public toValue(): string {
    return this.props.value;
  }

  public override toString(): string {
    return this.props.value;
  }
}
