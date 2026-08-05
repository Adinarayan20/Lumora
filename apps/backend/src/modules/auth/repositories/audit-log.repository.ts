import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  AuditAction,
  AuditLog,
  Prisma,
} from '../../../generated/prisma/client';

export type PrismaTransaction = Prisma.TransactionClient;

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: {
      userId: string;
      entity: string;
      entityId: string;
      action: AuditAction;
      oldData?: Prisma.InputJsonValue;
      newData?: Prisma.InputJsonValue;
    },
    tx?: PrismaTransaction,
  ): Promise<AuditLog> {
    const client = tx ?? this.prisma;
    return client.auditLog.create({
      data: {
        userId: data.userId,
        entity: data.entity,
        entityId: data.entityId,
        action: data.action,
        oldData: data.oldData,
        newData: data.newData,
      },
    });
  }
}
