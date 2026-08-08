import type { IObjectRepository } from './object-repository.interface.js';
import type { UniversalObject, ObjectFilterOptions } from '../types/universal-object.types.js';
import { ObjectStatus } from '../../catalog/object-status.js';
import {
  ObjectNotFoundException,
  ObjectAlreadyExistsException,
  ObjectLifecycleConflictException,
  ObjectConcurrencyException,
  ObjectValidationException,
} from '../errors/object-runtime-error.js';

function deepCloneValue<T>(val: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(val);
    } catch {
      // Fallback to recursive clone if structuredClone fails
    }
  }

  if (val === null || val === undefined || typeof val !== 'object') {
    return val;
  }

  if (Array.isArray(val)) {
    return val.map((item) => deepCloneValue(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(val)) {
    const propVal = (val as Record<string, unknown>)[key];
    result[key] = deepCloneValue(propVal);
  }
  return result as T;
}

export class InMemoryObjectRepository implements IObjectRepository {
  private readonly store = new Map<string, UniversalObject>();

  /**
   * Defensive clone helper ensuring repository memory state remains isolated.
   */
  private cloneObject(obj: UniversalObject): UniversalObject {
    return Object.freeze({
      ...obj,
      attributes: Object.freeze(deepCloneValue(obj.attributes)),
    });
  }

  public async getById(id: string): Promise<UniversalObject | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    return this.cloneObject(existing);
  }

  public async create(object: UniversalObject): Promise<UniversalObject> {
    if (this.store.has(object.id)) {
      throw new ObjectAlreadyExistsException(object.id);
    }
    const copy = this.cloneObject(object);
    this.store.set(object.id, copy);
    return this.cloneObject(copy);
  }

  public async update(object: UniversalObject, expectedVersion?: number): Promise<UniversalObject> {
    const existing = this.store.get(object.id);
    if (!existing) {
      throw new ObjectNotFoundException(object.id);
    }

    if (expectedVersion !== undefined && existing.version !== expectedVersion) {
      throw new ObjectConcurrencyException(object.id, expectedVersion, existing.version);
    }

    const copy = this.cloneObject(object);
    this.store.set(object.id, copy);
    return this.cloneObject(copy);
  }

  public async list(options?: ObjectFilterOptions): Promise<readonly UniversalObject[]> {
    if (options?.offset !== undefined) {
      if (typeof options.offset !== 'number' || Number.isNaN(options.offset) || !Number.isInteger(options.offset) || options.offset < 0) {
        throw new ObjectValidationException(`Invalid offset '${options.offset}': must be a non-negative integer.`);
      }
    }

    if (options?.limit !== undefined) {
      if (typeof options.limit !== 'number' || Number.isNaN(options.limit) || !Number.isInteger(options.limit) || options.limit < 0) {
        throw new ObjectValidationException(`Invalid limit '${options.limit}': must be a non-negative integer.`);
      }
    }

    let result = Array.from(this.store.values());

    if (options?.typeKey) {
      result = result.filter((item) => item.typeKey === options.typeKey);
    }
    if (options?.status) {
      result = result.filter((item) => item.status === options.status);
    }

    if (options?.offset !== undefined) {
      result = result.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      result = result.slice(0, options.limit);
    }

    return Object.freeze(result.map((item) => this.cloneObject(item)));
  }

  public async archive(id: string, archivedAtIso: string, updatedAtIso: string): Promise<UniversalObject> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new ObjectNotFoundException(id);
    }
    if (existing.status === ObjectStatus.ARCHIVED) {
      throw new ObjectLifecycleConflictException(id, existing.status, 'archive');
    }

    const updated: UniversalObject = {
      ...existing,
      status: ObjectStatus.ARCHIVED,
      archivedAt: archivedAtIso,
      updatedAt: updatedAtIso,
      version: existing.version + 1,
    };

    const copy = this.cloneObject(updated);
    this.store.set(id, copy);
    return this.cloneObject(copy);
  }

  public async restore(id: string, updatedAtIso: string): Promise<UniversalObject> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new ObjectNotFoundException(id);
    }
    if (existing.status === ObjectStatus.ACTIVE) {
      throw new ObjectLifecycleConflictException(id, existing.status, 'restore');
    }

    const { archivedAt: _omitted, ...rest } = existing;

    const updated: UniversalObject = {
      ...rest,
      status: ObjectStatus.ACTIVE,
      updatedAt: updatedAtIso,
      version: existing.version + 1,
    };

    const copy = this.cloneObject(updated);
    this.store.set(id, copy);
    return this.cloneObject(copy);
  }

  /**
   * Helper to clear repository memory store for testing isolation.
   */
  public clear(): void {
    this.store.clear();
  }
}
