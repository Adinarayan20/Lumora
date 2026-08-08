import type { IObjectRepository } from './object-repository.interface.js';
import type { UniversalObject, ObjectFilterOptions } from '../types/universal-object.types.js';
import { ObjectStatus } from '../../catalog/object-status.js';
import {
  ObjectNotFoundException,
  ObjectAlreadyExistsException,
  ObjectLifecycleConflictException,
} from '../errors/object-runtime-error.js';

export class InMemoryObjectRepository implements IObjectRepository {
  private readonly store = new Map<string, UniversalObject>();

  /**
   * Helper to perform deep immutable copy of a UniversalObject instance.
   */
  private cloneObject(obj: UniversalObject): UniversalObject {
    return Object.freeze({
      ...obj,
      attributes: Object.freeze(JSON.parse(JSON.stringify(obj.attributes)) as Record<string, unknown>),
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

  public async update(object: UniversalObject): Promise<UniversalObject> {
    if (!this.store.has(object.id)) {
      throw new ObjectNotFoundException(object.id);
    }
    const copy = this.cloneObject(object);
    this.store.set(object.id, copy);
    return this.cloneObject(copy);
  }

  public async list(options?: ObjectFilterOptions): Promise<readonly UniversalObject[]> {
    let result = Array.from(this.store.values());

    if (options?.typeKey) {
      result = result.filter((item) => item.typeKey === options.typeKey);
    }
    if (options?.status) {
      result = result.filter((item) => item.status === options.status);
    }

    if (options?.offset) {
      result = result.slice(options.offset);
    }
    if (options?.limit && options.limit > 0) {
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

    // Omit archivedAt for exactOptionalPropertyTypes compliance
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
