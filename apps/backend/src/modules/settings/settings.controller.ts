import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UpdateUserSettingsUseCase } from './use-cases/update-user-settings.use-case.js';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly updateUserSettingsUseCase: UpdateUserSettingsUseCase,
  ) {}

  /**
   * PATCH /settings/me
   * Updates user settings/preferences for the authenticated user.
   */
  @Patch('me')
  async updateUserSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserSettingsDto,
  ) {
    const result = await this.updateUserSettingsUseCase.execute({
      userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }
}
