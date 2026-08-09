import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Valid status values for filtering objects.
 * Matches domain ObjectStatus — does NOT import from generated/prisma.
 */
enum ObjectStatusFilter {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export class FilterObjectDto {
  @IsOptional()
  @IsString()
  typeKey?: string;

  @IsOptional()
  @IsString()
  spaceId?: string;

  @IsOptional()
  @IsEnum(ObjectStatusFilter)
  status?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
