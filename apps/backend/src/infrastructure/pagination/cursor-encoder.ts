import { DomainValidationException } from '@lumora/shared';

interface BufferGlobal {
  from(data: string, encoding: string): { toString(encoding: string): string };
}

declare const Buffer: BufferGlobal;

/**
 * Utility for serializing and deserializing cursor strings for keyset pagination.
 * Encodes cursor data into base64url strings to prevent implementation leakage.
 */
export class CursorEncoder {
  /**
   * Encodes a record ID or cursor value into an opaque base64url cursor token.
   */
  public static encode(value: unknown): string {
    const strValue =
      value instanceof Date ? value.toISOString() : String(value ?? '');

    if (!strValue || strValue.trim().length === 0) {
      throw new DomainValidationException(
        'Cannot encode an empty ID into a pagination cursor.',
      );
    }

    const json = JSON.stringify({ id: strValue, timestamp: Date.now() });
    return Buffer.from(json, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Decodes an opaque base64url cursor token back into the underlying record ID.
   */
  public static decode(cursor: string): string {
    if (!cursor || cursor.trim().length === 0) {
      throw new DomainValidationException(
        'Cannot decode an empty pagination cursor string.',
      );
    }

    try {
      let base64 = cursor.replace(/-/g, '+').replace(/_/g, '/');

      while (base64.length % 4 !== 0) {
        base64 += '=';
      }

      const json = Buffer.from(base64, 'base64').toString('utf-8');
      const parsed = JSON.parse(json) as { id?: unknown };

      if (typeof parsed.id !== 'string' || parsed.id.trim().length === 0) {
        throw new DomainValidationException(
          'Decoded cursor payload is invalid or missing required ID string.',
        );
      }

      return parsed.id;
    } catch (_error) {
      if (_error instanceof DomainValidationException) {
        throw _error;
      }
      throw new DomainValidationException(
        'Malformed or corrupted pagination cursor string.',
        {
          cursor: ['Cursor string failed base64url decoding or JSON parsing.'],
        },
      );
    }
  }
}
