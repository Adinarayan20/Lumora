import { IsNotEmpty, IsString } from 'class-validator';

export class MarkNotificationReadDto {
  @IsString()
  @IsNotEmpty()
  notificationId!: string;
}
