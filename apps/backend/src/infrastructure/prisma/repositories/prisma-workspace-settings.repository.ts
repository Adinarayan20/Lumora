import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import {
  Prisma,
  Workspace as PrismaWorkspace,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma.service.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import type { IWorkspaceSettingsRepository } from '../../../domain/settings/repositories/workspace-settings.repository.interface.js';
import { WorkspaceSettingsAggregate } from '../../../domain/settings/workspace-settings.aggregate.js';
import { RetentionDays } from '../../../domain/settings/value-objects/retention-days.js';

@Injectable()
export class PrismaWorkspaceSettingsRepository implements IWorkspaceSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findByWorkspaceId(
    workspaceId: UniqueEntityId,
  ): Promise<WorkspaceSettingsAggregate | null> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId.toString() },
      });

      if (!workspace) return null;

      return this.toDomain(workspace);
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async save(settings: WorkspaceSettingsAggregate): Promise<void> {
    try {
      const data = this.toPersistence(settings);

      await this.prisma.workspace.update({
        where: { id: settings.workspaceId.toString() },
        data: {
          settings: data as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  /**
   * Explicit mapping converting database Workspace record to WorkspaceSettingsAggregate domain root.
   */
  public toDomain(model: PrismaWorkspace): WorkspaceSettingsAggregate {
    const rawSettings = (model.settings as Record<string, unknown>) ?? {};

    return WorkspaceSettingsAggregate.reconstitute({
      id: new UniqueEntityId(model.id),
      workspaceId: new UniqueEntityId(model.id),
      defaultRole: (rawSettings.defaultRole as string) ?? 'MEMBER',
      allowGuestAccess: Boolean(rawSettings.allowGuestAccess ?? false),
      retentionDays: RetentionDays.create(
        (rawSettings.retentionDays as number) ?? 365,
      ),
      enforceMfa: Boolean(rawSettings.enforceMfa ?? false),
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Explicit mapping converting WorkspaceSettingsAggregate to database settings JSON payload.
   */
  public toPersistence(
    settings: WorkspaceSettingsAggregate,
  ): Record<string, unknown> {
    return {
      defaultRole: settings.defaultRole,
      allowGuestAccess: settings.allowGuestAccess,
      retentionDays: settings.retentionDays.getDays(),
      enforceMfa: settings.enforceMfa,
    };
  }
}
