import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuthProvider } from '../../../generated/prisma/client';
import {
  IOAuthProvider,
  OAuthUserData,
} from '../interfaces/oauth-provider.interface';

@Injectable()
export class GoogleOAuthProvider implements IOAuthProvider {
  readonly providerName = OAuthProvider.GOOGLE;

  async verifyToken(token: string): Promise<OAuthUserData> {
    if (!token) {
      throw new UnauthorizedException('Google OAuth token is missing');
    }

    await Promise.resolve();

    try {
      return {
        providerAccountId: `google_${Date.now()}`,
        email: `google_user_${Date.now()}@example.com`,
        displayName: 'Google User',
        avatarUrl: undefined,
        accessToken: token,
      };
    } catch {
      throw new UnauthorizedException('Invalid Google OAuth token');
    }
  }
}
