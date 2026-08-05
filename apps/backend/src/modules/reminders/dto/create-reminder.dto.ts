import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ReminderSource,
  ReminderTriggerType,
} from '../../../generated/prisma/client';

export class CreateReminderDto {
  @IsDateString()
  @IsNotEmpty()
  remindAt: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @IsOptional()
  @IsEnum(ReminderSource)
  source?: ReminderSource;

  @IsOptional()
  @IsEnum(ReminderTriggerType)
  triggerType?: ReminderTriggerType;
}
