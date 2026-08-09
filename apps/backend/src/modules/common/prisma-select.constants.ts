/**
 * Shared Prisma select fragment for public user profile fields.
 * Used across module-layer repositories to return sanitised user data
 * without exposing passwordHash or other sensitive columns.
 */
export const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;
