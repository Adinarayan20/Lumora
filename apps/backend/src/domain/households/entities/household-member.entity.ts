import { UniqueEntityId, Guard } from '@lumora/shared';

export interface HouseholdMemberEntityProps {
  id?: UniqueEntityId;
  userId: UniqueEntityId;
  role: 'OWNER' | 'MEMBER' | 'CHILD';
  joinedAt?: Date;
}

export class HouseholdMemberEntity {
  public readonly id: UniqueEntityId;
  public readonly userId: UniqueEntityId;
  public role: 'OWNER' | 'MEMBER' | 'CHILD';
  public readonly joinedAt: Date;

  private constructor(props: HouseholdMemberEntityProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.userId = props.userId;
    this.role = props.role;
    this.joinedAt = props.joinedAt ?? new Date();
  }

  public static create(
    props: HouseholdMemberEntityProps,
  ): HouseholdMemberEntity {
    const userGuard = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (userGuard.isFailure) throw userGuard.getError();

    return new HouseholdMemberEntity(props);
  }

  public static reconstitute(
    props: HouseholdMemberEntityProps,
  ): HouseholdMemberEntity {
    return new HouseholdMemberEntity(props);
  }
}
