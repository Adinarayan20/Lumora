import type { SchemaDefinition } from '../../catalog/schema-definition.js';
import { ObjectStatus } from '../../catalog/object-status.js';
import { IdGenerator } from '../../primitives/id-generator.js';
import type {
  UniversalObject,
  ObjectFilterOptions,
} from '../types/universal-object.types.js';
import type {
  ObjectRuntimeDependencies,
  CreateObjectOptions,
  UpdateObjectOptions,
  ClockProvider,
  IdGeneratorProvider,
} from '../types/object-runtime.types.js';
import type { IObjectRepository } from '../repository/object-repository.interface.js';
import { ObjectValidator } from '../validation/object-validator.js';
import {
  ObjectNotFoundException,
  ObjectValidationException,
  ObjectConcurrencyException,
} from '../errors/object-runtime-error.js';

export class SystemClockProvider implements ClockProvider {
  public nowIso(): string {
    return new Date().toISOString();
  }
}

export class DefaultIdGeneratorProvider implements IdGeneratorProvider {
  public generate(): string {
    return IdGenerator.generate();
  }
}

export class ObjectRuntime {
  private readonly repository: IObjectRepository;
  private readonly clock: ClockProvider;
  private readonly idGenerator: IdGeneratorProvider;

  constructor(deps: ObjectRuntimeDependencies) {
    this.repository = deps.repository;
    this.clock = deps.clock ?? new SystemClockProvider();
    this.idGenerator = deps.idGenerator ?? new DefaultIdGeneratorProvider();
  }

  /**
   * Creates, validates, normalizes, and persists a new Universal Object.
   */
  public async createObject(options: CreateObjectOptions): Promise<UniversalObject> {
    const { definition, schema, attributes, id } = options;

    const validation = ObjectValidator.validateCreation(
      { typeKey: definition.typeKey, attributes },
      definition,
      schema,
    );

    if (!validation.isValid) {
      throw new ObjectValidationException(
        `Failed to create object of type '${definition.typeKey}': validation failed.`,
        validation.errors,
      );
    }

    const now = this.clock.nowIso();
    const objectId = id ?? this.idGenerator.generate();

    const newObject: UniversalObject = Object.freeze({
      id: objectId,
      typeKey: definition.typeKey,
      schemaVersion: schema.schemaVersion,
      status: ObjectStatus.ACTIVE,
      attributes: validation.normalizedAttributes,
      createdAt: now,
      updatedAt: now,
      version: 1,
    });

    return this.repository.create(newObject);
  }

  /**
   * Retrieves a Universal Object by ID. Throws ObjectNotFoundException if missing.
   */
  public async getObject(id: string): Promise<UniversalObject> {
    const object = await this.repository.getById(id);
    if (!object) {
      throw new ObjectNotFoundException(id);
    }
    return object;
  }

  /**
   * Patches, validates, and persists updates to an existing Universal Object.
   */
  public async updateObject(options: UpdateObjectOptions): Promise<UniversalObject> {
    const { id, schema, attributes, expectedVersion } = options;

    const existing = await this.getObject(id);

    if (expectedVersion !== undefined && existing.version !== expectedVersion) {
      throw new ObjectConcurrencyException(id, expectedVersion, existing.version);
    }

    const validation = ObjectValidator.validateUpdate(
      { attributes },
      existing,
      schema,
    );

    if (!validation.isValid) {
      throw new ObjectValidationException(
        `Failed to update object '${id}': validation failed.`,
        validation.errors,
      );
    }

    const now = this.clock.nowIso();

    const updatedObject: UniversalObject = Object.freeze({
      ...existing,
      attributes: validation.normalizedAttributes,
      updatedAt: now,
      version: existing.version + 1,
    });

    return this.repository.update(updatedObject);
  }

  /**
   * Transitions an active object to archived status.
   */
  public async archiveObject(id: string): Promise<UniversalObject> {
    const existing = await this.getObject(id);
    ObjectValidator.validateLifecycleTransition(existing.status, ObjectStatus.ARCHIVED, id);

    const now = this.clock.nowIso();
    return this.repository.archive(id, now, now);
  }

  /**
   * Restores an archived object to active status.
   */
  public async restoreObject(id: string): Promise<UniversalObject> {
    const existing = await this.getObject(id);
    ObjectValidator.validateLifecycleTransition(existing.status, ObjectStatus.ACTIVE, id);

    const now = this.clock.nowIso();
    return this.repository.restore(id, now);
  }

  /**
   * Queries stored objects matching optional filter options.
   */
  public async listObjects(options?: ObjectFilterOptions): Promise<readonly UniversalObject[]> {
    return this.repository.list(options);
  }
}

/**
 * Factory function creating an ObjectRuntime instance with dependency injection support.
 */
export function createObjectRuntime(deps: ObjectRuntimeDependencies): ObjectRuntime {
  return new ObjectRuntime(deps);
}
