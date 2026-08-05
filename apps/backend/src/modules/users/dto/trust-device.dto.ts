import { IsBoolean, IsNotEmpty } from 'class-validator';

export class TrustDeviceDto {
  @IsBoolean()
  @IsNotEmpty()
  trusted: boolean;
}
