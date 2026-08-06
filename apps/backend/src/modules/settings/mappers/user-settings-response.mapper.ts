import { UserSettingsAggregate } from '../../../domain/settings/user-settings.aggregate.js';
import { UserSettingsResponseDto } from '../dto/user-settings-response.dto.js';

export class UserSettingsResponseMapper {
  public static toResponseDto(
    aggregate: UserSettingsAggregate,
  ): UserSettingsResponseDto {
    return {
      id: aggregate.id.toString(),
      userId: aggregate.userId.toString(),
      theme: aggregate.theme.getValue(),
      locale: aggregate.locale,
      timezone: aggregate.timezone.getValue(),
      notificationsEnabled: aggregate.notificationsEnabled,
      emailNotifications: aggregate.emailNotifications,
      pushNotifications: aggregate.pushNotifications,
      updatedAt: aggregate.updatedAt.toISOString(),
    };
  }
}
