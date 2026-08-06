import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface NotificationBodyProps extends Record<string, unknown> {
  value: string;
}

export class NotificationBody extends ValueObject<NotificationBodyProps> {
  private constructor(props: NotificationBodyProps) {
    super(props);
  }

  public static create(body: string): NotificationBody {
    const nullGuard = Guard.againstNullOrUndefined(body, 'body');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = body.trim();
    const emptyGuard = Guard.againstEmptyString(trimmed, 'body');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (trimmed.length > 2000) {
      throw new DomainValidationException(
        'Notification body cannot exceed 2000 characters.',
        { body: ['Body length exceeds 2000 characters limit.'] },
      );
    }

    return new NotificationBody({ value: trimmed });
  }

  public getValue(): string {
    return this.props.value;
  }
}
