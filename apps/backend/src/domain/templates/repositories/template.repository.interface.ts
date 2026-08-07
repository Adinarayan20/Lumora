import type { UniqueEntityId } from '@lumora/shared';
import type { TemplateAggregate } from '../template.aggregate.js';
import type { InstalledTemplateAggregate } from '../installed-template.aggregate.js';

export interface ITemplateRepository {
  findTemplateByKey(key: string): Promise<TemplateAggregate | null>;
  saveTemplate(template: TemplateAggregate): Promise<void>;
  findInstalledTemplate(
    workspaceId: UniqueEntityId,
    templateKey: string,
  ): Promise<InstalledTemplateAggregate | null>;
  saveInstalledTemplate(installed: InstalledTemplateAggregate): Promise<void>;
}
