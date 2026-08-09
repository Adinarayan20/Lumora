import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdGenerator } from '@lumora/shared';
import { CreateObjectUseCase } from '../create-object.use-case.js';
import type { IObjectAggregateRepository } from '../../../../domain/objects/repositories/object-aggregate.repository.interface.js';
import type { ObjectAggregateRepositoryFactory } from '../../objects.tokens.js';

describe('CreateObjectUseCase', () => {
  let useCase: CreateObjectUseCase;
  let mockObjectRepository: IObjectAggregateRepository;
  let mockFactory: ObjectAggregateRepositoryFactory;

  beforeEach(() => {
    mockObjectRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null),
      findByObjectKey: vi.fn().mockResolvedValue(null),
      existsByObjectKey: vi.fn().mockResolvedValue(false),
      exists: vi.fn().mockResolvedValue(false),
      delete: vi.fn().mockResolvedValue(undefined),
      findPaginated: vi.fn().mockResolvedValue({
        items: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    };

    // Factory returns the same mock repository regardless of workspaceId/userId
    mockFactory = vi.fn().mockReturnValue(mockObjectRepository);

    useCase = new CreateObjectUseCase(mockFactory);
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
    expect(mockFactory).toHaveBeenCalledWith(wsId, userId);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockObjectRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should fail gracefully when aggregate creation encounters invariant failure (empty title)', async () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    const result = await useCase.execute({
      workspaceId: wsId,
      createdById: userId,
      dto: {
        typeKey: 'NOTE',
        title: '', // Empty title triggers ObjectTitle Guard failure
      },
    });

    expect(result.isFailure).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockObjectRepository.save).not.toHaveBeenCalled();
  });

  it('should fail gracefully when typeKey is not registered in ObjectCatalogRegistry', async () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();

    const result = await useCase.execute({
      workspaceId: wsId,
      createdById: userId,
      dto: {
        typeKey: 'INVALID_UNREGISTERED_TYPE',
        title: 'Test Object',
      },
    });

    expect(result.isFailure).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockObjectRepository.save).not.toHaveBeenCalled();
  });
});
