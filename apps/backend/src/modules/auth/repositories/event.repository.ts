import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { Event, EventStatus, Prisma } from '../../../generated/prisma/client';
import { PrismaTransaction } from './audit-log.repository';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: {
      userId: string;
      type: string;
      payload: Prisma.InputJsonValue;
      status?: EventStatus;
    },
    tx?: PrismaTransaction,
  ): Promise<Event> {
    const client = tx ?? this.prisma;
    return client.event.create({
      data: {
        userId: data.userId,
        type: data.type,
        payload: data.payload,
        status: data.status ?? EventStatus.PENDING,
      },
    });
  }
}
