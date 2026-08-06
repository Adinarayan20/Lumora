import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ObjectStatus } from '../../../generated/prisma/client.js';

export class FilterObjectDto {
  @IsOptional()
  @IsString()
  typeKey?: string;

  @IsOptional()
  @IsString()
  spaceId?: string;

  @IsOptional()
  @IsEnum(ObjectStatus)
  status?: ObjectStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
