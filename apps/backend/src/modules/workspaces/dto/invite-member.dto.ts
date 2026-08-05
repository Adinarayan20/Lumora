import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  roleId?: string;
}
