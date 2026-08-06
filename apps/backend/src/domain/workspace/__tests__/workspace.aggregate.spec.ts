import { describe, it, expect } from 'vitest';
import { WorkspaceAggregate } from '../workspace.aggregate.js';
import { WorkspaceSlug } from '../value-objects/workspace-slug.js';
import { WorkspaceMemberPolicy } from '../policies/workspace-member.policy.js';
import { WorkspacePlan } from '../value-objects/workspace-enums.js';
import { UniqueEntityId, DomainValidationException } from '@lumora/shared';

describe('WorkspaceAggregate Domain Root', () => {
  const validSlug = WorkspaceSlug.create('acme-corp');
  const ownerId = new UniqueEntityId();

  it('should create workspace aggregate and record WorkspaceCreatedEvent', () => {
    const workspace = WorkspaceAggregate.create({
      name: 'Acme Corporation',
      slug: validSlug,
      ownerId,
    });

    expect(workspace.id).toBeDefined();
    expect(workspace.slug.toValue()).toBe('acme-corp');
    expect(workspace.hasUncommittedEvents()).toBe(true);
    expect(workspace.domainEvents[0].eventName).toBe('workspace.created');
  });

  it('should transfer ownership cleanly and emit event', () => {
    const workspace = WorkspaceAggregate.create({
      name: 'Acme Corporation',
      slug: validSlug,
      ownerId,
    });

    const newOwnerId = new UniqueEntityId();
    workspace.transferOwnership(newOwnerId);

    expect(workspace.ownerId.equals(newOwnerId)).toBe(true);
    expect(workspace.domainEvents.some((e) => e.eventName === 'workspace.ownership_transferred')).toBe(true);
  });

  it('should enforce member plan quota invariants in policy', () => {
    expect(() =>
      WorkspaceMemberPolicy.validateMemberAddition(5, WorkspacePlan.FREE),
    ).toThrow(DomainValidationException);

    expect(() =>
      WorkspaceMemberPolicy.validateMemberAddition(4, WorkspacePlan.FREE),
    ).not.toThrow();
  });
});
