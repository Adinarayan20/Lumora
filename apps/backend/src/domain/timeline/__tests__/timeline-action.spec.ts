import { describe, it, expect } from 'vitest';
import { DomainValidationException } from '@lumora/shared';
import { TimelineAction } from '../value-objects/timeline-action.js';

describe('TimelineAction Value Object', () => {
  it('should trim and uppercase timeline action names', () => {
    const action = TimelineAction.create('  object_created  ');
    expect(action.getValue()).toBe('OBJECT_CREATED');
  });

  it('should throw DomainValidationException for action names exceeding limit', () => {
    expect(() => TimelineAction.create('X'.repeat(70))).toThrow(
      DomainValidationException,
    );
  });
});
