export class UserSettingsResponseDto {
  id!: string;
  userId!: string;
  theme!: string;
  locale!: string;
  timezone!: string;
  notificationsEnabled!: boolean;
  emailNotifications!: boolean;
  pushNotifications!: boolean;
  updatedAt!: string;
}
