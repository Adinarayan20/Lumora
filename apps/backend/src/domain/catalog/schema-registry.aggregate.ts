import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
} from '@lumora/shared';
import type { SchemaDefinition, FieldSchema } from '@lumora/shared';

export interface SchemaRegistryProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  typeKey: string;
  schemaVersion?: number;
  fields?: FieldSchema[];
  migrationInitializers?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SchemaRegistryAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public readonly typeKey: string;
  public schemaVersion: number;
  public fields: readonly FieldSchema[];
  public migrationInitializers?: Readonly<Record<string, unknown>> | undefined;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: SchemaRegistryProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.typeKey = props.typeKey;
    this.schemaVersion = props.schemaVersion ?? 1;
    this.fields = Object.freeze([...(props.fields ?? [])]);
    this.migrationInitializers = props.migrationInitializers
      ? Object.freeze({ ...props.migrationInitializers })
      : undefined;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: SchemaRegistryProps): SchemaRegistryAggregate {
    const wsGuard = Guard.againstNullOrUndefined(
      props.workspaceId,
      'workspaceId',
    );
    if (wsGuard.isFailure) throw wsGuard.getError();

    const typeGuard = Guard.againstNullOrUndefined(props.typeKey, 'typeKey');
    if (typeGuard.isFailure) throw typeGuard.getError();

    if (props.typeKey.trim().length === 0) {
      throw new DomainValidationException(
        'TypeKey cannot be empty for SchemaRegistryAggregate.',
      );
    }

    if (props.schemaVersion !== undefined && props.schemaVersion <= 0) {
      throw new DomainValidationException(
        'SchemaVersion must be greater than 0.',
      );
    }

    return new SchemaRegistryAggregate(props);
  }

  public static reconstitute(
    props: SchemaRegistryProps,
  ): SchemaRegistryAggregate {
    return new SchemaRegistryAggregate(props);
  }

  public updateFields(fields: FieldSchema[]): void {
    this.fields = Object.freeze([...fields]);
    this.schemaVersion += 1;
    this.updatedAt = new Date();
  }

  public toSchemaDefinition(): SchemaDefinition {
    return {
      typeKey: this.typeKey,
      schemaVersion: this.schemaVersion,
      fields: this.fields,
      ...(this.migrationInitializers !== undefined && {
        migrationInitializers: this.migrationInitializers,
      }),
    };
  }
}
