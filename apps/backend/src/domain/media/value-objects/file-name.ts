import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface FileNameProps extends Record<string, unknown> {
  value: string;
}

export class FileName extends ValueObject<FileNameProps> {
  private constructor(props: FileNameProps) {
    super(props);
  }

  public static create(filename: string): FileName {
    const nullGuard = Guard.againstNullOrUndefined(filename, 'filename');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = filename.trim();
    const emptyGuard = Guard.againstEmptyString(trimmed, 'filename');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (trimmed.length > 255) {
      throw new DomainValidationException(
        'File name cannot exceed 255 characters.',
        { filename: ['Filename length exceeds 255 characters limit.'] },
      );
    }

    if (/[\\/:*?"<>|]/.test(trimmed)) {
      throw new DomainValidationException(
        'File name contains illegal path characters.',
        { filename: ['Filename contains unsafe path characters.'] },
      );
    }

    return new FileName({ value: trimmed });
  }

  public getValue(): string {
    return this.props.value;
  }
}
