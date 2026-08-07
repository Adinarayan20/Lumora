import { describe, it, expect, vi } from 'vitest';
import { UniqueEntityId, FieldType } from '@lumora/shared';
import { RegisterSchemaUseCase } from '../register-schema.use-case.js';
import type { ISchemaRegistryRepository } from '../../../domain/catalog/repositories/schema-registry.repository.interface.js';
import type { RedisSchemaCache } from '../../../infrastructure/catalog/redis-schema.cache.js';

describe('RegisterSchemaUseCase', () => {
  it('should register a new schema aggregate and populate Redis cache', async () => {
    const mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findByTypeKey: vi.fn().mockResolvedValue(null),
      findAllByWorkspace: vi.fn().mockResolvedValue([]),
    } as unknown as ISchemaRegistryRepository;

    const mockCache = {
      setSchema: vi.fn().mockResolvedValue(undefined),
      getSchema: vi.fn(),
      setObjectDefinition: vi.fn(),
      getObjectDefinition: vi.fn(),
    } as unknown as RedisSchemaCache;

    const useCase = new RegisterSchemaUseCase(mockRepo, mockCache);
    const workspaceId = new UniqueEntityId().toValue();

    const result = await useCase.execute({
      workspaceId,
      typeKey: 'habit',
      fields: [
        {
          key: 'frequency',
          label: 'Frequency',
          type: FieldType.STRING,
        },
      ],
    });

    expect(result.isSuccess).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.save).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockCache.setSchema).toHaveBeenCalledWith(
      workspaceId,
      'habit',
      expect.objectContaining({
        typeKey: 'habit',
        schemaVersion: 1,
      }),
    );
  });
});
