import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId } from '@lumora/shared';
import { UserSettingsAggregate } from '../../../domain/settings/user-settings.aggregate.js';
import { UserSettingsUpdatedEvent } from '../../../domain/settings/events/settings.events.js';
import type { IUserSettingsRepository } from '../../../domain/settings/repositories/user-settings.repository.interface.js';
import { USER_SETTINGS_REPOSITORY_TOKEN } from '../settings.tokens.js';
import { UpdateUserSettingsDto } from '../dto/update-user-settings.dto.js';
import { UserSettingsResponseDto } from '../dto/user-settings-response.dto.js';
import { UserSettingsResponseMapper } from '../mappers/user-settings-response.mapper.js';

export interface UpdateUserSettingsCommand {
  userId: string;
  dto: UpdateUserSettingsDto;
}

@Injectable()
export class UpdateUserSettingsUseCase {
  constructor(
    @Inject(USER_SETTINGS_REPOSITORY_TOKEN)
    private readonly settingsRepository: IUserSettingsRepository,
  ) {}

  public async execute(
    command: UpdateUserSettingsCommand,
  ): Promise<Result<UserSettingsResponseDto, Error>> {
    try {
      const { userId, dto } = command;
      const userEntityId = new UniqueEntityId(userId);

      let aggregate = await this.settingsRepository.findByUserId(userEntityId);

      if (!aggregate) {
        aggregate = UserSettingsAggregate.create({
          userId: userEntityId,
          theme: dto.theme,
          timezone: dto.timezone,
          locale: dto.locale,
        });
      } else {
        aggregate.updatePreferences(dto.theme, dto.timezone, dto.locale);
        if (
          dto.notificationsEnabled !== undefined &&
          dto.emailNotifications !== undefined &&
          dto.pushNotifications !== undefined
        ) {
          aggregate.setNotificationChannels(
            dto.notificationsEnabled,
            dto.emailNotifications,
            dto.pushNotifications,
          );
        }
      }

      const event = new UserSettingsUpdatedEvent(
        aggregate.id,
        aggregate.userId,
        aggregate.theme.getValue(),
        aggregate.timezone.getValue(),
      );

      await this.settingsRepository.save(aggregate);

      const responseDto = UserSettingsResponseMapper.toResponseDto(aggregate);
      return Result.ok(responseDto);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
