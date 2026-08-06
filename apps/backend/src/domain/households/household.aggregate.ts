import { AggregateRoot, UniqueEntityId, Guard } from '@lumora/shared';
import { HouseholdName } from './value-objects/household-name.js';
import { HouseholdMemberEntity } from './entities/household-member.entity.js';
import { HouseholdPolicy } from './policies/household.policy.js';

export interface HouseholdAggregateProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  name: HouseholdName;
  members: HouseholdMemberEntity[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class HouseholdAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public name: HouseholdName;
  public readonly members: HouseholdMemberEntity[];
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: HouseholdAggregateProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.name = props.name;
    this.members = props.members;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(
    props: Omit<HouseholdAggregateProps, 'name' | 'members'> & {
      name: HouseholdName | string;
      ownerUserId: UniqueEntityId;
    },
  ): HouseholdAggregate {
    const wsGuard = Guard.againstNullOrUndefined(
      props.workspaceId,
      'workspaceId',
    );
    if (wsGuard.isFailure) throw wsGuard.getError();

    const nameObj =
      typeof props.name === 'string'
        ? HouseholdName.create(props.name)
        : props.name;

    const ownerMember = HouseholdMemberEntity.create({
      userId: props.ownerUserId,
      role: 'OWNER',
    });

    return new HouseholdAggregate({
      ...props,
      name: nameObj,
      members: [ownerMember],
    });
  }

  public static reconstitute(
    props: HouseholdAggregateProps,
  ): HouseholdAggregate {
    return new HouseholdAggregate(props);
  }

  public addMember(
    userId: UniqueEntityId,
    role: 'MEMBER' | 'CHILD' = 'MEMBER',
  ): void {
    HouseholdPolicy.validateMemberCapacity(this.members.length);
    HouseholdPolicy.validateUniqueMember(this.members, userId.toString());

    const member = HouseholdMemberEntity.create({ userId, role });
    this.members.push(member);
    this.updatedAt = new Date();
  }

  public removeMember(userId: UniqueEntityId): void {
    const index = this.members.findIndex(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (index !== -1) {
      this.members.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public updateName(name: HouseholdName | string): void {
    this.name = typeof name === 'string' ? HouseholdName.create(name) : name;
    this.updatedAt = new Date();
  }
}
