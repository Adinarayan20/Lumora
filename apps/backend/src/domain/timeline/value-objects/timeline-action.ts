import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface TimelineActionProps extends Record<string, unknown> {
  value: string;
}

export class TimelineAction extends ValueObject<TimelineActionProps> {
  private constructor(props: TimelineActionProps) {
    super(props);
  }

  public static create(action: string): TimelineAction {
    const nullGuard = Guard.againstNullOrUndefined(action, 'action');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = action.trim().toUpperCase();
    const emptyGuard = Guard.againstEmptyString(trimmed, 'action');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (trimmed.length > 64) {
      throw new DomainValidationException(
        'Timeline action length cannot exceed 64 characters.',
        { action: ['Timeline action name exceeds 64 characters limit.'] },
      );
    }

    return new TimelineAction({ value: trimmed });
  }

  public getValue(): string {
    return this.props.value;
  }
}
