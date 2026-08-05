import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  Reminder as LumoraReminder,
  ReminderPriority,
  ReminderStatus,
  Prisma,
} from '../../../generated/prisma/client';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';
import { FilterReminderDto } from '../dto/filter-reminder.dto';
import { USER_PUBLIC_SELECT } from '../../objects/repositories/object.repository';

export const REMINDER_RELATIONS_INCLUDE = {
  createdBy: { select: USER_PUBLIC_SELECT },
  updatedBy: { select: USER_PUBLIC_SELECT },
  object: {
    include: {
      createdBy: { select: USER_PUBLIC_SELECT },
    },
  },
  notifications: true,
} as const;

export type ReminderWithRelations = Prisma.ReminderGetPayload<{
  include: typeof REMINDER_RELATIONS_INCLUDE;
}>;

export interface CreateReminderData {
  workspaceId: string;
  objectId: string;
  createdById: string;
  remindAt: Date;
  priority?: ReminderPriority;
  recurrence?: Record<string, any>;
}

export interface UpdateReminderData {
  updatedById: string;
  remindAt?: Date;
  priority?: ReminderPriority;
  status?: ReminderStatus;
  snoozedUntil?: Date | null;
  completedAt?: Date | null;
  recurrence?: Record<string, any>;
  deletedAt?: Date | null;
}

@Injectable()
export class ReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<ReminderWithRelations | null> {
    const client = tx ?? this.prisma;
    return client.reminder.findFirst({
      where: {
        id,
        status: { not: ReminderStatus.DELETED },
      },
      include: REMINDER_RELATIONS_INCLUDE,
    });
  }

  async findByObjectId(
    objectId: string,
    tx?: PrismaTransaction,
  ): Promise<ReminderWithRelations | null> {
    const client = tx ?? this.prisma;
    return client.reminder.findFirst({
      where: {
        objectId,
        status: { not: ReminderStatus.DELETED },
      },
      include: REMINDER_RELATIONS_INCLUDE,
    });
  }

  async findWorkspaceReminders(
    workspaceId: string,
    filter: FilterReminderDto,
    tx?: PrismaTransaction,
  ): Promise<ReminderWithRelations[]> {
    const client = tx ?? this.prisma;
    const where: Prisma.ReminderWhereInput = {
      workspaceId,
      status: filter.status ?? { not: ReminderStatus.DELETED },
    };

    if (filter.priority) {
      where.priority = filter.priority;
    }
    if (filter.overdueOnly) {
      where.remindAt = { lt: new Date() };
      where.status = { in: [ReminderStatus.ACTIVE, ReminderStatus.SNOOZED] };
    }

    return client.reminder.findMany({
      where,
      include: REMINDER_RELATIONS_INCLUDE,
      orderBy: [{ remindAt: 'asc' }, { priority: 'desc' }],
    });
  }

  async create(
    data: CreateReminderData,
    tx?: PrismaTransaction,
  ): Promise<LumoraReminder> {
    const client = tx ?? this.prisma;
    return client.reminder.create({
      data: {
        workspaceId: data.workspaceId,
        objectId: data.objectId,
        createdById: data.createdById,
        remindAt: data.remindAt,
        priority: data.priority ?? ReminderPriority.MEDIUM,
        recurrence: data.recurrence,
      },
    });
  }

  async update(
    id: string,
    data: UpdateReminderData,
    tx?: PrismaTransaction,
  ): Promise<ReminderWithRelations> {
    const client = tx ?? this.prisma;
    return client.reminder.update({
      where: { id },
      data: {
        updatedById: data.updatedById,
        remindAt: data.remindAt,
        priority: data.priority,
        status: data.status,
        snoozedUntil: data.snoozedUntil,
        completedAt: data.completedAt,
        recurrence: data.recurrence,
        deletedAt: data.deletedAt,
        revision: { increment: 1 },
      },
      include: REMINDER_RELATIONS_INCLUDE,
    });
  }

  async softDelete(
    id: string,
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<LumoraReminder> {
    const client = tx ?? this.prisma;
    return client.reminder.update({
      where: { id },
      data: {
        status: ReminderStatus.DELETED,
        deletedAt: new Date(),
        updatedById: userId,
        revision: { increment: 1 },
      },
    });
  }
}
