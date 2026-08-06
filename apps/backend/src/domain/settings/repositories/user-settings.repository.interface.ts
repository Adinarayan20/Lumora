import type { UniqueEntityId } from '@lumora/shared';
import type { UserSettingsAggregate } from '../user-settings.aggregate.js';

export interface IUserSettingsRepository {
  findByUserId(userId: UniqueEntityId): Promise<UserSettingsAggregate | null>;
  save(settings: UserSettingsAggregate): Promise<void>;
}
