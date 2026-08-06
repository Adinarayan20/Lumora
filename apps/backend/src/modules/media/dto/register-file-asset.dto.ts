import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FileProvider } from '../../../domain/media/value-objects/file-provider.enum.js';

export class RegisterFileAssetDto {
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  size!: number;

  @IsOptional()
  @IsEnum(FileProvider)
  provider?: FileProvider;

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsString()
  checksum?: string;
}
