import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ReminderPriority,
  ReminderStatus,
} from '../../../generated/prisma/client';

export class FilterReminderDto {
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @IsOptional()
  @IsEnum(ReminderPriority)
  priority?: ReminderPriority;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  overdueOnly?: boolean;
}
