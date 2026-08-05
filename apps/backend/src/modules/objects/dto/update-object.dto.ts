import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ObjectStatus } from '../../../generated/prisma/client';

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
  color?: string; // Semantic token

  @IsOptional()
  @IsDateString()
  pinnedAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsEnum(ObjectStatus)
  status?: ObjectStatus;

  @IsOptional()
  systemData?: Record<string, unknown>;

  @IsOptional()
  attributes?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  revision?: number; // Optimistic concurrency version check
}
