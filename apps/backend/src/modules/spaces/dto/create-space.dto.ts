import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export interface SpaceSettings {
  defaultView?: 'list' | 'grid' | 'board';
  sortBy?: 'updatedAt' | 'createdAt' | 'title';
  sortDirection?: 'asc' | 'desc';
}

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  color?: string; // Semantic token e.g. "theme.purple"

  @IsOptional()
  @IsDateString()
  pinnedAt?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsObject()
  settings?: SpaceSettings;
}
