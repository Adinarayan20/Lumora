import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniqueEntityId, IdGenerator } from '@lumora/shared';
import { PrismaUserSettingsRepository } from '../prisma-user-settings.repository.js';
import { UserSettingsAggregate } from '../../../../domain/settings/user-settings.aggregate.js';
import { PrismaService } from '../../prisma.service.js';

describe('PrismaUserSettingsRepository Unit Tests', () => {
  let repository: PrismaUserSettingsRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    repository = new PrismaUserSettingsRepository(mockPrisma as unknown as PrismaService);
  });

  it('should find user settings and reconstitute domain aggregate', async () => {
    const userId = new UniqueEntityId();

    mockPrisma.user.findUnique.mockResolvedValue({
      id: userId.toString(),
      timezone: 'America/Los_Angeles',
      locale: 'en',
      updatedAt: new Date(),
    });

    const aggregate = await repository.findByUserId(userId);

    expect(aggregate).not.toBeNull();
    expect(aggregate?.timezone.getValue()).toBe('America/Los_Angeles');
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId.toString() },
    });
  });

  it('should update user settings in database', async () => {
    const userId = new UniqueEntityId();
    const aggregate = UserSettingsAggregate.create({
      userId,
      timezone: 'Europe/London',
      locale: 'en-GB',
    });

    mockPrisma.user.update.mockResolvedValue({
      id: userId.toString(),
      timezone: 'Europe/London',
      locale: 'en-GB',
    });

    await repository.save(aggregate);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: userId.toString() },
      data: {
        timezone: 'Europe/London',
        locale: 'en-GB',
      },
    });
  });
});
