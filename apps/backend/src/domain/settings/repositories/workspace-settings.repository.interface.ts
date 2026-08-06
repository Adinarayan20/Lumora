import type { UniqueEntityId } from '@lumora/shared';
import type { WorkspaceSettingsAggregate } from '../workspace-settings.aggregate.js';

export interface IWorkspaceSettingsRepository {
  findByWorkspaceId(
    workspaceId: UniqueEntityId,
  ): Promise<WorkspaceSettingsAggregate | null>;
  save(settings: WorkspaceSettingsAggregate): Promise<void>;
}
