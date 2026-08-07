import { describe, it, expect, beforeEach } from 'vitest';
import { UniqueEntityId } from '@lumora/shared';
import { TemplateInstallerService } from '../services/template-installer.service.js';
import { InstalledTemplateAggregate, InstalledTemplateStatus } from '../installed-template.aggregate.js';
import { TemplateUpgradeEngine } from '../services/template-upgrade-engine.js';
import { TemplateUninstallEngine, TemplateUninstallPolicy } from '../services/template-uninstall-engine.js';
import { TemplateOperationLock } from '../services/template-operation-lock.js';

describe('Sub-Milestone 3.4: Template Installer, Upgrade & Rollback Engine', () => {
  beforeEach(() => {
    TemplateOperationLock.clearAllLocks();
  });

  it('should execute dry-run installation cleanly', async () => {
    const installer = new TemplateInstallerService();
    const dryRunPlan = {
      templateKey: 'daily_journal',
      targetWorkspaceId: 'ws-123',
      installOrder: ['daily_journal'],
      newObjectDefinitions: [],
      schemaMigrations: [],
      capabilitiesToAttach: [],
      seedObjectsToCreate: [],
      warnings: [],
      isDryRun: true,
    };

    const result = await installer.install(dryRunPlan, new UniqueEntityId());
    expect(result.isSuccess).toBe(true);
  });

  it('should upgrade installed template and handle uninstall policy', async () => {
    const instance = InstalledTemplateAggregate.create({
      workspaceId: new UniqueEntityId(),
      templateKey: 'daily_journal',
      installedVersion: '1.0.0',
    });

    const upgradePlan = {
      templateKey: 'daily_journal',
      targetWorkspaceId: instance.workspaceId.toString(),
      installOrder: ['daily_journal'],
      newObjectDefinitions: [],
      schemaMigrations: [],
      capabilitiesToAttach: [],
      seedObjectsToCreate: [],
      warnings: [],
      isDryRun: false,
    };

    const upgradeResult = await TemplateUpgradeEngine.applyUpgrade(instance, upgradePlan, '1.1.0');
    expect(upgradeResult.isSuccess).toBe(true);
    expect(instance.installedVersion).toBe('1.1.0');
    expect(instance.status).toBe(InstalledTemplateStatus.UPGRADED);

    const uninstallResult = await TemplateUninstallEngine.uninstall(
      instance,
      TemplateUninstallPolicy.KEEP_OBJECTS_DETACH_METADATA,
    );
    expect(uninstallResult.isSuccess).toBe(true);
  });
});
