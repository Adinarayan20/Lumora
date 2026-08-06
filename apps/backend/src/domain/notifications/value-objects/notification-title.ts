import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface NotificationTitleProps extends Record<string, unknown> {
  value: string;
}

export class NotificationTitle extends ValueObject<NotificationTitleProps> {
  private constructor(props: NotificationTitleProps) {
    super(props);
  }

  public static create(title: string): NotificationTitle {
    const nullGuard = Guard.againstNullOrUndefined(title, 'title');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = title.trim();
    const emptyGuard = Guard.againstEmptyString(trimmed, 'title');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (trimmed.length > 200) {
      throw new DomainValidationException(
        'Notification title cannot exceed 200 characters.',
        { title: ['Title length exceeds 200 characters limit.'] },
      );
    }

    return new NotificationTitle({ value: trimmed });
  }

  public getValue(): string {
    return this.props.value;
  }
}
