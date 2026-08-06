import { DomainValidationException } from '../errors/domain-exceptions.js';
import type { ObjectTypeMetadata } from './object-type-metadata.interface.js';
import type { BehaviorExtensionKey } from './behavior-extension-key.js';
import { BUILT_IN_CATALOG_DEFINITIONS } from './catalog-definitions.js';

/**
 * Deterministic, lightweight static registry for Lumora Universal Object metadata definitions.
 * Provides O(1) metadata lookups without dynamic code loading or execution bloat.
 */
export class ObjectCatalogRegistry {
  private static readonly catalogMap: ReadonlyMap<string, ObjectTypeMetadata> = new Map(
    BUILT_IN_CATALOG_DEFINITIONS.map((def) => [def.typeKey, def]),
  );

  /**
   * Retrieves type metadata for a given object typeKey string.
   */
  public static get(typeKey: string): ObjectTypeMetadata | undefined {
    return this.catalogMap.get(typeKey);
  }

  /**
   * Returns a list of all registered object type metadata definitions.
   */
  public static getAll(): readonly ObjectTypeMetadata[] {
    return Array.from(this.catalogMap.values());
  }

  /**
   * Evaluates whether a given object typeKey string is registered in the catalog.
   */
  public static has(typeKey: string): boolean {
    return this.catalogMap.has(typeKey);
  }

  /**
   * Evaluates whether an object type supports a given domain behavior extension.
   */
  public static supportsExtension(typeKey: string, extensionKey: BehaviorExtensionKey): boolean {
    const metadata = this.get(typeKey);
    if (!metadata) {
      return false;
    }
    return metadata.supportedExtensions.includes(extensionKey);
  }

  /**
   * Asserts that a given typeKey string is valid and registered.
   * @throws {DomainValidationException} if the typeKey is not registered in the catalog.
   */
  public static assertValidTypeKey(typeKey: string): void {
    if (!this.has(typeKey)) {
      throw new DomainValidationException(
        `Invalid object typeKey '${typeKey}'. Type key is not registered in the Object Catalog.`,
        { typeKey: [`Object type '${typeKey}' is not supported by the platform.`] },
      );
    }
  }
}
