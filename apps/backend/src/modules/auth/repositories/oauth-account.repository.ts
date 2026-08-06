import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  OAuthAccount,
  OAuthProvider,
} from '../../../generated/prisma/client.js';
import { PrismaTransaction } from './audit-log.repository';

export interface CreateOAuthAccountData {
  userId: string;
  provider: OAuthProvider;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

@Injectable()
export class OAuthAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderAndAccountId(
    provider: OAuthProvider,
    providerAccountId: string,
    tx?: PrismaTransaction,
  ): Promise<OAuthAccount | null> {
    const client = tx ?? this.prisma;
    return client.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });
  }

  async create(
    data: CreateOAuthAccountData,
    tx?: PrismaTransaction,
  ): Promise<OAuthAccount> {
    const client = tx ?? this.prisma;
    return client.oAuthAccount.create({
      data: {
        userId: data.userId,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      },
    });
  }
}
