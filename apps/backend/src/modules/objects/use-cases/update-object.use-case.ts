import { Inject, Injectable } from '@nestjs/common';
import {
  Result,
  UniqueEntityId,
  EntityNotFoundException,
  RevisionConflictException,
} from '@lumora/shared';
import { ObjectTitle } from '../../../domain/objects/value-objects/object-title.js';
import { ObjectStatus } from '../../../domain/objects/value-objects/object-status.js';
import { UpdateObjectDto } from '../dto/update-object.dto.js';
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

export interface UpdateObjectCommand {
  workspaceId: string;
  objectId: string;
  userId: string;
  dto: UpdateObjectDto;
}

/**
 * Updates an existing Universal Object via the domain aggregate and atomic CAS path.
 *
 * Concurrency: Validates revision if supplied, then invokes Tier 2 ObjectAggregateRepositoryAdapter
 * which executes parameterized raw SQL `UPDATE ... WHERE revision = storedRevision RETURNING *`.
 *
 * Transaction boundary: Object update + Outbox staging execute within a single PrismaUnitOfWork.$transaction().
 */
@Injectable()
export class UpdateObjectUseCase {
  constructor(
    @Inject(OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN)
    private readonly repositoryFactory: ObjectAggregateRepositoryFactory,
    private readonly outboxPublisher: OutboxPublisher,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: UpdateObjectCommand,
  ): Promise<Result<ObjectResponseDto, Error>> {
    try {
      const { workspaceId, objectId, userId, dto } = command;
      const objectRepository = this.repositoryFactory(workspaceId, userId);

      const aggregate = await objectRepository.findById(
        new UniqueEntityId(objectId),
      );
      if (!aggregate) {
        return Result.fail(new EntityNotFoundException('Object', objectId));
      }

      if (dto.revision !== undefined && dto.revision !== aggregate.revision) {
        return Result.fail(
          new RevisionConflictException(
            'Object',
            aggregate.revision,
            dto.revision,
          ),
        );
      }

      aggregate.updateProps(new UniqueEntityId(userId), {
        title: dto.title ? ObjectTitle.create(dto.title) : undefined,
        description: dto.description,
        icon: dto.icon,
        emoji: dto.emoji,
        cover: dto.cover,
        color: dto.color,
        isFavorite: dto.isFavorite,
        status: dto.status as ObjectStatus | undefined,
        pinnedAt: dto.pinnedAt ? new Date(dto.pinnedAt) : undefined,
        attributes: dto.attributes,
        systemData: dto.systemData,
      });

      const domainEvents = aggregate.pullDomainEvents();

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
