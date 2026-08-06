import { describe, it, expect } from 'vitest';
import { DomainValidationException } from '@lumora/shared';
import { FileValidationPolicy } from '../policies/file-validation.policy.js';
import { MimeType } from '../value-objects/mime-type.js';
import { FileSize } from '../value-objects/file-size.js';

describe('FileValidationPolicy', () => {
  it('should allow valid MIME types', () => {
    const mime = MimeType.create('application/pdf');
    expect(() => FileValidationPolicy.validateMimeType(mime)).not.toThrow();
  });

  it('should throw DomainValidationException for disallowed MIME types', () => {
    const mime = MimeType.create('application/x-executable');
    expect(() => FileValidationPolicy.validateMimeType(mime)).toThrow(
      DomainValidationException,
    );
  });

  it('should throw DomainValidationException when file size exceeds maximum limit', () => {
    const hugeBytes = 200 * 1024 * 1024;
    expect(() => FileSize.create(hugeBytes)).toThrow(DomainValidationException);
  });
});
