import { HouseholdAggregate } from '../../../domain/households/household.aggregate.js';
import { HouseholdResponseDto } from '../dto/household-response.dto.js';

export class HouseholdResponseMapper {
  public static toResponseDto(
    aggregate: HouseholdAggregate,
  ): HouseholdResponseDto {
    return {
      id: aggregate.id.toString(),
      workspaceId: aggregate.workspaceId.toString(),
      name: aggregate.name.getValue(),
      members: aggregate.members.map((m) => ({
        id: m.id.toString(),
        userId: m.userId.toString(),
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
      })),
      createdAt: aggregate.createdAt.toISOString(),
      updatedAt: aggregate.updatedAt.toISOString(),
    };
  }
}
