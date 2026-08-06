import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { PrismaUserSettingsRepository } from '../../infrastructure/prisma/repositories/prisma-user-settings.repository.js';
import { PrismaWorkspaceSettingsRepository } from '../../infrastructure/prisma/repositories/prisma-workspace-settings.repository.js';
import { SettingsService } from './settings.service.js';
import { SettingsController } from './settings.controller.js';
import {
  USER_SETTINGS_REPOSITORY_TOKEN,
  WORKSPACE_SETTINGS_REPOSITORY_TOKEN,
} from './settings.tokens.js';
import { UpdateUserSettingsUseCase } from './use-cases/update-user-settings.use-case.js';

@Module({
  imports: [PrismaModule],
  providers: [
    SettingsService,
    {
      provide: USER_SETTINGS_REPOSITORY_TOKEN,
      useClass: PrismaUserSettingsRepository,
    },
    {
      provide: WORKSPACE_SETTINGS_REPOSITORY_TOKEN,
      useClass: PrismaWorkspaceSettingsRepository,
    },
    UpdateUserSettingsUseCase,
  ],
  controllers: [SettingsController],
  exports: [
    UpdateUserSettingsUseCase,
    USER_SETTINGS_REPOSITORY_TOKEN,
    WORKSPACE_SETTINGS_REPOSITORY_TOKEN,
  ],
})
export class SettingsModule {}
