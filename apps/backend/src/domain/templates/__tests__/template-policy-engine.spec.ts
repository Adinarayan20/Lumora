import { describe, it, expect } from 'vitest';
import {
  UniqueEntityId,
  PublisherTrustLevel,
  TemplateCategory,
} from '@lumora/shared';
import { DefaultTemplatePolicyEngine } from '../services/template-policy-engine.js';

describe('Sub-Milestone 3.2: Template Policy Engine', () => {
  it('should allow valid template manifest and flag dangerous permissions', async () => {
    const engine = new DefaultTemplatePolicyEngine();
    const manifest = {
      id: 'tpl-test',
      packageUuid: 'b8e9a6c4-1111-4000-8000-000000000001',
      publisherUuid: '00000000-0000-4000-8000-000000000000',
      packageHash: 'sha256-test',
      key: 'test_template',
      name: 'Test Template',
      description: 'Description',
      category: TemplateCategory.LIFE_OS,
      version: '1.0.0',
      minPlatformVersion: '1.0.0',
      author: {
        name: 'Tester',
        publisherId: 'test-publisher',
        trustLevel: PublisherTrustLevel.LOCAL,
      },
      license: 'MIT',
      dependencies: [],
      capabilities: [],
      permissions: {
        requiredPermissions: ['timeline.write'],
        dangerousPermissions: ['system.background_jobs'],
      },
      icon: 'icon',
      tags: [],
    };

    const evaluation = await engine.evaluate(manifest, new UniqueEntityId());
    expect(evaluation.allowed).toBe(true);
    expect(evaluation.warnings.length).toBe(1);
    expect(evaluation.warnings[0]).toContain('dangerous permission');
  });
});
