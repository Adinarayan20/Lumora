import { User } from '../../../generated/prisma/client.js';

export class AuthResponseDto {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  deviceId: string;
}
