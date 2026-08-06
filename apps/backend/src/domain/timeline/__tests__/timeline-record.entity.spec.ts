import { describe, it, expect } from 'vitest';
import {
  IdGenerator,
  UniqueEntityId,
  DomainValidationException,
} from '@lumora/shared';
import { TimelineRecordEntity } from '../entities/timeline-record.entity.js';

describe('TimelineRecordEntity Invariants & Ledger Rules', () => {
  it('should successfully create an immutable TimelineRecordEntity', () => {
    const wsId = new UniqueEntityId(IdGenerator.generate());
    const userId = new UniqueEntityId(IdGenerator.generate());
    const entityId = new UniqueEntityId(IdGenerator.generate());

    const record = TimelineRecordEntity.create({
      workspaceId: wsId,
      userId,
      entityCategory: 'OBJECT',
      entityId,
      action: 'OBJECT_CREATED',
      metadata: { source: 'WEB_APP' },
    });

    expect(record.workspaceId.toString()).toBe(wsId.toString());
    expect(record.userId.toString()).toBe(userId.toString());
    expect(record.action.getValue()).toBe('OBJECT_CREATED');
    expect(record.entityCategory.getValue()).toBe('OBJECT');
  });

  it('should throw DomainValidationException if action name exceeds 64 characters', () => {
    const wsId = new UniqueEntityId(IdGenerator.generate());
    const userId = new UniqueEntityId(IdGenerator.generate());
    const entityId = new UniqueEntityId(IdGenerator.generate());

    expect(() =>
      TimelineRecordEntity.create({
        workspaceId: wsId,
        userId,
        entityCategory: 'OBJECT',
        entityId,
        action: 'A'.repeat(70),
      }),
    ).toThrow(DomainValidationException);
  });
});
