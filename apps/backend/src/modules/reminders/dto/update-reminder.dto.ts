import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ReminderStatus,
  ReminderExecutionStatus,
} from '../../../generated/prisma/client';

export class UpdateReminderDto {
  @IsOptional()
  @IsDateString()
  remindAt?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @IsOptional()
  @IsEnum(ReminderExecutionStatus)
  executionStatus?: ReminderExecutionStatus;

  @IsOptional()
  @IsInt()
  revision?: number;
}
