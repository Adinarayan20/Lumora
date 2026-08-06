import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHouseholdDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  ownerUserId!: string;
}
