import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  DevicePlatform,
  OAuthProvider,
} from '../../../generated/prisma/client.js';

export class OAuthLoginDto {
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider: OAuthProvider;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  platform?: DevicePlatform;

  @IsOptional()
  @IsString()
  deviceName?: string;
}
