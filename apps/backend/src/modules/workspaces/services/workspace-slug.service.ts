import { Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { WorkspaceRepository } from '../repositories/workspace.repository';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';

@Injectable()
export class WorkspaceSlugService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async generateUniqueSlug(
    name: string,
    tx?: PrismaTransaction,
  ): Promise<string> {
    const baseSlug =
      slugify(name, { lower: true, strict: true }) || 'workspace';
    let candidateSlug = baseSlug;

    let exists = await this.workspaceRepository.doesSlugExist(
      candidateSlug,
      tx,
    );
    let attempts = 0;

    while (exists && attempts < 10) {
      candidateSlug = `${baseSlug}-${nanoid(6).toLowerCase()}`;
      exists = await this.workspaceRepository.doesSlugExist(candidateSlug, tx);
      attempts++;
    }

    return candidateSlug;
  }
}
