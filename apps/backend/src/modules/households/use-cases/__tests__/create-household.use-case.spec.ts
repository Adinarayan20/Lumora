import { describe, it, expect, vi } from 'vitest';
import { IdGenerator } from '@lumora/shared';
import { CreateHouseholdUseCase } from '../create-household.use-case.js';
import type { IHouseholdRepository } from '../../../../domain/households/repositories/household.repository.interface.js';

describe('CreateHouseholdUseCase', () => {
  it('should create household aggregate and return HouseholdResponseDto', async () => {
    const wsId = IdGenerator.generate().toString();
    const ownerId = IdGenerator.generate().toString();

    const mockRepo: IHouseholdRepository = {
      findById: vi.fn(),
      findByWorkspaceId: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
    };

    const useCase = new CreateHouseholdUseCase(mockRepo);
    const result = await useCase.execute({
      dto: {
        workspaceId: wsId,
        name: 'Johnson Household',
        ownerUserId: ownerId,
      },
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.name).toBe('Johnson Household');
    expect(dto.members).toHaveLength(1);
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
