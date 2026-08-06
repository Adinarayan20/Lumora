import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface FileSizeProps extends Record<string, unknown> {
  bytes: number;
}

export class FileSize extends ValueObject<FileSizeProps> {
  public static readonly MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

  private constructor(props: FileSizeProps) {
    super(props);
  }

  public static create(bytes: number): FileSize {
    const nullGuard = Guard.againstNullOrUndefined(bytes, 'bytes');
    if (nullGuard.isFailure) throw nullGuard.getError();

    if (bytes <= 0) {
      throw new DomainValidationException(
        'File size must be greater than 0 bytes.',
        { bytes: ['File size must be positive integer.'] },
      );
    }

    if (bytes > this.MAX_FILE_SIZE_BYTES) {
      throw new DomainValidationException(
        `File size exceeds maximum allowed limit of ${this.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
        {
          bytes: [
            `File size exceeds limit of ${this.MAX_FILE_SIZE_BYTES} bytes.`,
          ],
        },
      );
    }

    return new FileSize({ bytes });
  }

  public getBytes(): number {
    return this.props.bytes;
  }
}
