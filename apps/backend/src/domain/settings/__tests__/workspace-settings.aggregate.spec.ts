import { describe, it, expect } from 'vitest';
import { IdGenerator, UniqueEntityId, DomainValidationException } from '@lumora/shared';
import { WorkspaceSettingsAggregate } from '../workspace-settings.aggregate.js';

describe('WorkspaceSettingsAggregate', () => {
  it('should create default WorkspaceSettingsAggregate', () => {
    const wsId = new UniqueEntityId(IdGenerator.generate());
    const settings = WorkspaceSettingsAggregate.create({ workspaceId: wsId });

    expect(settings.workspaceId.toString()).toBe(wsId.toString());
    expect(settings.retentionDays.getDays()).toBe(365);
    expect(settings.allowGuestAccess).toBe(false);
  });

  it('should throw DomainValidationException if retention days is out of bounds', () => {
    const wsId = new UniqueEntityId(IdGenerator.generate());

    expect(() =>
      WorkspaceSettingsAggregate.create({
        workspaceId: wsId,
        retentionDays: 5000,
      }),
    ).toThrow(DomainValidationException);
  });
});
