import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ReminderExecutionStatus,
  ReminderStatus,
} from '../../../generated/prisma/client';

export class FilterReminderDto {
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @IsOptional()
  @IsEnum(ReminderExecutionStatus)
  executionStatus?: ReminderExecutionStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  overdueOnly?: boolean;
}
