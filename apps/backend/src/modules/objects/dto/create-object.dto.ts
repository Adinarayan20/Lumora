import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateObjectDto {
  @IsOptional()
  @IsString()
  objectKey?: string;

  @IsString()
  @IsNotEmpty()
  typeKey: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

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
  color?: string; // Semantic design token e.g. "theme.blue", "theme.emerald"

  @IsOptional()
  @IsDateString()
  pinnedAt?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  systemData?: Record<string, unknown>;

  @IsOptional()
  attributes?: Record<string, unknown>;
}
