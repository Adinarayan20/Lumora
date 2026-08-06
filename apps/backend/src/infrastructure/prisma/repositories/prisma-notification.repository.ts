import { Injectable } from '@nestjs/common';
import { UniqueEntityId, PaginatedResult, PaginationParams } from '@lumora/shared';
import { PrismaService } from '../prisma.service.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import type {
  INotificationRepository,
  NotificationFilter,
} from '../../../domain/notifications/repositories/notification.repository.interface.js';
import { NotificationAggregate } from '../../../domain/notifications/notification.aggregate.js';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../../../domain/notifications/value-objects/notification-enums.js';

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
      const data = {
        title: aggregate.title,
        body: aggregate.body,
        scheduledFor: aggregate.scheduledFor,
        deliveredAt: aggregate.deliveredAt,
        status: aggregate.status as any,
      };

      if (aggregate.reminderId) {
        await this.prisma.notification.upsert({
          where: { id: aggregate.id.toString() },
          create: {
            id: aggregate.id.toString(),
            reminderId: aggregate.reminderId.toString(),
            ...data,
          },
          update: data,
        });
      }
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
      const where: any = {};
      if (filter?.status) where.status = filter.status;
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
      const where: any = {
        reminder: {
          workspaceId: workspaceId.toString(),
          createdById: userId.toString(),
        },
      };

      if (filter?.status) where.status = filter.status;

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

  private toDomain(record: any): NotificationAggregate {
    return NotificationAggregate.reconstitute({
      id: new UniqueEntityId(record.id),
      workspaceId: new UniqueEntityId(record.reminder.workspaceId),
      userId: new UniqueEntityId(record.reminder.createdById),
      reminderId: new UniqueEntityId(record.reminderId),
      title: record.title,
      body: record.body,
      type: NotificationType.REMINDER_TRIGGER,
      channel: NotificationChannel.IN_APP,
      status: record.status as NotificationStatus,
      scheduledFor: record.scheduledFor,
      deliveredAt: record.deliveredAt ?? undefined,
    });
  }
}
