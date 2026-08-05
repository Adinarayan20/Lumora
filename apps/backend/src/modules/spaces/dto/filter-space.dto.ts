import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { SpaceStatus } from '../../../generated/prisma/client';

export class FilterSpaceDto {
  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsEnum(SpaceStatus)
  status?: SpaceStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
