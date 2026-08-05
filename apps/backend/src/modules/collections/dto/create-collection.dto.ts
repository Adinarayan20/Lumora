import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { CollectionType } from '../../../generated/prisma/client';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CollectionType)
  type?: CollectionType;

  @IsOptional()
  @IsObject()
  query?: Record<string, unknown>;

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
  color?: string; // Semantic design token e.g. "theme.emerald"

  @IsOptional()
  @IsDateString()
  pinnedAt?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
