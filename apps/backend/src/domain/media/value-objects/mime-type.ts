import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface MimeTypeProps extends Record<string, unknown> {
  value: string;
}

export class MimeType extends ValueObject<MimeTypeProps> {
  private constructor(props: MimeTypeProps) {
    super(props);
  }

  public static create(mimeType: string): MimeType {
    const nullGuard = Guard.againstNullOrUndefined(mimeType, 'mimeType');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = mimeType.trim().toLowerCase();
    const emptyGuard = Guard.againstEmptyString(trimmed, 'mimeType');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (!/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9!#$&^_.+-]+$/i.test(trimmed)) {
      throw new DomainValidationException(
        `Invalid MIME type format '${mimeType}'.`,
        { mimeType: ['MIME type format must follow type/subtype syntax.'] },
      );
    }

    return new MimeType({ value: trimmed });
  }

  public getValue(): string {
    return this.props.value;
  }
}
