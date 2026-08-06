import { UniqueEntityId, Guard } from '@lumora/shared';
import { NotificationChannel, NotificationStatus } from '../value-objects/notification-enums.js';

export interface NotificationDeliveryAttemptEntityProps {
  id?: UniqueEntityId;
  notificationId: UniqueEntityId;
  channel: NotificationChannel;
  status: NotificationStatus;
  attemptedAt?: Date;
  errorMessage?: string;
  durationMs?: number;
}

/**
 * Domain entity representing an individual notification delivery attempt.
 */
export class NotificationDeliveryAttemptEntity {
  public readonly id: UniqueEntityId;
  public readonly notificationId: UniqueEntityId;
  public readonly channel: NotificationChannel;
  public readonly status: NotificationStatus;
  public readonly attemptedAt: Date;
  public readonly errorMessage?: string | undefined;
  public readonly durationMs?: number | undefined;

  private constructor(props: NotificationDeliveryAttemptEntityProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.notificationId = props.notificationId;
    this.channel = props.channel;
    this.status = props.status;
    this.attemptedAt = props.attemptedAt ?? new Date();
    this.errorMessage = props.errorMessage;
    this.durationMs = props.durationMs;
  }

  public static create(
    props: NotificationDeliveryAttemptEntityProps,
  ): NotificationDeliveryAttemptEntity {
    const notifGuard = Guard.againstNullOrUndefined(props.notificationId, 'notificationId');
    if (notifGuard.isFailure) throw notifGuard.getError();

    return new NotificationDeliveryAttemptEntity(props);
  }
}
