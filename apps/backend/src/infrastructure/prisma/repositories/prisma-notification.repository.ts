import { Injectable } from '@nestjs/common';
import {
  UniqueEntityId,
  PaginatedResult,
  PaginationParams,
  DomainValidationException,
} from '@lumora/shared';
import { Prisma, Notification as PrismaNotification } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma.service.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import type {
  INotificationRepository,
  NotificationFilter,
} from '../../../domain/notifications/repositories/notification.repository.interface.js';
import { NotificationAggregate } from '../../../domain/notifications/notification.aggregate.js';
import { NotificationTitle } from '../../../domain/notifications/value-objects/notification-title.js';
import { NotificationBody } from '../../../domain/notifications/value-objects/notification-body.js';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../../../domain/notifications/value-objects/notification-enums.js';

export type NotificationWithReminderPayload = Prisma.NotificationGetPayload<{
  include: { reminder: true };
}>;

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findById(id: UniqueEntityId): Promise<NotificationAggregate | null> {
    try {
      const record = await this.prisma.notification.findUnique({
        where: { id: id.toString() },
        include: { reminder: true },
      });

      if (!record) return null;

      return this.toDomain(record);
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async exists(id: UniqueEntityId): Promise<boolean> {
    try {
      const count = await this.prisma.notification.count({
        where: { id: id.toString() },
      });
      return count > 0;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async save(aggregate: NotificationAggregate): Promise<void> {
    try {
      if (!aggregate.reminderId) {
        throw new DomainValidationException(
          'Notification persistence requires an associated reminderId.',
          { reminderId: ['Notification model requires a valid reminderId relation.'] },
        );
      }

      const data: Prisma.NotificationUncheckedCreateInput = {
        id: aggregate.id.toString(),
        reminderId: aggregate.reminderId.toString(),
        title: aggregate.title.getValue(),
        body: aggregate.body.getValue(),
        scheduledFor: aggregate.scheduledFor,
        deliveredAt: aggregate.deliveredAt ?? null,
        status: aggregate.status as PrismaNotification['status'],
      };

      await this.prisma.notification.upsert({
        where: { id: aggregate.id.toString() },
        create: data,
        update: {
          title: data.title,
          body: data.body,
          scheduledFor: data.scheduledFor,
          deliveredAt: data.deliveredAt,
          status: data.status,
        },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async delete(id: UniqueEntityId): Promise<void> {
    try {
      await this.prisma.notification.delete({
        where: { id: id.toString() },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async findPaginated(
    params: PaginationParams,
    filter?: NotificationFilter,
  ): Promise<PaginatedResult<NotificationAggregate>> {
    try {
      const take = params.first ?? 20;
      const where: Prisma.NotificationWhereInput = {};

      if (filter?.status) {
        where.status = filter.status as PrismaNotification['status'];
      }
      if (filter?.workspaceId) {
        where.reminder = { workspaceId: filter.workspaceId.toString() };
      }

      const total = await this.prisma.notification.count({ where });
      const records = await this.prisma.notification.findMany({
        where,
        take,
        orderBy: { scheduledFor: params.sortOrder ?? 'desc' },
        include: { reminder: true },
      });

      const items = records.map((r) => this.toDomain(r));
      return {
        items,
        pageInfo: {
          hasNextPage: items.length === take,
          hasPreviousPage: !!params.after,
          totalCount: total,
        },
      };
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async findUserNotifications(
    workspaceId: UniqueEntityId,
    userId: UniqueEntityId,
    filter?: NotificationFilter,
  ): Promise<NotificationAggregate[]> {
    try {
      const where: Prisma.NotificationWhereInput = {
        reminder: {
          workspaceId: workspaceId.toString(),
          createdById: userId.toString(),
        },
      };

      if (filter?.status) {
        where.status = filter.status as PrismaNotification['status'];
      }

      const records = await this.prisma.notification.findMany({
        where,
        orderBy: { scheduledFor: 'desc' },
        include: { reminder: true },
      });

      return records.map((r) => this.toDomain(r));
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async findPendingNotifications(limit = 50): Promise<NotificationAggregate[]> {
    try {
      const records = await this.prisma.notification.findMany({
        where: { status: 'PENDING' },
        take: limit,
        orderBy: { scheduledFor: 'asc' },
        include: { reminder: true },
      });

      return records.map((r) => this.toDomain(r));
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  private toDomain(record: NotificationWithReminderPayload): NotificationAggregate {
    /**
     * Note: Current Prisma Notification schema persists id, reminderId, title, body, scheduledFor, deliveredAt, status.
     * Advanced delivery metrics (readAt, failureReason, attempts log) are maintained in-memory on the aggregate root
     * and will be rehydrated from a dedicated NotificationAttempt table in schema migration v2.
     */
    return NotificationAggregate.reconstitute({
      id: new UniqueEntityId(record.id),
      workspaceId: new UniqueEntityId(record.reminder.workspaceId),
      userId: new UniqueEntityId(record.reminder.createdById),
      reminderId: new UniqueEntityId(record.reminderId),
      title: NotificationTitle.create(record.title),
      body: NotificationBody.create(record.body),
      type: NotificationType.REMINDER_TRIGGER,
      channel: NotificationChannel.IN_APP,
      status: record.status as NotificationStatus,
      scheduledFor: record.scheduledFor,
      deliveredAt: record.deliveredAt ?? undefined,
      readAt: undefined,
      failureReason: undefined,
      attempts: [],
      createdAt: record.scheduledFor,
      updatedAt: record.deliveredAt ?? record.scheduledFor,
    });
  }
}
