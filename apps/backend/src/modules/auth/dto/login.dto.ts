import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DevicePlatform } from '../../../generated/prisma/client';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  emailOrUsername: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  platform?: DevicePlatform;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsString()
  pushToken?: string;
}
