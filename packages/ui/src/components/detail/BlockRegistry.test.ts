import { describe, it, expect } from 'vitest';
import { BlockRegistry, defaultBlockRegistry } from './BlockRegistry';
import { HeaderBlockAdapter } from './adapters/HeaderBlockAdapter';
import { PropertiesBlockAdapter } from './adapters/PropertiesBlockAdapter';
import { UnresolvedBlockAdapter } from './adapters/UnresolvedBlockAdapter';
import type { DetailBlockComponent } from './BlockRegistry.types';

describe('BlockRegistry Contract', () => {
  it('pre-populates default registry with header and properties block adapters', () => {
    expect(defaultBlockRegistry.has('header')).toBe(true);
    expect(defaultBlockRegistry.has('properties')).toBe(true);
    expect(defaultBlockRegistry.get('header')).toBe(HeaderBlockAdapter);
    expect(defaultBlockRegistry.get('properties')).toBe(PropertiesBlockAdapter);
  });

  it('returns UnresolvedBlockAdapter for unregistered block keys', () => {
    const registry = new BlockRegistry();
    expect(registry.has('timeline_preview')).toBe(false);
    expect(registry.get('timeline_preview')).toBe(UnresolvedBlockAdapter);
  });

  it('allows registering custom block adapters on instance', () => {
    const registry = new BlockRegistry();
    const DummyComponent: DetailBlockComponent = () => null;

    registry.register('custom_chart', DummyComponent);
    expect(registry.has('custom_chart')).toBe(true);
    expect(registry.get('custom_chart')).toBe(DummyComponent);
  });

  it('inherits parent registrations in child registry without mutating parent', () => {
    const parent = new BlockRegistry();
    const ParentAdapter: DetailBlockComponent = () => null;
    const ChildAdapter: DetailBlockComponent = () => null;

    parent.register('parent_block', ParentAdapter);
    const child = parent.createChild();
    child.register('child_block', ChildAdapter);

    expect(child.has('parent_block')).toBe(true);
    expect(child.get('parent_block')).toBe(ParentAdapter);
    expect(child.has('child_block')).toBe(true);

    // Parent must NOT be mutated by child registration
    expect(parent.has('child_block')).toBe(false);
  });

  it('allows child registry to override parent registration safely', () => {
    const parent = new BlockRegistry();
    const ParentAdapter: DetailBlockComponent = () => null;
    const OverrideAdapter: DetailBlockComponent = () => null;

    parent.register('shared_block', ParentAdapter);
    const child = parent.createChild();
    child.register('shared_block', OverrideAdapter);

    expect(child.get('shared_block')).toBe(OverrideAdapter);
    expect(parent.get('shared_block')).toBe(ParentAdapter);
  });
});
