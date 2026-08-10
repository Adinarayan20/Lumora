import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateObjectUseCase } from '../update-object.use-case.js';
import { ObjectAggregate } from '../../../../domain/objects/object.aggregate.js';
import { ObjectTitle } from '../../../../domain/objects/value-objects/object-title.js';
import { ObjectKey } from '../../../../domain/objects/value-objects/object-key.js';
import {
  UniqueEntityId,
  RevisionConflictException,
  EntityNotFoundException,
  ObjectTypeKey,
} from '@lumora/shared';
import type { ObjectAggregateRepositoryFactory } from '../../objects.tokens.js';
import type { OutboxPublisher } from '../../../../infrastructure/events/outbox/outbox-publisher.js';
import type { IUnitOfWork } from '../../../../domain/common/unit-of-work/unit-of-work.interface.js';

describe('UpdateObjectUseCase', () => {
  let useCase: UpdateObjectUseCase;
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

    useCase = new UpdateObjectUseCase(
      mockRepoFactory,
      mockOutboxPublisher,
      mockUnitOfWork,
    );
  });

  function createTestAggregate(revision = 1): ObjectAggregate {
    return ObjectAggregate.create({
      id: new UniqueEntityId(objectId),
      workspaceId: new UniqueEntityId(workspaceId),
      createdById: new UniqueEntityId(userId),
      objectKey: ObjectKey.create('note-test'),
      typeKey: ObjectTypeKey.NOTE,
      title: ObjectTitle.create('Original Title'),
      revision,
    });
  }

  it('fails with EntityNotFoundException if object does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      workspaceId,
      objectId,
      userId,
      dto: { title: 'New Title' },
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(EntityNotFoundException);
  });

  it('fails with RevisionConflictException if supplied revision does not match stored revision', async () => {
    const aggregate = createTestAggregate(2);
    mockRepo.findById.mockResolvedValue(aggregate);

    const result = await useCase.execute({
      workspaceId,
      objectId,
      userId,
      dto: { title: 'New Title', revision: 1 },
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(RevisionConflictException);
  });

  it('successfully updates aggregate, increments revision, and commits via UnitOfWork & Outbox', async () => {
    const aggregate = createTestAggregate(1);
    mockRepo.findById.mockResolvedValue(aggregate);

    const uowSpy = vi.spyOn(mockUnitOfWork, 'execute');
    const saveSpy = vi.spyOn(mockRepo, 'save');
    const outboxSpy = vi.spyOn(mockOutboxPublisher, 'stageEvents');

    const result = await useCase.execute({
      workspaceId,
      objectId,
      userId,
      dto: { title: 'Updated Title', revision: 1 },
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().title).toBe('Updated Title');
    expect(result.getValue().revision).toBe(2);
    expect(uowSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalled();
    expect(outboxSpy).toHaveBeenCalled();
  });
});
