/**
 * Stable API response DTO for Collection resources.
 * Does NOT expose Prisma model types.
 *
 * Reduced per cleanup report §12 — Collection has no lifecycle/status,
 * no CAS revision, and no presentation state of its own.
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
