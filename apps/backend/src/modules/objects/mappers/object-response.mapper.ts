import { ObjectAggregate } from '../../../domain/objects/object.aggregate.js';
import { ObjectResponseDto } from '../dto/object-response.dto.js';

export class ObjectResponseMapper {
  public static toResponseDto(aggregate: ObjectAggregate): ObjectResponseDto {
    return {
      id: aggregate.id.toString(),
      workspaceId: aggregate.workspaceId.toString(),
      createdById: aggregate.createdById.toString(),
      objectKey: aggregate.objectKey.toValue(),
      typeKey: aggregate.typeKey,
      title: aggregate.title.toValue(),
      description: aggregate.description,
      spaceId: aggregate.spaceId ? aggregate.spaceId.toString() : undefined,
      icon: aggregate.icon,
      emoji: aggregate.emoji,
      cover: aggregate.cover,
      color: aggregate.color,
      pinnedAt: aggregate.pinnedAt
        ? aggregate.pinnedAt.toISOString()
        : undefined,
      isFavorite: aggregate.isFavorite,
      status: aggregate.status,
      attributes: aggregate.attributes,
      revision: aggregate.revision,
      archivedAt: aggregate.archivedAt ? aggregate.archivedAt.toISOString() : undefined,
      createdAt: aggregate.createdAt.toISOString(),
      updatedAt: aggregate.updatedAt.toISOString(),
    };
  }
}
