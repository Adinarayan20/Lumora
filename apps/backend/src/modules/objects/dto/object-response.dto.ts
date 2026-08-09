/**
 * Stable API response DTO for Universal Object resources.
 *
 * This DTO is the authoritative public API contract for object responses.
 * It MUST NOT expose Prisma model types, relation objects, or internal database fields.
 * All status values are plain strings matching the domain ObjectStatus enum.
 */
export class ObjectResponseDto {
  id!: string;
  workspaceId!: string;
  spaceId?: string;
  createdById!: string;
  updatedById?: string;
  objectKey!: string;
  typeKey!: string;
  title!: string;
  description?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: string;
  isFavorite!: boolean;
  /** ACTIVE | ARCHIVED | DELETED */
  status!: string;
  attributes!: Record<string, unknown>;
  /** Optimistic concurrency revision counter */
  revision!: number;
  archivedAt?: string;
  createdAt!: string;
  updatedAt!: string;
}
