import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteObjectUseCase } from '../delete-object.use-case.js';
import { ObjectAggregate } from '../../../../domain/objects/object.aggregate.js';
import { ObjectTitle } from '../../../../domain/objects/value-objects/object-title.js';
import { ObjectKey } from '../../../../domain/objects/value-objects/object-key.js';
import { ObjectStatus } from '../../../../domain/objects/value-objects/object-status.js';
import {
  UniqueEntityId,
  EntityNotFoundException,
  ObjectTypeKey,
} from '@lumora/shared';
import type { ObjectAggregateRepositoryFactory } from '../../objects.tokens.js';
import type { OutboxPublisher } from '../../../../infrastructure/events/outbox/outbox-publisher.js';
import type { IUnitOfWork } from '../../../../domain/common/unit-of-work/unit-of-work.interface.js';

describe('DeleteObjectUseCase', () => {
  let useCase: DeleteObjectUseCase;
  let mockRepo: {
    findById: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let mockRepoFactory: ObjectAggregateRepositoryFactory;
  let mockOutboxPublisher: OutboxPublisher;
  let mockUnitOfWork: IUnitOfWork;

  const workspaceId = '11111111-1111-4111-a111-111111111111';
  const userId = '22222222-2222-4222-a222-222222222222';
  const objectId = '33333333-3333-4333-a333-333333333333';

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };
    mockRepoFactory = vi.fn().mockReturnValue(mockRepo);
    mockOutboxPublisher = {
      stageEvents: vi.fn().mockResolvedValue(undefined),
    } as unknown as OutboxPublisher;
    mockUnitOfWork = {
      execute: vi
        .fn()
        .mockImplementation((cb: (tx: unknown) => Promise<unknown>) =>
          Promise.resolve(cb({})),
        ),
    };

    useCase = new DeleteObjectUseCase(
      mockRepoFactory,
      mockOutboxPublisher,
      mockUnitOfWork,
    );
  });

  function createTestAggregate(): ObjectAggregate {
    return ObjectAggregate.create({
      id: new UniqueEntityId(objectId),
      workspaceId: new UniqueEntityId(workspaceId),
      createdById: new UniqueEntityId(userId),
      objectKey: ObjectKey.create('note-test'),
      typeKey: ObjectTypeKey.NOTE,
      title: ObjectTitle.create('Original Title'),
    });
  }

  it('fails with EntityNotFoundException if object does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      workspaceId,
      objectId,
      userId,
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(EntityNotFoundException);
  });

  it('soft-deletes aggregate, sets status to DELETED, and commits via UnitOfWork & Outbox', async () => {
    const aggregate = createTestAggregate();
    mockRepo.findById.mockResolvedValue(aggregate);

    const uowSpy = vi.spyOn(mockUnitOfWork, 'execute');
    const saveSpy = vi.spyOn(mockRepo, 'save');
    const outboxSpy = vi.spyOn(mockOutboxPublisher, 'stageEvents');

    const result = await useCase.execute({
      workspaceId,
      objectId,
      userId,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe(ObjectStatus.DELETED);
    expect(uowSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalled();
    expect(outboxSpy).toHaveBeenCalled();
  });
});
