import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import { Prisma, Workspace as PrismaWorkspace } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma.service.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import type { IHouseholdRepository } from '../../../domain/households/repositories/household.repository.interface.js';
import { HouseholdAggregate } from '../../../domain/households/household.aggregate.js';
import { HouseholdName } from '../../../domain/households/value-objects/household-name.js';
import { HouseholdMemberEntity } from '../../../domain/households/entities/household-member.entity.js';

export type WorkspaceWithMembersPayload = Prisma.WorkspaceGetPayload<{
  include: { members: true };
}>;

@Injectable()
export class PrismaHouseholdRepository implements IHouseholdRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findById(id: UniqueEntityId): Promise<HouseholdAggregate | null> {
    try {
      const workspace = await this.prisma.workspace.findFirst({
        where: { id: id.toString(), type: 'FAMILY' },
        include: { members: true },
      });

      if (!workspace) return null;

      return this.toDomain(workspace);
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async findByWorkspaceId(workspaceId: UniqueEntityId): Promise<HouseholdAggregate | null> {
    return this.findById(workspaceId);
  }

  public async save(household: HouseholdAggregate): Promise<void> {
    try {
      const data = this.toPersistence(household);

      await this.prisma.workspace.update({
        where: { id: household.id.toString() },
        data: {
          name: data.name as string,
        },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async delete(id: UniqueEntityId): Promise<void> {
    try {
      await this.prisma.workspace.delete({
        where: { id: id.toString() },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  /**
   * Explicit mapping converting database FAMILY Workspace record to HouseholdAggregate domain root.
   */
  public toDomain(model: WorkspaceWithMembersPayload): HouseholdAggregate {
    const members = model.members.map((m) =>
      HouseholdMemberEntity.reconstitute({
        id: new UniqueEntityId(m.id),
        userId: new UniqueEntityId(m.userId),
        role: m.userId === model.ownerId ? 'OWNER' : 'MEMBER',
        joinedAt: m.joinedAt,
      }),
    );

    return HouseholdAggregate.reconstitute({
      id: new UniqueEntityId(model.id),
      workspaceId: new UniqueEntityId(model.id),
      name: HouseholdName.create(model.name),
      members,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Explicit mapping converting HouseholdAggregate to database Workspace payload.
   */
  public toPersistence(household: HouseholdAggregate): Record<string, unknown> {
    return {
      id: household.id.toString(),
      name: household.name.getValue(),
      type: 'FAMILY',
    };
  }
}
