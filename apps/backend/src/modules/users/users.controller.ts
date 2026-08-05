import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { TrustDeviceDto } from './dto/trust-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('me/devices')
  async getUserDevices(@CurrentUser('id') userId: string) {
    return this.usersService.getUserDevices(userId);
  }

  @Patch('me/devices/:deviceId/trust')
  async trustDevice(
    @CurrentUser('id') userId: string,
    @Param('deviceId') deviceId: string,
    @Body() dto: TrustDeviceDto,
  ) {
    return this.usersService.trustDevice(userId, deviceId, dto.trusted);
  }

  @Get('me/sessions')
  async getUserSessions(@CurrentUser('id') userId: string) {
    return this.usersService.getUserSessions(userId);
  }

  @Delete('me/sessions/:sessionId')
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.usersService.revokeSession(userId, sessionId);
  }
}
