import { DomainValidationException } from '@lumora/shared';
import { NotificationChannel, NotificationStatus } from '../value-objects/notification-enums.js';

export class NotificationPolicy {
  public static readonly MAX_DELIVERY_ATTEMPTS = 5;

  /**
   * Validates whether a notification can accept additional delivery attempts.
   */
  public static validateAttemptCount(attemptCount: number): void {
    if (attemptCount >= this.MAX_DELIVERY_ATTEMPTS) {
      throw new DomainValidationException(
        `Maximum notification delivery attempt limit of ${this.MAX_DELIVERY_ATTEMPTS} reached.`,
        { attemptCount: [`Cannot attempt delivery beyond ${this.MAX_DELIVERY_ATTEMPTS} attempts.`] },
      );
    }
  }

  /**
   * Validates status transition rules and prevents invalid state mutations (e.g. duplicate delivery, terminal read/cancelled mutations).
   */
  public static validateStatusTransition(
    currentStatus: NotificationStatus,
    targetStatus: NotificationStatus,
  ): void {
    if (currentStatus === NotificationStatus.DELIVERED && targetStatus === NotificationStatus.DELIVERED) {
      throw new DomainValidationException(
        'Notification has already been delivered.',
        { status: ['Duplicate delivery attempt on an already delivered notification.'] },
      );
    }

    if (currentStatus === NotificationStatus.READ && targetStatus !== NotificationStatus.READ) {
      throw new DomainValidationException(
        `Cannot transition notification status from READ to ${targetStatus}.`,
        { status: ['Status READ is terminal for notification activity.'] },
      );
    }

    if (currentStatus === NotificationStatus.CANCELLED) {
      throw new DomainValidationException(
        `Cannot alter status of a CANCELLED notification.`,
        { status: ['Cancelled notifications cannot change status.'] },
      );
    }
  }

  /**
   * Validates channel eligibility.
   */
  public static validateChannel(channel: NotificationChannel): void {
    const validChannels: NotificationChannel[] = [
      NotificationChannel.IN_APP,
      NotificationChannel.PUSH,
      NotificationChannel.EMAIL,
      NotificationChannel.SMS,
    ];

    if (!validChannels.includes(channel)) {
      throw new DomainValidationException(
        `Unsupported notification channel '${channel}'.`,
        { channel: [`Channel ${channel} is not supported.`] },
      );
    }
  }
}
