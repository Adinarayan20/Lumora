import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  Reminder,
  ReminderExecutionStatus,
  ReminderSource,
  ReminderStatus,
  ReminderTriggerType,
  Prisma,
} from '../../../generated/prisma/client.js';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';
import { FilterReminderDto } from '../dto/filter-reminder.dto';
import { USER_PUBLIC_SELECT } from '../../objects/repositories/object.repository';

export const REMINDER_RELATIONS_INCLUDE = {
  createdBy: { select: USER_PUBLIC_SELECT },
  updatedBy: { select: USER_PUBLIC_SELECT },
  dismissedBy: { select: USER_PUBLIC_SELECT },
  object: {
    include: {
      createdBy: { select: USER_PUBLIC_SELECT },
    },
  },
} as const;

export type ReminderWithRelations = Prisma.ReminderGetPayload<{
  include: typeof REMINDER_RELATIONS_INCLUDE;
}>;

export interface CreateReminderData {
  workspaceId: string;
  objectId: string;
  createdById: string;
  remindAt: Date;
  timezone?: string;
  recurrenceRule?: string;
  source?: ReminderSource;
  triggerType?: ReminderTriggerType;
  nextOccurrenceAt?: Date | null;
}

export interface UpdateReminderData {
  updatedById: string;
  remindAt?: Date;
  timezone?: string;
  recurrenceRule?: string;
  status?: ReminderStatus;
  executionStatus?: ReminderExecutionStatus;
  snoozedUntil?: Date | null;
  nextOccurrenceAt?: Date | null;
  lastTriggeredAt?: Date | null;
  completedAt?: Date | null;
  dismissedAt?: Date | null;
  dismissedById?: string | null;
  cancelledAt?: Date | null;
  deletedAt?: Date | null;
  lastExecutionId?: string | null;
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
    workspaceId: string,
    objectId: string,
    tx?: PrismaTransaction,
  ): Promise<ReminderWithRelations[]> {
    const client = tx ?? this.prisma;
    return client.reminder.findMany({
      where: {
        workspaceId,
        objectId,
        status: { not: ReminderStatus.DELETED },
      },
      include: REMINDER_RELATIONS_INCLUDE,
      orderBy: { remindAt: 'asc' },
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

    if (filter.executionStatus) {
      where.executionStatus = filter.executionStatus;
    }
    if (filter.overdueOnly) {
      where.executionStatus = ReminderExecutionStatus.PENDING;
      where.remindAt = { lte: new Date() };
    }

    return client.reminder.findMany({
      where,
      include: REMINDER_RELATIONS_INCLUDE,
      orderBy: [{ remindAt: 'asc' }],
    });
  }

  async create(
    data: CreateReminderData,
    tx?: PrismaTransaction,
  ): Promise<Reminder> {
    const client = tx ?? this.prisma;
    return client.reminder.create({
      data: {
        workspaceId: data.workspaceId,
        objectId: data.objectId,
        createdById: data.createdById,
        remindAt: data.remindAt,
        timezone: data.timezone ?? 'UTC',
        recurrenceRule: data.recurrenceRule,
        source: data.source ?? ReminderSource.MANUAL,
        triggerType: data.triggerType ?? ReminderTriggerType.TIME,
        status: ReminderStatus.ACTIVE,
        executionStatus: ReminderExecutionStatus.PENDING,
        nextOccurrenceAt: data.nextOccurrenceAt ?? data.remindAt,
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
        timezone: data.timezone,
        recurrenceRule: data.recurrenceRule,
        status: data.status,
        executionStatus: data.executionStatus,
        snoozedUntil: data.snoozedUntil,
        nextOccurrenceAt: data.nextOccurrenceAt,
        lastTriggeredAt: data.lastTriggeredAt,
        completedAt: data.completedAt,
        dismissedAt: data.dismissedAt,
        dismissedById: data.dismissedById,
        cancelledAt: data.cancelledAt,
        deletedAt: data.deletedAt,
        lastExecutionId: data.lastExecutionId,
        revision: { increment: 1 },
      },
      include: REMINDER_RELATIONS_INCLUDE,
    });
  }

  async softDelete(
    id: string,
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<Reminder> {
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
