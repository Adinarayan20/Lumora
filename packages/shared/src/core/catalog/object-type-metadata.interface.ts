import type { ObjectTypeKey } from './object-type-key.js';
import type { BehaviorExtensionKey } from './behavior-extension-key.js';

/**
 * Immutable metadata definition for a Lumora universal object type.
 */
export interface ObjectTypeMetadata {
  /**
   * Unique machine-readable type identifier string.
   */
  readonly typeKey: ObjectTypeKey;

  /**
   * Human-readable display title.
   */
  readonly displayName: string;

  /**
   * Detailed functional description of the object type.
   */
  readonly description: string;

  /**
   * Default icon token string for UI rendering.
   */
  readonly icon?: string | undefined;

  /**
   * List of domain behavior extension keys supported by this object type.
   */
  readonly supportedExtensions: readonly BehaviorExtensionKey[];
}
