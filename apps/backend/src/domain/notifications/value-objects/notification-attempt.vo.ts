import { ValueObject, UniqueEntityId, Guard } from '@lumora/shared';
import {
  NotificationChannel,
  NotificationStatus,
} from './notification-enums.js';

export interface NotificationDeliveryAttemptProps extends Record<
  string,
  unknown
> {
  attemptId: UniqueEntityId;
  notificationId: UniqueEntityId;
  channel: NotificationChannel;
  status: NotificationStatus;
  attemptedAt: Date;
  errorMessage?: string | undefined;
  durationMs?: number | undefined;
}

export interface CreateNotificationDeliveryAttemptProps {
  attemptId?: UniqueEntityId;
  notificationId: UniqueEntityId;
  channel: NotificationChannel;
  status: NotificationStatus;
  attemptedAt?: Date;
  errorMessage?: string;
  durationMs?: number;
}

/**
 * Immutable Value Object representing recorded notification delivery attempt metrics.
 */
export class NotificationDeliveryAttempt extends ValueObject<NotificationDeliveryAttemptProps> {
  private constructor(props: NotificationDeliveryAttemptProps) {
    super(props);
  }

  public get attemptId(): UniqueEntityId {
    return this.props.attemptId;
  }

  public get notificationId(): UniqueEntityId {
    return this.props.notificationId;
  }

  public get channel(): NotificationChannel {
    return this.props.channel;
  }

  public get status(): NotificationStatus {
    return this.props.status;
  }

  public get attemptedAt(): Date {
    return this.props.attemptedAt;
  }

  public get errorMessage(): string | undefined {
    return this.props.errorMessage;
  }

  public get durationMs(): number | undefined {
    return this.props.durationMs;
  }

  public static create(
    props: CreateNotificationDeliveryAttemptProps,
  ): NotificationDeliveryAttempt {
    const notifGuard = Guard.againstNullOrUndefined(
      props.notificationId,
      'notificationId',
    );
    if (notifGuard.isFailure) throw notifGuard.getError();

    return new NotificationDeliveryAttempt({
      attemptId: props.attemptId ?? new UniqueEntityId(),
      notificationId: props.notificationId,
      channel: props.channel,
      status: props.status,
      attemptedAt: props.attemptedAt ?? new Date(),
      errorMessage: props.errorMessage,
      durationMs: props.durationMs,
    });
  }
}
