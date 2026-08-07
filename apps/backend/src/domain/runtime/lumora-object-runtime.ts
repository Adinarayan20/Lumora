import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
  RuntimeState,
  Result,
} from '@lumora/shared';
import type {
  SchemaDefinition,
  ObjectDefinition,
  CapabilityReference,
  ExecutionContext,
  DomainEvent,
} from '@lumora/shared';
import type { ObjectAggregate } from '../objects/object.aggregate.js';
import type { CapabilityExecutor } from '../capabilities/capability-executor.js';

export interface LumoraObjectRuntimeProps {
  id?: UniqueEntityId;
  aggregate: ObjectAggregate;
  schema: SchemaDefinition;
  definition: ObjectDefinition;
  activeCapabilities: CapabilityReference[];
  state?: RuntimeState;
}

export class LumoraObjectRuntime extends AggregateRoot<UniqueEntityId> {
  public readonly aggregate: ObjectAggregate;
  public readonly schema: SchemaDefinition;
  public readonly definition: ObjectDefinition;
  public readonly activeCapabilities: readonly CapabilityReference[];
  private _state: RuntimeState;

  private constructor(props: LumoraObjectRuntimeProps) {
    super(props.id ?? props.aggregate.id);
    this.aggregate = props.aggregate;
    this.schema = props.schema;
    this.definition = props.definition;
    this.activeCapabilities = Object.freeze([
      ...(props.activeCapabilities ?? []),
    ]);
    this._state = props.state ?? RuntimeState.ACTIVE;
  }

  public static create(props: LumoraObjectRuntimeProps): LumoraObjectRuntime {
    const aggGuard = Guard.againstNullOrUndefined(props.aggregate, 'aggregate');
    if (aggGuard.isFailure) throw aggGuard.getError();

    const schemaGuard = Guard.againstNullOrUndefined(props.schema, 'schema');
    if (schemaGuard.isFailure) throw schemaGuard.getError();

    const defGuard = Guard.againstNullOrUndefined(
      props.definition,
      'definition',
    );
    if (defGuard.isFailure) throw defGuard.getError();

    return new LumoraObjectRuntime(props);
  }

  public get state(): RuntimeState {
    return this._state;
  }

  public getAttribute(key: string): unknown {
    return this.aggregate.attributes[key];
  }

  public isCapabilityActive(capabilityKey: string): boolean {
    const key = capabilityKey.toLowerCase();
    return this.activeCapabilities.some(
      (c) => c.key.toLowerCase() === key && c.enabled !== false,
    );
  }

  public recordDomainEvent(event: DomainEvent): void {
    this.addDomainEvent(event);
  }

  public async updateAttribute(
    key: string,
    value: unknown,
    context: ExecutionContext,
    executor: CapabilityExecutor,
  ): Promise<Result<void>> {
    if (this._state !== RuntimeState.ACTIVE) {
      return Result.fail(
        new DomainValidationException(
          `Cannot mutate object attributes in state '${this._state}'. Runtime must be ACTIVE.`,
        ),
      );
    }

    const fieldSchema = this.schema.fields.find(
      (f) => f.key.toLowerCase() === key.toLowerCase(),
    );
    if (!fieldSchema) {
      return Result.fail(
        new DomainValidationException(
          `Attribute key '${key}' does not exist in schema for object type '${this.schema.typeKey}'.`,
        ),
      );
    }

    return executor.executePipeline(this, context, async () => {
      const newAttrs = {
        ...this.aggregate.attributes,
        [fieldSchema.key]: value,
      };
      this.aggregate.updateDetails(
        new UniqueEntityId(context.userId),
        this.aggregate.title,
        this.aggregate.description,
        newAttrs,
      );
      await Promise.resolve();
    });
  }

  public lock(): void {
    if (this._state !== RuntimeState.ACTIVE) {
      throw new DomainValidationException(
        `Only ACTIVE runtimes can be locked. Current state is '${this._state}'.`,
      );
    }
    this._state = RuntimeState.LOCKED;
  }

  public unlock(): void {
    if (this._state !== RuntimeState.LOCKED) {
      throw new DomainValidationException(
        `Only LOCKED runtimes can be unlocked. Current state is '${this._state}'.`,
      );
    }
    this._state = RuntimeState.ACTIVE;
  }

  public archive(): void {
    this._state = RuntimeState.ARCHIVED;
  }

  public softDelete(): void {
    this._state = RuntimeState.SOFT_DELETED;
  }

  public restore(): void {
    this._state = RuntimeState.ACTIVE;
  }
}
