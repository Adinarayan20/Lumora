const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Internal lightweight ID generation helper abstraction.
 * Decouples domain entities and value objects from direct platform crypto dependencies.
 */
export const IdGenerator = {
  /**
   * Generates a new secure RFC 4122 v4 UUID string identifier.
   */
  generate(): string {
    return crypto.randomUUID();
  },

  /**
   * Validates whether a string string complies with RFC 4122 v4 UUID format.
   */
  isValid(id: string): boolean {
    return UUID_V4_REGEX.test(id);
  },
} as const;
