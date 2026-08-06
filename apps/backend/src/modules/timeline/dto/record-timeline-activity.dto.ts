import { IsNotEmpty, IsOptional, IsObject, IsString } from 'class-validator';

export class RecordTimelineActivityDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  entityCategory!: string;

  @IsString()
  @IsNotEmpty()
  entityId!: string;

  @IsString()
  @IsNotEmpty()
  action!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
