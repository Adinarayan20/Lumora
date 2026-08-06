/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniqueEntityId, IdGenerator } from '@lumora/shared';
import { PrismaHouseholdRepository } from '../prisma-household.repository.js';
import { HouseholdAggregate } from '../../../../domain/households/household.aggregate.js';

describe('PrismaHouseholdRepository Unit Tests', () => {
  let repository: PrismaHouseholdRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      workspace: {
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    repository = new PrismaHouseholdRepository(mockPrisma);
  });

  it('should find family workspace household and map members', async () => {
    const wsId = new UniqueEntityId();
    const ownerId = IdGenerator.generate().toString();

    mockPrisma.workspace.findFirst.mockResolvedValue({
      id: wsId.toString(),
      name: 'Taylor Household',
      type: 'FAMILY',
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [
        {
          id: IdGenerator.generate().toString(),
          workspaceId: wsId.toString(),
          userId: ownerId,
          joinedAt: new Date(),
        },
      ],
    });

    const household = await repository.findById(wsId);

    expect(household).not.toBeNull();
    expect(household?.name.getValue()).toBe('Taylor Household');
    expect(household?.members).toHaveLength(1);
    expect(household?.members[0].role).toBe('OWNER');
  });

  it('should update household workspace name in database', async () => {
    const wsId = new UniqueEntityId();
    const ownerId = new UniqueEntityId();

    const household = HouseholdAggregate.create({
      workspaceId: wsId,
      name: 'Taylor Family Updated',
      ownerUserId: ownerId,
    });

    mockPrisma.workspace.update.mockResolvedValue({
      id: wsId.toString(),
      name: 'Taylor Family Updated',
    });

    await repository.save(household);

    expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
      where: { id: household.id.toString() },
      data: { name: 'Taylor Family Updated' },
    });
  });
});
