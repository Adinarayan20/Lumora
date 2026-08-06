import { Injectable, BadRequestException } from '@nestjs/common';
import { OAuthProvider } from '../../../generated/prisma/client.js';
import {
  IOAuthProvider,
  OAuthUserData,
} from '../interfaces/oauth-provider.interface';
import { GoogleOAuthProvider } from '../providers/google-oauth.provider';

@Injectable()
export class OAuthService {
  private readonly providers = new Map<OAuthProvider, IOAuthProvider>();

  constructor(googleProvider: GoogleOAuthProvider) {
    this.registerProvider(googleProvider);
  }

  registerProvider(provider: IOAuthProvider): void {
    this.providers.set(provider.providerName, provider);
  }

  async authenticateOAuthUser(
    providerName: OAuthProvider,
    token: string,
  ): Promise<OAuthUserData> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new BadRequestException(
        `OAuth provider ${providerName} is not supported`,
      );
    }

    return provider.verifyToken(token);
  }
}
