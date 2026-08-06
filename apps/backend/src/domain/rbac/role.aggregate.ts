import { AggregateRoot, UniqueEntityId, Guard, DomainValidationException } from '@lumora/shared';

export interface RoleAggregateProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  name: string;
  description?: string;
  system?: boolean;
  permissions?: Set<string>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain Aggregate Root representing a Role-Based Access Control role definition within a Workspace.
 */
export class RoleAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public name: string;
  public description?: string | undefined;
  public readonly system: boolean;
  private _permissions: Set<string>;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: RoleAggregateProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.name = props.name;
    this.description = props.description;
    this.system = props.system ?? false;
    this._permissions = new Set(props.permissions ?? []);
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public get permissions(): ReadonlySet<string> {
    return this._permissions;
  }

  public static create(props: RoleAggregateProps): RoleAggregate {
    const wsGuard = Guard.againstNullOrUndefined(props.workspaceId, 'workspaceId');
    if (wsGuard.isFailure) throw wsGuard.getError();

    const nameGuard = Guard.againstEmptyString(props.name, 'name');
    if (nameGuard.isFailure) throw nameGuard.getError();

    return new RoleAggregate(props);
  }

  public static reconstitute(props: RoleAggregateProps): RoleAggregate {
    return new RoleAggregate(props);
  }

  public hasPermission(permissionKey: string): boolean {
    return this._permissions.has(permissionKey);
  }

  public grantPermission(permissionKey: string): void {
    if (this.system) {
      throw new DomainValidationException(
        `System role '${this.name}' permissions cannot be altered directly.`,
        { role: [`System role permissions are immutable.`] },
      );
    }
    this._permissions.add(permissionKey);
    this.updatedAt = new Date();
  }

  public revokePermission(permissionKey: string): void {
    if (this.system) {
      throw new DomainValidationException(
        `System role '${this.name}' permissions cannot be altered directly.`,
        { role: [`System role permissions are immutable.`] },
      );
    }
    this._permissions.delete(permissionKey);
    this.updatedAt = new Date();
  }
}
