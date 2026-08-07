import { describe, it, expect } from 'vitest';
import { STARTER_LIBRARY_CATALOG } from '../starter-library.catalog.js';
import { TemplateValidator } from '../template-validator.js';
import {
  CapabilityCompatibilityRegistry,
  CompatibilityResolver,
} from '../capability-compatibility-matrix.js';
import { PublisherTrustLevel } from '../publisher-trust-level.js';

describe('Sub-Milestone 3.1: Template Contracts & Starter Catalog', () => {
  it('should validate all 5 production starter templates in STARTER_LIBRARY_CATALOG', () => {
    expect(STARTER_LIBRARY_CATALOG.length).toBe(5);

    for (const pkg of STARTER_LIBRARY_CATALOG) {
      const validationResult = TemplateValidator.validate(pkg);
      expect(validationResult.isSuccess).toBe(true);
      expect(pkg.manifest.author.trustLevel).toBe(PublisherTrustLevel.OFFICIAL);
      expect(pkg.manifest.packageUuid).toBeDefined();
      expect(pkg.manifest.publisherUuid).toBeDefined();
      expect(pkg.manifest.packageHash).toBeDefined();
    }
  });

  it('should fail validation when manifest is missing required properties', () => {
    const invalidPkg = {
      manifest: {
        id: '',
        packageUuid: '',
        publisherUuid: '',
        packageHash: '',
        key: '',
        name: '',
        description: 'Test',
        category: 'LIFE_OS' as any,
        version: '1.0.0',
        minPlatformVersion: '1.0.0',
        author: {
          name: 'Test',
          publisherId: 'test',
          trustLevel: PublisherTrustLevel.LOCAL,
        },
        license: 'MIT',
        dependencies: [],
        capabilities: [],
        permissions: { requiredPermissions: [] },
        icon: 'icon',
        tags: [],
      },
      content: {
        objectDefinitions: [],
        schemaDefinitions: [],
      },
    };

    const result = TemplateValidator.validate(invalidPkg);
    expect(result.isFailure).toBe(true);
  });

  it('should evaluate capability compatibility correctly via CompatibilityResolver', () => {
    const registry = new CapabilityCompatibilityRegistry();
    registry.registerDefinition({
      id: 'rule-timeline-search',
      capabilityKey: 'timeline',
      targetCapabilityKey: 'search',
      compatible: true,
    });

    const resolver = new CompatibilityResolver(registry);
    const result = resolver.evaluate(
      [
        { key: 'timeline', versionConstraint: '>=1.0.0' },
        { key: 'search', versionConstraint: '>=1.0.0' },
      ],
      {
        platformVersion: '1.0.0',
        featureFlags: {},
      },
    );

    expect(result.compatible).toBe(true);
    expect(result.evaluatedRulesCount).toBe(1);
  });
});
