export class RelationshipResponseDto {
  id!: string;
  workspaceId!: string;
  sourceObjectId!: string;
  targetObjectId!: string;
  type!: string;
  metadata?: Record<string, unknown>;
  createdById!: string;
  createdAt!: string;
  updatedAt!: string;
}
