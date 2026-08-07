import { describe, it, expect, vi } from 'vitest';
import { UniqueEntityId, FieldType } from '@lumora/shared';
import { GetSchemaDefinitionQueryHandler } from '../get-schema-definition.query.js';
import { GetObjectDefinitionQueryHandler } from '../get-object-definition.query.js';
import { SchemaRegistryAggregate } from '../../../domain/catalog/schema-registry.aggregate.js';
import { ObjectDefinitionRegistryAggregate } from '../../../domain/catalog/object-definition-registry.aggregate.js';
import type { ISchemaRegistryRepository } from '../../../domain/catalog/repositories/schema-registry.repository.interface.js';
import type { IObjectDefinitionRegistryRepository } from '../../../domain/catalog/repositories/object-definition-registry.repository.interface.js';
import type { RedisSchemaCache } from '../../../infrastructure/catalog/redis-schema.cache.js';

describe('Catalog Query Handlers (Cache-First)', () => {
  it('should return schema definition from cache when present', async () => {
    const cachedSchema = {
      typeKey: 'task',
      schemaVersion: 1,
      fields: [{ key: 'due', label: 'Due Date', type: FieldType.DATE }],
    };

    const mockRepo = {
      findByTypeKey: vi.fn(),
    } as unknown as ISchemaRegistryRepository;

    const mockCache = {
      getSchema: vi.fn().mockResolvedValue(cachedSchema),
      setSchema: vi.fn(),
    } as unknown as RedisSchemaCache;

    const handler = new GetSchemaDefinitionQueryHandler(mockRepo, mockCache);

    const result = await handler.execute({
      workspaceId: 'ws-123',
      typeKey: 'task',
    });

    expect(result).toEqual(cachedSchema);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.findByTypeKey).not.toHaveBeenCalled();
  });

  it('should fall back to repository and populate cache when cache misses', async () => {
    const workspaceId = new UniqueEntityId();
    const aggregate = SchemaRegistryAggregate.create({
      workspaceId,
      typeKey: 'note',
      schemaVersion: 1,
      fields: [],
    });

    const mockRepo = {
      findByTypeKey: vi.fn().mockResolvedValue(aggregate),
    } as unknown as ISchemaRegistryRepository;

    const mockCache = {
      getSchema: vi.fn().mockResolvedValue(null),
      setSchema: vi.fn().mockResolvedValue(undefined),
    } as unknown as RedisSchemaCache;

    const handler = new GetSchemaDefinitionQueryHandler(mockRepo, mockCache);

    const result = await handler.execute({
      workspaceId: workspaceId.toValue(),
      typeKey: 'note',
    });

    expect(result?.typeKey).toBe('note');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.findByTypeKey).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockCache.setSchema).toHaveBeenCalledWith(
      workspaceId.toValue(),
      'note',
      expect.objectContaining({ typeKey: 'note' }),
    );
  });

  it('should return object definition from repository when cache misses', async () => {
    const workspaceId = new UniqueEntityId();
    const aggregate = ObjectDefinitionRegistryAggregate.create({
      workspaceId,
      typeKey: 'habit',
      name: 'Habit Log',
      pluralName: 'Habit Logs',
      icon: 'icon-habit',
      allowedCapabilities: ['timeline'],
      traits: [],
      schemaVersion: 1,
    });

    const mockRepo = {
      findByTypeKey: vi.fn().mockResolvedValue(aggregate),
    } as unknown as IObjectDefinitionRegistryRepository;

    const mockCache = {
      getObjectDefinition: vi.fn().mockResolvedValue(null),
      setObjectDefinition: vi.fn().mockResolvedValue(undefined),
    } as unknown as RedisSchemaCache;

    const handler = new GetObjectDefinitionQueryHandler(mockRepo, mockCache);

    const result = await handler.execute({
      workspaceId: workspaceId.toValue(),
      typeKey: 'habit',
    });

    expect(result?.name).toBe('Habit Log');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockCache.setObjectDefinition).toHaveBeenCalled();
  });
});
