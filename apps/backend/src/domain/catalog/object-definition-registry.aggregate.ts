import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
} from '@lumora/shared';
import type { ObjectDefinition, SystemTrait } from '@lumora/shared';

export interface ObjectDefinitionRegistryProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  typeKey: string;
  name: string;
  pluralName: string;
  description?: string;
  icon: string;
  color?: string;
  allowedCapabilities?: string[];
  traits?: SystemTrait[];
  schemaVersion?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ObjectDefinitionRegistryAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public readonly typeKey: string;
  public name: string;
  public pluralName: string;
  public description?: string | undefined;
  public icon: string;
  public color?: string | undefined;
  public allowedCapabilities: readonly string[];
  public traits: readonly SystemTrait[];
  public schemaVersion: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: ObjectDefinitionRegistryProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.typeKey = props.typeKey;
    this.name = props.name;
    this.pluralName = props.pluralName;
    this.description = props.description;
    this.icon = props.icon;
    this.color = props.color;
    this.allowedCapabilities = Object.freeze([
      ...(props.allowedCapabilities ?? []),
    ]);
    this.traits = Object.freeze([...(props.traits ?? [])]);
    this.schemaVersion = props.schemaVersion ?? 1;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(
    props: ObjectDefinitionRegistryProps,
  ): ObjectDefinitionRegistryAggregate {
    const wsGuard = Guard.againstNullOrUndefined(
      props.workspaceId,
      'workspaceId',
    );
    if (wsGuard.isFailure) throw wsGuard.getError();

    const typeGuard = Guard.againstNullOrUndefined(props.typeKey, 'typeKey');
    if (typeGuard.isFailure) throw typeGuard.getError();

    const nameGuard = Guard.againstNullOrUndefined(props.name, 'name');
    if (nameGuard.isFailure) throw nameGuard.getError();

    if (props.typeKey.trim().length === 0) {
      throw new DomainValidationException('TypeKey cannot be empty.');
    }

    if (props.name.trim().length === 0) {
      throw new DomainValidationException('Name cannot be empty.');
    }

    return new ObjectDefinitionRegistryAggregate(props);
  }

  public static reconstitute(
    props: ObjectDefinitionRegistryProps,
  ): ObjectDefinitionRegistryAggregate {
    return new ObjectDefinitionRegistryAggregate(props);
  }

  public toObjectDefinition(): ObjectDefinition {
    return {
      typeKey: this.typeKey,
      name: this.name,
      pluralName: this.pluralName,
      ...(this.description !== undefined && { description: this.description }),
      icon: this.icon,
      ...(this.color !== undefined && { color: this.color }),
      allowedCapabilities: this.allowedCapabilities,
      traits: this.traits,
      schemaVersion: this.schemaVersion,
    };
  }
}
