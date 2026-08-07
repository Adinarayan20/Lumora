import { describe, it, expect, beforeEach } from 'vitest';
import { UniqueEntityId, STARTER_LIBRARY_CATALOG } from '@lumora/shared';
import { DefaultTemplatePolicyEngine } from '../services/template-policy-engine.js';
import { TemplatePlannerService } from '../services/template-planner.service.js';
import { TemplateOperationLock } from '../services/template-operation-lock.js';

describe('Sub-Milestone 3.3: Dependency Resolver, Compatibility Checker & Template Planner', () => {
  beforeEach(() => {
    TemplateOperationLock.clearAllLocks();
  });

  it('should generate valid TemplatePlan for starter library templates', async () => {
    const policyEngine = new DefaultTemplatePolicyEngine();
    const planner = new TemplatePlannerService(policyEngine);

    const targetTemplate = STARTER_LIBRARY_CATALOG[0]; // Daily Journal
    const result = await planner.planInstallation(targetTemplate, new UniqueEntityId(), {
      dryRun: true,
    });

    expect(result.isSuccess).toBe(true);
    const plan = result.getValue();
    expect(plan.templateKey).toBe('daily_journal');
    expect(plan.isDryRun).toBe(true);
    expect(plan.newObjectDefinitions.length).toBe(1);
  });

  it('should manage exclusive workspace template operation locking', () => {
    const wsId = 'ws-123';
    const tplKey = 'daily_journal';

    const lock1 = TemplateOperationLock.acquireLock(wsId, tplKey, 'install');
    expect(lock1.acquired).toBe(true);

    const lock2 = TemplateOperationLock.acquireLock(wsId, tplKey, 'install');
    expect(lock2.acquired).toBe(false);

    TemplateOperationLock.releaseLock(wsId, tplKey, lock1.lockId!);

    const lock3 = TemplateOperationLock.acquireLock(wsId, tplKey, 'install');
    expect(lock3.acquired).toBe(true);
  });
});
