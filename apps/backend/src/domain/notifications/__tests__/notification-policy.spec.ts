import { describe, it, expect } from 'vitest';
import { DomainValidationException } from '@lumora/shared';
import { NotificationPolicy } from '../policies/notification.policy.js';
import { NotificationStatus } from '../value-objects/notification-enums.js';

describe('NotificationPolicy', () => {
  it('should throw DomainValidationException when attempt count exceeds max limit', () => {
    expect(() =>
      NotificationPolicy.validateAttemptCount(
        NotificationPolicy.MAX_DELIVERY_ATTEMPTS,
      ),
    ).toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException when transitioning from terminal READ status', () => {
    expect(() =>
      NotificationPolicy.validateStatusTransition(
        NotificationStatus.READ,
        NotificationStatus.PENDING,
      ),
    ).toThrow(DomainValidationException);
  });

  it('should allow valid status transitions', () => {
    expect(() =>
      NotificationPolicy.validateStatusTransition(
        NotificationStatus.PENDING,
        NotificationStatus.DELIVERED,
      ),
    ).not.toThrow();
  });
});
