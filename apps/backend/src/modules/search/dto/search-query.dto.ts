import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsOptional()
  @IsString()
  category?: string;
}
