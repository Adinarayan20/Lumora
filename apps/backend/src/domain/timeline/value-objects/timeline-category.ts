import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface TimelineCategoryProps extends Record<string, unknown> {
  value: string;
}

export class TimelineCategory extends ValueObject<TimelineCategoryProps> {
  private constructor(props: TimelineCategoryProps) {
    super(props);
  }

  public static create(category: string): TimelineCategory {
    const nullGuard = Guard.againstNullOrUndefined(category, 'category');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = category.trim().toUpperCase();
    const emptyGuard = Guard.againstEmptyString(trimmed, 'category');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (trimmed.length > 64) {
      throw new DomainValidationException(
        'Timeline category length cannot exceed 64 characters.',
        { category: ['Timeline category length exceeds 64 characters limit.'] },
      );
    }

    return new TimelineCategory({ value: trimmed });
  }

  public getValue(): string {
    return this.props.value;
  }
}
