import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CollectionType } from '../../../generated/prisma/client.js';

export class FilterCollectionDto {
  @IsOptional()
  @IsEnum(CollectionType)
  type?: CollectionType;

  @IsOptional()
  @IsString()
  search?: string;
}
