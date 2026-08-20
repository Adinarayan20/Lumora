import { Inject, Injectable } from '@nestjs/common';
import {
  Result,
  UniqueEntityId,
  ObjectTypeKey,
  IdGenerator,
} from '@lumora/shared';
import { ObjectAggregate } from '../../../domain/objects/object.aggregate.js';
import { ObjectTitle } from '../../../domain/objects/value-objects/object-title.js';
import { ObjectKey } from '../../../domain/objects/value-objects/object-key.js';
import { CreateObjectDto } from '../dto/create-object.dto.js';
import { ObjectResponseDto } from '../dto/object-response.dto.js';
import { ObjectResponseMapper } from '../mappers/object-response.mapper.js';
import {
  OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN,
  type ObjectAggregateRepositoryFactory,
} from '../objects.tokens.js';
import { OutboxPublisher } from '../../../infrastructure/events/outbox/outbox-publisher.js';
import { UNIT_OF_WORK } from '../../../domain/common/unit-of-work/unit-of-work.interface.js';
import type { IUnitOfWork } from '../../../domain/common/unit-of-work/unit-of-work.interface.js';
import type { ITransactionContext } from '../../../domain/common/unit-of-work/transaction-context.interface.js';

export interface CreateObjectCommand {
  workspaceId: string;
  createdById: string;
  dto: CreateObjectDto;
}

/**
 * Creates a new Universal Object via the domain aggregate path.
 *
 * Transaction boundary: Object insert + Outbox staging happen atomically
 * inside a single PrismaUnitOfWork.$transaction(). If either fails, both roll back.
 *
 * Domain events emitted by ObjectAggregate.create() are pulled after the
 * aggregate is assembled and staged to the OutboxMessage table before commit.
 */
@Injectable()
export class CreateObjectUseCase {
  constructor(
    @Inject(OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN)
    private readonly repositoryFactory: ObjectAggregateRepositoryFactory,
    private readonly outboxPublisher: OutboxPublisher,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: CreateObjectCommand,
  ): Promise<Result<ObjectResponseDto, Error>> {
    try {
      const { workspaceId, createdById, dto } = command;

      const objectRepository = this.repositoryFactory(workspaceId, createdById);

      // Unique objectKey check before transaction (read-only, not in tx)
      let keyStr = dto.objectKey?.trim();
      if (!keyStr) {
        const randomSuffix = IdGenerator.generate().substring(0, 8);
        keyStr = `${dto.typeKey.toLowerCase()}-${randomSuffix}`;
      }
      const keyObj = ObjectKey.create(keyStr);
      const keyExists = await objectRepository.existsByObjectKey(
        new UniqueEntityId(workspaceId),
        keyObj,
      );
      if (keyExists) {
        keyStr = `${dto.typeKey.toLowerCase()}-${IdGenerator.generate().substring(0, 8)}`;
      }

      const titleObj = ObjectTitle.create(dto.title);
      const finalKeyObj = ObjectKey.create(keyStr);

      const aggregate = ObjectAggregate.create({
        workspaceId: new UniqueEntityId(workspaceId),
        createdById: new UniqueEntityId(createdById),
        objectKey: finalKeyObj,
        typeKey: dto.typeKey as ObjectTypeKey,
        title: titleObj,
        description: dto.description,
        icon: dto.icon,
        emoji: dto.emoji,
        cover: dto.cover,
        color: dto.color,
        pinnedAt: dto.pinnedAt ? new Date(dto.pinnedAt) : undefined,
        isFavorite: dto.isFavorite ?? false,
        attributes: dto.attributes ?? {},
      });

      // Pull domain events BEFORE transaction — events are assembled from the aggregate
      const domainEvents = aggregate.pullDomainEvents();

      // Atomic: Object insert + Outbox staging in one $transaction
      await this.unitOfWork.execute(async (tx: ITransactionContext) => {
        await objectRepository.save(aggregate);
        if (domainEvents.length > 0) {
          await this.outboxPublisher.stageEvents(domainEvents, tx);
        }
      });

      const responseDto = ObjectResponseMapper.toResponseDto(aggregate);
      return Result.ok(responseDto);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
