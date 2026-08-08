import { describe, it, expect, vi } from 'vitest';
import { FieldType } from '@lumora/shared';
import { FieldRegistry, defaultFieldRegistry } from './FieldRegistry';
import { StringFieldAdapter } from './adapters/StringFieldAdapter';
import { NumberFieldAdapter } from './adapters/NumberFieldAdapter';
import { BooleanFieldAdapter } from './adapters/BooleanFieldAdapter';
import { EnumFieldAdapter } from './adapters/EnumFieldAdapter';
import { UnresolvedFieldAdapter } from './adapters/UnresolvedFieldAdapter';

describe('FieldRegistry Architecture Contract', () => {
  it('resolves built-in adapters on defaultFieldRegistry', () => {
    expect(defaultFieldRegistry.get(FieldType.STRING)).toBe(StringFieldAdapter);
    expect(defaultFieldRegistry.get(FieldType.NUMBER)).toBe(NumberFieldAdapter);
    expect(defaultFieldRegistry.get(FieldType.BOOLEAN)).toBe(BooleanFieldAdapter);
    expect(defaultFieldRegistry.get(FieldType.ENUM)).toBe(EnumFieldAdapter);
  });

  it('resolves UnresolvedFieldAdapter for deferred or unregistered field types', () => {
    expect(defaultFieldRegistry.get(FieldType.DATE)).toBe(UnresolvedFieldAdapter);
    expect(defaultFieldRegistry.get(FieldType.RELATIONSHIP)).toBe(UnresolvedFieldAdapter);
    expect(defaultFieldRegistry.get(FieldType.FILE)).toBe(UnresolvedFieldAdapter);
  });

  it('allows isolated registry instantiation without global state mutation', () => {
    const customRegistry = new FieldRegistry();
    const mockAdapter = vi.fn();

    expect(customRegistry.has(FieldType.STRING)).toBe(false);

    customRegistry.register(FieldType.STRING, mockAdapter as any);
    expect(customRegistry.get(FieldType.STRING)).toBe(mockAdapter);

    // Global default registry remains unaffected
    expect(defaultFieldRegistry.get(FieldType.STRING)).toBe(StringFieldAdapter);
  });

  it('supports hierarchical child registries', () => {
    const childRegistry = defaultFieldRegistry.createChild();
    const mockCustomString = vi.fn();

    expect(childRegistry.get(FieldType.BOOLEAN)).toBe(BooleanFieldAdapter);

    childRegistry.register(FieldType.STRING, mockCustomString as any);
    expect(childRegistry.get(FieldType.STRING)).toBe(mockCustomString);
    expect(defaultFieldRegistry.get(FieldType.STRING)).toBe(StringFieldAdapter);
  });
});
