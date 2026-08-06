import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId } from '@lumora/shared';
import { HouseholdAggregate } from '../../../domain/households/household.aggregate.js';
import type { IHouseholdRepository } from '../../../domain/households/repositories/household.repository.interface.js';
import { HOUSEHOLD_REPOSITORY_TOKEN } from '../households.tokens.js';
import { CreateHouseholdDto } from '../dto/create-household.dto.js';
import { HouseholdResponseDto } from '../dto/household-response.dto.js';
import { HouseholdResponseMapper } from '../mappers/household-response.mapper.js';

export interface CreateHouseholdCommand {
  dto: CreateHouseholdDto;
}

@Injectable()
export class CreateHouseholdUseCase {
  constructor(
    @Inject(HOUSEHOLD_REPOSITORY_TOKEN)
    private readonly householdRepository: IHouseholdRepository,
  ) {}

  public async execute(
    command: CreateHouseholdCommand,
  ): Promise<Result<HouseholdResponseDto, Error>> {
    try {
      const { dto } = command;
      const wsEntityId = new UniqueEntityId(dto.workspaceId);
      const ownerEntityId = new UniqueEntityId(dto.ownerUserId);

      const aggregate = HouseholdAggregate.create({
        workspaceId: wsEntityId,
        name: dto.name,
        ownerUserId: ownerEntityId,
      });

      await this.householdRepository.save(aggregate);

      const responseDto = HouseholdResponseMapper.toResponseDto(aggregate);
      return Result.ok(responseDto);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
