import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import { User as PrismaUser } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma.service.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import type { IUserSettingsRepository } from '../../../domain/settings/repositories/user-settings.repository.interface.js';
import { UserSettingsAggregate } from '../../../domain/settings/user-settings.aggregate.js';
import { ThemePreference } from '../../../domain/settings/value-objects/theme-preference.js';
import { TimezonePreference } from '../../../domain/settings/value-objects/timezone-preference.js';

@Injectable()
export class PrismaUserSettingsRepository implements IUserSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findByUserId(
    userId: UniqueEntityId,
  ): Promise<UserSettingsAggregate | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId.toString() },
      });

      if (!user) return null;

      return this.toDomain(user);
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async save(settings: UserSettingsAggregate): Promise<void> {
    try {
      const data = this.toPersistence(settings);

      await this.prisma.user.update({
        where: { id: settings.userId.toString() },
        data: {
          timezone: data.timezone as string,
          locale: data.locale as string,
        },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  /**
   * Explicit mapping converting database User model to UserSettingsAggregate domain root.
   *
   * SCHEMA BOUNDARY DOCUMENTATION:
   * Current Prisma User schema model persists id, timezone, locale.
   * Notification preferences (notificationsEnabled, emailNotifications, pushNotifications) are carried
   * in-memory on the aggregate root and will be rehydrated from dedicated columns in schema migration v2.
   */
  public toDomain(model: PrismaUser): UserSettingsAggregate {
    return UserSettingsAggregate.reconstitute({
      id: new UniqueEntityId(model.id),
      userId: new UniqueEntityId(model.id),
      theme: ThemePreference.create('SYSTEM'),
      locale: model.locale,
      timezone: TimezonePreference.create(model.timezone),
      notificationsEnabled: true,
      emailNotifications: true,
      pushNotifications: true,
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Explicit mapping converting UserSettingsAggregate to database user preference payload.
   */
  public toPersistence(
    settings: UserSettingsAggregate,
  ): Record<string, unknown> {
    return {
      userId: settings.userId.toString(),
      theme: settings.theme.getValue(),
      locale: settings.locale,
      timezone: settings.timezone.getValue(),
      notificationsEnabled: settings.notificationsEnabled,
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
    };
  }
}
