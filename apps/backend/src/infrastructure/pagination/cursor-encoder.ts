import { DomainValidationException } from '@lumora/shared';

interface BufferGlobal {
  Buffer?: {
    from(data: string, encoding?: string): { toString(encoding: string): string };
  } | undefined;
}

const BASE64URL_REGEX = /^[A-Za-z0-9_-]+$/;

/**
 * Infrastructure utility providing opaque base64url transport serialization for keyset pagination cursors.
 * Converts raw database column values into opaque API cursor strings and back.
 */
export class CursorEncoder {
  /**
   * Encodes a raw keyset value (string, number, or Date) into an opaque base64url cursor string.
   */
  public static encode(value: string | number | Date): string {
    const rawString = value instanceof Date ? value.toISOString() : String(value);
    const nodeBuffer = (globalThis as unknown as BufferGlobal).Buffer;

    if (nodeBuffer !== undefined) {
      return nodeBuffer.from(rawString, 'utf-8').toString('base64url');
    }

    return btoa(rawString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Decodes an opaque base64url cursor string back into its raw string value.
   * @throws {DomainValidationException} if the cursor string is invalid or corrupted.
   */
  public static decode(cursor: string): string {
    if (!cursor || typeof cursor !== 'string' || cursor.trim().length === 0 || !BASE64URL_REGEX.test(cursor)) {
      throw new DomainValidationException('Pagination cursor must be a valid base64url string.', {
        cursor: ['Cursor string is required and must be valid base64url.'],
      });
    }

    try {
      const nodeBuffer = (globalThis as unknown as BufferGlobal).Buffer;
      if (nodeBuffer !== undefined) {
        return nodeBuffer.from(cursor, 'base64url').toString('utf-8');
      }

      // Base64url to Base64 normalization
      let base64 = cursor.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }
      return atob(base64);
    } catch (error) {
      throw new DomainValidationException(`Failed to decode pagination cursor '${cursor}'.`, {
        cursor: ['Invalid or corrupted base64url pagination cursor.'],
      });
    }
  }
}
