import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRelationshipDto {
  @IsUUID()
  @IsNotEmpty()
  sourceObjectId!: string;

  @IsUUID()
  @IsNotEmpty()
  targetObjectId!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
