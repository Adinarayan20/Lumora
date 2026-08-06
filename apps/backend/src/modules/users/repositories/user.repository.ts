import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { User, UserStatus } from '../../../generated/prisma/client.js';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';

export interface CreateUserData {
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
}

export interface UpdateUserData {
  displayName?: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  onboardingDone?: boolean;
  status?: UserStatus;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, tx?: PrismaTransaction): Promise<User | null> {
    const client = tx ?? this.prisma;
    return client.user.findUnique({ where: { id } });
  }

  async findByEmail(
    email: string,
    tx?: PrismaTransaction,
  ): Promise<User | null> {
    const client = tx ?? this.prisma;
    return client.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findByUsername(
    username: string,
    tx?: PrismaTransaction,
  ): Promise<User | null> {
    const client = tx ?? this.prisma;
    return client.user.findUnique({
      where: { username: username.toLowerCase() },
    });
  }

  async findByEmailOrUsername(
    identifier: string,
    tx?: PrismaTransaction,
  ): Promise<User | null> {
    const client = tx ?? this.prisma;
    const cleanId = identifier.toLowerCase();
    return client.user.findFirst({
      where: {
        OR: [{ email: cleanId }, { username: cleanId }],
      },
    });
  }

  async create(data: CreateUserData, tx?: PrismaTransaction): Promise<User> {
    const client = tx ?? this.prisma;
    return client.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        displayName: data.displayName,
        passwordHash: data.passwordHash,
        avatarUrl: data.avatarUrl,
        timezone: data.timezone ?? 'UTC',
        locale: data.locale ?? 'en',
      },
    });
  }

  async update(
    id: string,
    data: UpdateUserData,
    tx?: PrismaTransaction,
  ): Promise<User> {
    const client = tx ?? this.prisma;
    return client.user.update({
      where: { id },
      data,
    });
  }
}
