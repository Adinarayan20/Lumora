import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdGenerator } from '@lumora/shared';
import { CreateObjectUseCase } from '../create-object.use-case.js';
import type { IObjectRepository } from '../../../../domain/objects/repositories/object.repository.interface.js';

describe('CreateObjectUseCase', () => {
  let useCase: CreateObjectUseCase;
  let mockObjectRepository: IObjectRepository;

  beforeEach(() => {
    mockObjectRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null),
      findByObjectKey: vi.fn().mockResolvedValue(null),
      existsByObjectKey: vi.fn().mockResolvedValue(false),
      exists: vi.fn().mockResolvedValue(true),
      delete: vi.fn().mockResolvedValue(undefined),
      findPaginated: vi.fn().mockResolvedValue({
        items: [],
        pageInfo: {
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    };

    useCase = new CreateObjectUseCase(mockObjectRepository);
  });

  it('should successfully create an object aggregate and return an ObjectResponseDto', async () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    const result = await useCase.execute({
      workspaceId: wsId,
      createdById: userId,
      dto: {
        typeKey: 'NOTE',
        title: 'Project Architecture Plan',
        description: 'Detailed unit boundaries',
      },
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.workspaceId).toBe(wsId);
    expect(dto.createdById).toBe(userId);
    expect(dto.title).toBe('Project Architecture Plan');
    expect(dto.typeKey).toBe('NOTE');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockObjectRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should fail gracefully when aggregate creation encounters invariant failure', async () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    const result = await useCase.execute({
      workspaceId: wsId,
      createdById: userId,
      dto: {
        typeKey: 'NOTE',
        title: '', // Empty title triggers Guard failure
      },
    });

    expect(result.isFailure).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockObjectRepository.save).not.toHaveBeenCalled();
  });
});
