import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  GetProfileQuery,
  UpdateProfileUseCase,
  GetUserDevicesQuery,
  TrustDeviceUseCase,
  GetUserSessionsQuery,
  RevokeSessionUseCase,
} from './use-cases/user-use-cases.js';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { TrustDeviceDto } from './dto/trust-device.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly getProfileQuery: GetProfileQuery,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getUserDevicesQuery: GetUserDevicesQuery,
    private readonly trustDeviceUseCase: TrustDeviceUseCase,
    private readonly getUserSessionsQuery: GetUserSessionsQuery,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
  ) {}

  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    const result = await this.getProfileQuery.execute({ userId });
    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('not found')) throw new NotFoundException(msg);
      throw new InternalServerErrorException(msg);
    }
    return result.getValue();
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const result = await this.updateProfileUseCase.execute({ userId, dto });
    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('not found')) throw new NotFoundException(msg);
      throw new BadRequestException(msg);
    }
    return result.getValue();
  }

  @Get('me/devices')
  async getUserDevices(@CurrentUser('id') userId: string) {
    const result = await this.getUserDevicesQuery.execute({ userId });
    if (result.isFailure) {
      throw new InternalServerErrorException(result.getError().message);
    }
    return result.getValue();
  }

  @Patch('me/devices/:deviceId/trust')
  async trustDevice(
    @CurrentUser('id') userId: string,
    @Param('deviceId') deviceId: string,
    @Body() dto: TrustDeviceDto,
  ) {
    const result = await this.trustDeviceUseCase.execute({
      userId,
      deviceId,
      trusted: dto.trusted,
    });
    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('not found')) throw new NotFoundException(msg);
      throw new BadRequestException(msg);
    }
    return result.getValue();
  }

  @Get('me/sessions')
  async getUserSessions(@CurrentUser('id') userId: string) {
    const result = await this.getUserSessionsQuery.execute({ userId });
    if (result.isFailure) {
      throw new InternalServerErrorException(result.getError().message);
    }
    return result.getValue();
  }

  @Delete('me/sessions/:sessionId')
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    const result = await this.revokeSessionUseCase.execute({
      userId,
      sessionId,
    });
    if (result.isFailure) {
      const msg = result.getError().message;
      if (msg.includes('not found')) throw new NotFoundException(msg);
      throw new BadRequestException(msg);
    }
    return result.getValue();
  }
}
