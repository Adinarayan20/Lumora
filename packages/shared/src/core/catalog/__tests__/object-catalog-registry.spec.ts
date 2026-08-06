import { describe, it, expect } from 'vitest';
import { ObjectCatalogRegistry } from '../object-catalog-registry.js';
import { ObjectTypeKey } from '../object-type-key.js';
import { BehaviorExtensionKey } from '../behavior-extension-key.js';
import { DomainValidationException } from '../../errors/domain-exceptions.js';

describe('ObjectCatalogRegistry', () => {
  it('should retrieve metadata for built-in object types with stable i18n and icon keys', () => {
    const taskMeta = ObjectCatalogRegistry.get(ObjectTypeKey.TASK);

    expect(taskMeta).toBeDefined();
    expect(taskMeta?.displayNameKey).toBe('object.type.task.name');
    expect(taskMeta?.descriptionKey).toBe('object.type.task.description');
    expect(taskMeta?.iconKey).toBe('task');
    expect(taskMeta?.supportedExtensions).toContain(BehaviorExtensionKey.REMINDER);
  });

  it('should return all registered metadata definitions', () => {
    const allMeta = ObjectCatalogRegistry.getAll();

    expect(allMeta.length).toBeGreaterThanOrEqual(6);
    expect(allMeta.some((m) => m.typeKey === ObjectTypeKey.NOTE)).toBe(true);
    expect(allMeta.some((m) => m.typeKey === ObjectTypeKey.HABIT)).toBe(true);
  });

  it('should accurately verify type presence using has()', () => {
    expect(ObjectCatalogRegistry.has(ObjectTypeKey.EVENT)).toBe(true);
    expect(ObjectCatalogRegistry.has('UNKNOWN_TYPE')).toBe(false);
  });

  it('should verify supported extension bindings', () => {
    expect(ObjectCatalogRegistry.supportsExtension(ObjectTypeKey.TASK, BehaviorExtensionKey.REMINDER)).toBe(true);
    expect(ObjectCatalogRegistry.supportsExtension(ObjectTypeKey.NOTE, BehaviorExtensionKey.REMINDER)).toBe(false);
  });

  it('should assert valid type keys and throw DomainValidationException for unregistered keys', () => {
    expect(() => ObjectCatalogRegistry.assertValidTypeKey(ObjectTypeKey.NOTE)).not.toThrow();
    expect(() => ObjectCatalogRegistry.assertValidTypeKey('INVALID_TYPE_KEY')).toThrow(DomainValidationException);
  });
});
