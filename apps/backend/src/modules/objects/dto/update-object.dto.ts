import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * Valid object status transitions accepted by the update endpoint.
 * Matches domain ObjectStatus — does NOT import from generated/prisma.
 */
enum ObjectStatusInput {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class UpdateObjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  spaceId?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsDateString()
  pinnedAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsEnum(ObjectStatusInput)
  status?: string;

  @IsOptional()
  systemData?: Record<string, unknown>;

  @IsOptional()
  attributes?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  revision?: number;
}
