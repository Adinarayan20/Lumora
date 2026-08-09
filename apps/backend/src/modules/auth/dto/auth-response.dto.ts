/**
 * Stable API response DTO for authentication operations.
 * Does NOT expose the User Prisma model — only safe, public user fields.
 */
export class UserPublicDto {
  id!: string;
  email!: string;
  username!: string;
  displayName!: string;
  avatarUrl?: string;
  timezone!: string;
  locale!: string;
  emailVerified!: boolean;
  onboardingDone!: boolean;
  status!: string;
  createdAt!: string;
  updatedAt!: string;
}

export class AuthResponseDto {
  user!: UserPublicDto;
  accessToken!: string;
  refreshToken!: string;
  sessionId!: string;
  deviceId!: string;
}
