import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
  SchemaRegisteredEvent,
  SchemaUpdatedEvent,
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

const RESERVED_FIELD_NAMES = new Set([
  'id',
  'workspaceid',
  'createdat',
  'updatedat',
  'deletedat',
  'typekey',
]);

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

  private static validateFields(fields: FieldSchema[]): void {
    const keys = new Set<string>();
    for (const field of fields) {
      const lowerKey = field.key.toLowerCase();
      if (RESERVED_FIELD_NAMES.has(lowerKey)) {
        throw new DomainValidationException(
          `Field key '${field.key}' is a reserved system property.`,
        );
      }
      if (keys.has(lowerKey)) {
        throw new DomainValidationException(
          `Duplicate field key '${field.key}' detected in schema definition.`,
        );
      }
      keys.add(lowerKey);
    }
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

    if (props.fields) {
      SchemaRegistryAggregate.validateFields(props.fields);
    }

    const aggregate = new SchemaRegistryAggregate(props);

    aggregate.addDomainEvent(
      new SchemaRegisteredEvent(
        aggregate.id,
        aggregate.workspaceId,
        aggregate.typeKey,
        aggregate.schemaVersion,
      ),
    );

    return aggregate;
  }

  public static reconstitute(
    props: SchemaRegistryProps,
  ): SchemaRegistryAggregate {
    return new SchemaRegistryAggregate(props);
  }

  public updateFields(fields: FieldSchema[]): void {
    SchemaRegistryAggregate.validateFields(fields);
    this.fields = Object.freeze([...fields]);
    this.schemaVersion += 1;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new SchemaUpdatedEvent(
        this.id,
        this.workspaceId,
        this.typeKey,
        this.schemaVersion,
      ),
    );
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
