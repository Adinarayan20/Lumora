import {
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
} from 'class-validator';
import {
  ReminderPriority,
  ReminderStatus,
} from '../../../generated/prisma/client';

export class UpdateReminderDto {
  @IsOptional()
  @IsDateString()
  remindAt?: string;

  @IsOptional()
  @IsEnum(ReminderPriority)
  priority?: ReminderPriority;

  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @IsOptional()
  @IsObject()
  recurrence?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  revision?: number;
}
