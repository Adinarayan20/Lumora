/**
 * Stable API response DTO for Space resources.
 * Does NOT expose Prisma model types.
 */
export class SpaceResponseDto {
  id!: string;
  workspaceId!: string;
  parentId?: string;
  createdById!: string;
  updatedById?: string;
  slug!: string;
  name!: string;
  description?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: string;
  isFavorite!: boolean;
  status!: string;
  settings?: Record<string, unknown>;
  revision!: number;
  archivedAt?: string;
  createdAt!: string;
  updatedAt!: string;
}
