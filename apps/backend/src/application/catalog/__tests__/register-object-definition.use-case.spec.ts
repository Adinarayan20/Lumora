import { describe, it, expect, vi } from 'vitest';
import { UniqueEntityId, SystemTrait } from '@lumora/shared';
import { RegisterObjectDefinitionUseCase } from '../register-object-definition.use-case.js';
import type { IObjectDefinitionRegistryRepository } from '../../../domain/catalog/repositories/object-definition-registry.repository.interface.js';
import type { RedisSchemaCache } from '../../../infrastructure/catalog/redis-schema.cache.js';

describe('RegisterObjectDefinitionUseCase', () => {
  it('should register an object definition and cache it in Redis', async () => {
    const mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findByTypeKey: vi.fn().mockResolvedValue(null),
      findAllByWorkspace: vi.fn().mockResolvedValue([]),
    } as unknown as IObjectDefinitionRegistryRepository;

    const mockCache = {
      setSchema: vi.fn(),
      getSchema: vi.fn(),
      setObjectDefinition: vi.fn().mockResolvedValue(undefined),
      getObjectDefinition: vi.fn(),
    } as unknown as RedisSchemaCache;

    const useCase = new RegisterObjectDefinitionUseCase(mockRepo, mockCache);
    const workspaceId = new UniqueEntityId().toValue();

    const result = await useCase.execute({
      workspaceId,
      typeKey: 'recipe',
      name: 'Recipe',
      pluralName: 'Recipes',
      icon: 'recipe-book',
      allowedCapabilities: ['timeline', 'media'],
      traits: [SystemTrait.FAVORITABLE],
    });

    expect(result.isSuccess).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.save).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockCache.setObjectDefinition).toHaveBeenCalledWith(
      workspaceId,
      'recipe',
      expect.objectContaining({
        typeKey: 'recipe',
        name: 'Recipe',
      }),
    );
  });
});
