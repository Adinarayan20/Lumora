import { OAuthProvider } from '../../../generated/prisma/client';

export interface OAuthUserData {
  providerAccountId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface IOAuthProvider {
  readonly providerName: OAuthProvider;
  verifyToken(token: string): Promise<OAuthUserData>;
}
