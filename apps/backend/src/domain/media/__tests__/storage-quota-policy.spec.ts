import { describe, it, expect } from 'vitest';
import { DomainValidationException } from '@lumora/shared';
import { StorageQuotaPolicy } from '../policies/storage-quota.policy.js';

describe('StorageQuotaPolicy', () => {
  it('should allow uploads within storage quota limit', () => {
    expect(() =>
      StorageQuotaPolicy.validateStorageQuota(1024, 2048, 10000),
    ).not.toThrow();
  });

  it('should throw DomainValidationException when upload exceeds storage quota', () => {
    expect(() =>
      StorageQuotaPolicy.validateStorageQuota(9000, 2000, 10000),
    ).toThrow(DomainValidationException);
  });
});
