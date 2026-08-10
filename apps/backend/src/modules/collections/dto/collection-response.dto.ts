/**
 * Stable API response DTO for Collection resources.
 * Does NOT expose Prisma model types.
 */
export class CollectionResponseDto {
  id!: string;
  workspaceId!: string;
  createdById!: string;
  updatedById?: string;
  slug!: string;
  name!: string;
  description?: string;
  type!: string;
  query?: Record<string, unknown>;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: string;
  isFavorite!: boolean;
  status!: string;
  revision!: number;
  archivedAt?: string;
  createdAt!: string;
  updatedAt!: string;
}

export class CollectionItemResponseDto {
  id!: string;
  collectionId!: string;
  objectId!: string;
  order!: number;
  addedAt!: string;
}
