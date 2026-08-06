import { IsNotEmpty, IsString } from 'class-validator';

export class IndexEntityDto {
  @IsString()
  @IsNotEmpty()
  entityCategory!: string;

  @IsString()
  @IsNotEmpty()
  entityId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
