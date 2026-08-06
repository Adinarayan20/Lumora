export class ObjectResponseDto {
  id!: string;
  workspaceId!: string;
  createdById!: string;
  objectKey!: string;
  typeKey!: string;
  title!: string;
  description?: string;
  spaceId?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: string;
  isFavorite!: boolean;
  status!: string;
  attributes?: Record<string, unknown>;
  createdAt!: string;
  updatedAt!: string;
}
