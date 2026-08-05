import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum SnoozeDuration {
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  ONE_HOUR = '1h',
  ONE_DAY = '1d',
}

export class SnoozeReminderDto {
  @IsOptional()
  @IsEnum(SnoozeDuration)
  duration?: SnoozeDuration;

  @IsOptional()
  @IsDateString()
  until?: string;
}
