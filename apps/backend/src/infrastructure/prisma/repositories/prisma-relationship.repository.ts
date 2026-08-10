import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import { PrismaService } from '../prisma.service.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import type { IRelationshipRepository } from '../../../domain/relationships/repositories/relationship.repository.interface.js';
import { RelationshipAggregate } from '../../../domain/relationships/relationship.aggregate.js';
import { Prisma } from '../../../generated/prisma/client.js';

type PrismaRelationship = {
  id: string;
  workspaceId: string;
  sourceObjectId: string;
  targetObjectId: string;
  type: string;
  metadata: Prisma.JsonValue;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

@Injectable()
export class PrismaRelationshipRepository implements IRelationshipRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async save(relationship: RelationshipAggregate): Promise<void> {
    try {
      await this.prisma.relationship.upsert({
        where: { id: relationship.id.toValue() },
        create: {
          id: relationship.id.toValue(),
          workspaceId: relationship.workspaceId.toValue(),
          sourceObjectId: relationship.sourceObjectId.toValue(),
          targetObjectId: relationship.targetObjectId.toValue(),
          type: relationship.type,
          metadata:
            (relationship.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          createdById: relationship.createdById.toValue(),
          createdAt: relationship.createdAt,
          updatedAt: relationship.updatedAt,
          deletedAt: relationship.deletedAt ?? null,
        },
        update: {
          metadata:
            (relationship.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          updatedAt: relationship.updatedAt,
          deletedAt: relationship.deletedAt ?? null,
        },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'Relationship');
    }
  }

  public async findById(
    id: UniqueEntityId,
  ): Promise<RelationshipAggregate | null> {
    try {
      const row = await this.prisma.relationship.findFirst({
        where: { id: id.toValue(), deletedAt: null },
      });
      return row ? this.toDomain(row) : null;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'Relationship');
    }
  }

  public async findBySourceObject(
    workspaceId: UniqueEntityId,
    sourceObjectId: UniqueEntityId,
    type?: string,
  ): Promise<RelationshipAggregate[]> {
    try {
      const where: Prisma.RelationshipWhereInput = {
        workspaceId: workspaceId.toValue(),
        sourceObjectId: sourceObjectId.toValue(),
        deletedAt: null,
      };
      if (type) where.type = type;
      const rows = await this.prisma.relationship.findMany({ where });
      return rows.map((r) => this.toDomain(r));
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'Relationship');
    }
  }

  public async findByTargetObject(
    workspaceId: UniqueEntityId,
    targetObjectId: UniqueEntityId,
    type?: string,
  ): Promise<RelationshipAggregate[]> {
    try {
      const where: Prisma.RelationshipWhereInput = {
        workspaceId: workspaceId.toValue(),
        targetObjectId: targetObjectId.toValue(),
        deletedAt: null,
      };
      if (type) where.type = type;
      const rows = await this.prisma.relationship.findMany({ where });
      return rows.map((r) => this.toDomain(r));
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'Relationship');
    }
  }

  public async findByObject(
    workspaceId: UniqueEntityId,
    objectId: UniqueEntityId,
    type?: string,
  ): Promise<RelationshipAggregate[]> {
    try {
      const objectIdStr = objectId.toValue();
      const where: Prisma.RelationshipWhereInput = {
        workspaceId: workspaceId.toValue(),
        deletedAt: null,
        OR: [{ sourceObjectId: objectIdStr }, { targetObjectId: objectIdStr }],
      };
      if (type) where.type = type;
      const rows = await this.prisma.relationship.findMany({ where });
      return rows.map((r) => this.toDomain(r));
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'Relationship');
    }
  }

  public async delete(
    id: UniqueEntityId,
    workspaceId: UniqueEntityId,
  ): Promise<void> {
    try {
      await this.prisma.relationship.updateMany({
        where: {
          id: id.toValue(),
          workspaceId: workspaceId.toValue(),
          deletedAt: null,
        },
        data: { deletedAt: new Date(), updatedAt: new Date() },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'Relationship');
    }
  }

  public async exists(
    workspaceId: UniqueEntityId,
    sourceObjectId: UniqueEntityId,
    targetObjectId: UniqueEntityId,
    type: string,
  ): Promise<boolean> {
    try {
      const count = await this.prisma.relationship.count({
        where: {
          workspaceId: workspaceId.toValue(),
          sourceObjectId: sourceObjectId.toValue(),
          targetObjectId: targetObjectId.toValue(),
          type,
          deletedAt: null,
        },
      });
      return count > 0;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'Relationship');
    }
  }

  private toDomain(row: PrismaRelationship): RelationshipAggregate {
    return RelationshipAggregate.reconstitute({
      id: new UniqueEntityId(row.id),
      workspaceId: new UniqueEntityId(row.workspaceId),
      sourceObjectId: new UniqueEntityId(row.sourceObjectId),
      targetObjectId: new UniqueEntityId(row.targetObjectId),
      type: row.type,
      metadata: (row.metadata as Record<string, unknown>) ?? undefined,
      createdById: new UniqueEntityId(row.createdById),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
    });
  }
}
