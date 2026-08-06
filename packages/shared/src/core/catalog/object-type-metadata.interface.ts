import type { ObjectTypeKey } from "./object-type-key.js";
import type { BehaviorExtensionKey } from "./behavior-extension-key.js";
import type { TranslationKey, IconKey } from "./metadata-keys.js";

/**
 * Immutable metadata definition for a Lumora universal object type.
 * Stores stable i18n translation keys and icon tokens for domain separation.
 */
export interface ObjectTypeMetadata {
  /**
   * Unique machine-readable type identifier string.
   */
  readonly typeKey: ObjectTypeKey;

  /**
   * Stable i18n translation key for display name.
   */
  readonly displayNameKey: TranslationKey;

  /**
   * Stable i18n translation key for functional description.
   */
  readonly descriptionKey: TranslationKey;

  /**
   * Stable abstract icon key token for UI resolution.
   */
  readonly iconKey?: IconKey | undefined;

  /**
   * List of domain behavior extension keys supported by this object type.
   */
  readonly supportedExtensions: readonly BehaviorExtensionKey[];
}
