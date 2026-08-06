import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface StorageKeyProps extends Record<string, unknown> {
  value: string;
}

export class StorageKey extends ValueObject<StorageKeyProps> {
  private constructor(props: StorageKeyProps) {
    super(props);
  }

  public static create(key: string): StorageKey {
    const nullGuard = Guard.againstNullOrUndefined(key, 'storageKey');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = key.trim();
    const emptyGuard = Guard.againstEmptyString(trimmed, 'storageKey');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (trimmed.includes('..')) {
      throw new DomainValidationException(
        'Storage key contains dangerous relative path traversal sequence.',
        { storageKey: ['Storage key path traversal forbidden.'] },
      );
    }

    return new StorageKey({ value: trimmed });
  }

  public getValue(): string {
    return this.props.value;
  }
}
