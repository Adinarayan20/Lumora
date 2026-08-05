import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
} from 'class-validator';
import { ReminderPriority } from '../../../generated/prisma/client';

export class CreateReminderDto {
  @IsDateString()
  @IsNotEmpty()
  remindAt: string;

  @IsOptional()
  @IsEnum(ReminderPriority)
  priority?: ReminderPriority;

  @IsOptional()
  @IsObject()
  recurrence?: Record<string, unknown>;
}
