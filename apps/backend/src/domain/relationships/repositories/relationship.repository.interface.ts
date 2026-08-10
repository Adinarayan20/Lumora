import type { UniqueEntityId } from '@lumora/shared';
import type { RelationshipAggregate } from '../relationship.aggregate.js';

export interface IRelationshipRepository {
  save(relationship: RelationshipAggregate): Promise<void>;
  findById(id: UniqueEntityId): Promise<RelationshipAggregate | null>;
  findBySourceObject(
    workspaceId: UniqueEntityId,
    sourceObjectId: UniqueEntityId,
    type?: string,
  ): Promise<RelationshipAggregate[]>;
  findByTargetObject(
    workspaceId: UniqueEntityId,
    targetObjectId: UniqueEntityId,
    type?: string,
  ): Promise<RelationshipAggregate[]>;
  findByObject(
    workspaceId: UniqueEntityId,
    objectId: UniqueEntityId,
    type?: string,
  ): Promise<RelationshipAggregate[]>;
  delete(id: UniqueEntityId, workspaceId: UniqueEntityId): Promise<void>;
  exists(
    workspaceId: UniqueEntityId,
    sourceObjectId: UniqueEntityId,
    targetObjectId: UniqueEntityId,
    type: string,
  ): Promise<boolean>;
}
