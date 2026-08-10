import { Inject, Injectable } from '@nestjs/common';
import {
  Result,
  UniqueEntityId,
  EntityNotFoundException,
} from '@lumora/shared';
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

export interface DeleteObjectCommand {
  workspaceId: string;
  objectId: string;
  userId: string;
}

/**
 * Soft-deletes a Universal Object via domain aggregate, atomic CAS, UnitOfWork, and Outbox.
 */
@Injectable()
export class DeleteObjectUseCase {
  constructor(
    @Inject(OBJECT_AGGREGATE_REPOSITORY_FACTORY_TOKEN)
    private readonly repositoryFactory: ObjectAggregateRepositoryFactory,
    private readonly outboxPublisher: OutboxPublisher,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: DeleteObjectCommand,
  ): Promise<Result<ObjectResponseDto, Error>> {
    try {
      const { workspaceId, objectId, userId } = command;
      const objectRepository = this.repositoryFactory(workspaceId, userId);

      const aggregate = await objectRepository.findById(
        new UniqueEntityId(objectId),
      );
      if (!aggregate) {
        return Result.fail(new EntityNotFoundException('Object', objectId));
      }

      aggregate.softDelete(new UniqueEntityId(userId));
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
