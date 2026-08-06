import { AggregateRoot, UniqueEntityId, Guard } from '@lumora/shared';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from './value-objects/notification-enums.js';
import { NotificationTitle } from './value-objects/notification-title.js';
import { NotificationBody } from './value-objects/notification-body.js';
import { NotificationDeliveryAttempt } from './value-objects/notification-attempt.vo.js';
import { NotificationPolicy } from './policies/notification.policy.js';
import {
  NotificationDeliveredEvent,
  NotificationFailedEvent,
  NotificationReadEvent,
} from './events/notification.events.js';

export interface NotificationAggregateProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  userId: UniqueEntityId;
  reminderId?: UniqueEntityId;
  title: NotificationTitle;
  body: NotificationBody;
  type?: NotificationType;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  scheduledFor: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  attempts?: NotificationDeliveryAttempt[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain Aggregate Root representing a Notification dispatch and delivery lifecycle.
 */
export class NotificationAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public readonly userId: UniqueEntityId;
  public readonly reminderId?: UniqueEntityId | undefined;
  public title: NotificationTitle;
  public body: NotificationBody;
  public readonly type: NotificationType;
  public channel: NotificationChannel;
  public status: NotificationStatus;
  public readonly scheduledFor: Date;
  public deliveredAt?: Date | undefined;
  public readAt?: Date | undefined;
  public failureReason?: string | undefined;
  private readonly _attempts: NotificationDeliveryAttempt[];
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: NotificationAggregateProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.userId = props.userId;
    this.reminderId = props.reminderId;
    this.title = props.title;
    this.body = props.body;
    this.type = props.type ?? NotificationType.REMINDER_TRIGGER;
    this.channel = props.channel ?? NotificationChannel.IN_APP;
    this.status = props.status ?? NotificationStatus.PENDING;
    this.scheduledFor = props.scheduledFor;
    this.deliveredAt = props.deliveredAt;
    this.readAt = props.readAt;
    this.failureReason = props.failureReason;
    this._attempts = props.attempts ? [...props.attempts] : [];
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public get attempts(): readonly NotificationDeliveryAttempt[] {
    return Object.freeze([...this._attempts]);
  }

  public static create(
    props: Omit<NotificationAggregateProps, 'title' | 'body'> & {
      title: NotificationTitle | string;
      body: NotificationBody | string;
    },
  ): NotificationAggregate {
    const wsGuard = Guard.againstNullOrUndefined(props.workspaceId, 'workspaceId');
    if (wsGuard.isFailure) throw wsGuard.getError();

    const userGuard = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (userGuard.isFailure) throw userGuard.getError();

    const schedGuard = Guard.againstNullOrUndefined(props.scheduledFor, 'scheduledFor');
    if (schedGuard.isFailure) throw schedGuard.getError();

    const titleObj = typeof props.title === 'string' ? NotificationTitle.create(props.title) : props.title;
    const bodyObj = typeof props.body === 'string' ? NotificationBody.create(props.body) : props.body;

    NotificationPolicy.validateChannel(props.channel ?? NotificationChannel.IN_APP);

    return new NotificationAggregate({
      ...props,
      title: titleObj,
      body: bodyObj,
    });
  }

  public static reconstitute(props: NotificationAggregateProps): NotificationAggregate {
    return new NotificationAggregate(props);
  }

  public recordAttempt(attempt: NotificationDeliveryAttempt): void {
    NotificationPolicy.validateAttemptCount(this._attempts.length);
    this._attempts.push(attempt);
    this.updatedAt = new Date();
  }

  public markAsDelivered(channel: NotificationChannel, deliveredAt: Date = new Date()): void {
    NotificationPolicy.validateStatusTransition(this.status, NotificationStatus.DELIVERED);
    this.status = NotificationStatus.DELIVERED;
    this.deliveredAt = deliveredAt;
    this.channel = channel;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new NotificationDeliveredEvent(
        this.id,
        this.workspaceId,
        this.userId,
        channel,
        deliveredAt,
      ),
    );
  }

  public markAsFailed(channel: NotificationChannel, reason: string): void {
    NotificationPolicy.validateStatusTransition(this.status, NotificationStatus.FAILED);
    this.status = NotificationStatus.FAILED;
    this.failureReason = reason;
    this.channel = channel;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new NotificationFailedEvent(
        this.id,
        this.workspaceId,
        this.userId,
        channel,
        reason,
      ),
    );
  }

  public markAsRead(readAt: Date = new Date()): void {
    NotificationPolicy.validateStatusTransition(this.status, NotificationStatus.READ);
    this.status = NotificationStatus.READ;
    this.readAt = readAt;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new NotificationReadEvent(
        this.id,
        this.workspaceId,
        this.userId,
        readAt,
      ),
    );
  }

  public cancel(): void {
    NotificationPolicy.validateStatusTransition(this.status, NotificationStatus.CANCELLED);
    this.status = NotificationStatus.CANCELLED;
    this.updatedAt = new Date();
  }
}
