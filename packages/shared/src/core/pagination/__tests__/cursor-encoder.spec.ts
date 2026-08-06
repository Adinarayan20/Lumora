import { describe, it, expect } from 'vitest';
import { CursorEncoder } from '../cursor-encoder.js';
import { DomainValidationException } from '../../errors/domain-exceptions.js';

describe('CursorEncoder', () => {
  it('should encode and decode string keyset values correctly', () => {
    const rawValue = 'object-id-12345';
    const encoded = CursorEncoder.encode(rawValue);
    const decoded = CursorEncoder.decode(encoded);

    expect(encoded).not.toBe(rawValue);
    expect(decoded).toBe(rawValue);
  });

  it('should encode Date instances to ISO string and decode correctly', () => {
    const now = new Date();
    const encoded = CursorEncoder.encode(now);
    const decoded = CursorEncoder.decode(encoded);

    expect(decoded).toBe(now.toISOString());
  });

  it('should encode number values correctly', () => {
    const count = 1050;
    const encoded = CursorEncoder.encode(count);
    const decoded = CursorEncoder.decode(encoded);

    expect(decoded).toBe('1050');
  });

  it('should throw DomainValidationException for empty or whitespace cursor strings', () => {
    expect(() => CursorEncoder.decode('')).toThrow(DomainValidationException);
    expect(() => CursorEncoder.decode('   ')).toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException for invalid corrupted base64url strings', () => {
    // Note: atob in node might parse some strings, but invalid characters fail
    expect(() => CursorEncoder.decode('!!!not-base64-url!!!')).toThrow(DomainValidationException);
  });
});
