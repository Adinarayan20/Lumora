import type { UniqueEntityId } from '@lumora/shared';
import type { IBaseRepository } from '../../common/repositories/base.repository.interface.js';
import type { UserAggregate } from '../user.aggregate.js';
import type { EmailAddress } from '../value-objects/email-address.js';
import type { Username } from '../value-objects/username.js';

export interface IUserRepository
  extends IBaseRepository<UserAggregate, UniqueEntityId> {
  findByEmail(email: EmailAddress): Promise<UserAggregate | null>;
  findByUsername(username: Username): Promise<UserAggregate | null>;
}
