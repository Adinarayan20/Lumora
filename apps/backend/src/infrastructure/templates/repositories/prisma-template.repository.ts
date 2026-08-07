import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import type { ITemplateRepository } from '../../../domain/templates/repositories/template.repository.interface.js';
import { TemplateAggregate } from '../../../domain/templates/template.aggregate.js';
import {
  InstalledTemplateAggregate,
  InstalledTemplateStatus,
} from '../../../domain/templates/installed-template.aggregate.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PrismaTemplateRepository implements ITemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findTemplateByKey(
    key: string,
  ): Promise<TemplateAggregate | null> {
    const raw = await this.prisma.template.findUnique({
      where: { key },
    });

    if (!raw) return null;

    return TemplateAggregate.create({
      id: new UniqueEntityId(raw.id),
      manifest: raw.manifest as any,
      content: raw.content as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public async saveTemplate(template: TemplateAggregate): Promise<void> {
    await this.prisma.template.upsert({
      where: { key: template.key },
      create: {
        id: template.id.toString(),
        key: template.key,
        packageUuid: template.manifest.packageUuid,
        publisherUuid: template.manifest.publisherUuid,
        packageHash: template.manifest.packageHash,
        manifest: template.manifest as any,
        content: template.content as any,
      },
      update: {
        manifest: template.manifest as any,
        content: template.content as any,
      },
    });
  }

  public async findInstalledTemplate(
    workspaceId: UniqueEntityId,
    templateKey: string,
  ): Promise<InstalledTemplateAggregate | null> {
    const raw = await this.prisma.installedTemplate.findUnique({
      where: {
        workspaceId_templateKey: {
          workspaceId: workspaceId.toString(),
          templateKey,
        },
      },
    });

    if (!raw) return null;

    return InstalledTemplateAggregate.create({
      id: new UniqueEntityId(raw.id),
      workspaceId: new UniqueEntityId(raw.workspaceId),
      templateKey: raw.templateKey,
      installedVersion: raw.installedVersion,
      status: raw.status as InstalledTemplateStatus,
      installedAt: raw.installedAt,
      updatedAt: raw.updatedAt,
    });
  }

  public async saveInstalledTemplate(
    installed: InstalledTemplateAggregate,
  ): Promise<void> {
    await this.prisma.installedTemplate.upsert({
      where: {
        workspaceId_templateKey: {
          workspaceId: installed.workspaceId.toString(),
          templateKey: installed.templateKey,
        },
      },
      create: {
        id: installed.id.toString(),
        workspaceId: installed.workspaceId.toString(),
        templateKey: installed.templateKey,
        installedVersion: installed.installedVersion,
        status: installed.status,
      },
      update: {
        installedVersion: installed.installedVersion,
        status: installed.status,
      },
    });
  }
}
