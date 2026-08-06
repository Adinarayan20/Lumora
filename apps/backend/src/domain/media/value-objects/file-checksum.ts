import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface FileChecksumProps extends Record<string, unknown> {
  value: string;
}

export class FileChecksum extends ValueObject<FileChecksumProps> {
  private constructor(props: FileChecksumProps) {
    super(props);
  }

  public static create(checksum: string): FileChecksum {
    const nullGuard = Guard.againstNullOrUndefined(checksum, 'checksum');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = checksum.trim();
    const emptyGuard = Guard.againstEmptyString(trimmed, 'checksum');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (!/^[a-f0-9]{32,64}$/i.test(trimmed)) {
      throw new DomainValidationException(
        `Checksum '${checksum}' must be valid hexadecimal hash string (MD5, SHA-1, SHA-256).`,
        { checksum: ['Invalid hexadecimal hash format for file checksum.'] },
      );
    }

    return new FileChecksum({ value: trimmed.toLowerCase() });
  }

  public getValue(): string {
    return this.props.value;
  }
}
