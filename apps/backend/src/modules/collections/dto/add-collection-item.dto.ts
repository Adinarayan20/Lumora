import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddCollectionItemDto {
  @IsString()
  @IsNotEmpty()
  objectId: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
