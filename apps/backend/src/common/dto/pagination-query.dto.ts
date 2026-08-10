import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Standard cursor-based pagination query parameters.
 * Supports both cursor pagination (first + after) and legacy limit-based (limit + offset).
 */
export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  first?: number;

  @IsOptional()
  @IsString()
  after?: string;

  /** Legacy: maximum number of records to return. Defaults to 50. Max 100. */
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  /** Legacy: zero-based offset. */
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(0)
  offset?: number;
}
