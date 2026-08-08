import type { UniversalObject } from '@lumora/shared';
import { ObjectValidationException } from '@lumora/shared';
import {
  Prisma,
  Object as PrismaObject,
} from '../../../generated/prisma/client.js';

export class PrismaObjectMapper {
  /**
   * Translates database persistence model to canonical UniversalObject domain entity.
   */
  public static toDomain(model: PrismaObject): UniversalObject {
    const rawAttributes = (model.attributes as Record<string, unknown>) ?? {};

    return Object.freeze({
      id: model.id,
      typeKey: model.typeKey,
      schemaVersion: model.schemaVersion ?? 1,
      status: model.status,
      attributes: Object.freeze(
        PrismaObjectMapper.cleanDeserializedAttributes(rawAttributes),
      ),
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString(),
      version: model.revision,
      archivedAt: model.archivedAt ? model.archivedAt.toISOString() : undefined,
    });
  }

  /**
   * Cleans deserialized attributes from PostgreSQL JSONB to ensure frozen value immutability.
   */
  private static cleanDeserializedAttributes(
    raw: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(raw)) {
      result[key] = raw[key];
    }
    return result;
  }

  /**
   * Validates and serializes domain attributes into Prisma-compatible InputJsonValue payload.
   * Strictly enforces JSON value boundaries and rejects invalid types like BigInt, NaN, and Infinity.
   */
  public static serializeAttributes(
    attributes: Readonly<Record<string, unknown>>,
  ): Prisma.InputJsonValue {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(attributes)) {
      if (value === undefined) {
        continue;
      }
      result[key] = PrismaObjectMapper.serializeValue(value, key);
    }

    return result as Prisma.InputJsonValue;
  }

  private static serializeValue(val: unknown, pathKey: string): unknown {
    if (typeof val === 'bigint') {
      throw new ObjectValidationException(
        `Attribute '${pathKey}' cannot be a BigInt. BigInt values are not valid JSON-compatible attribute types.`,
      );
    }

    if (typeof val === 'number') {
      if (Number.isNaN(val) || !Number.isFinite(val)) {
        throw new ObjectValidationException(
          `Attribute '${pathKey}' contains an invalid numeric value (${String(val)}). NaN and Infinity are rejected.`,
        );
      }
      return val;
    }

    if (val === null) {
      return Prisma.JsonNull;
    }

    if (typeof val === 'string' || typeof val === 'boolean') {
      return val;
    }

    if (Array.isArray(val)) {
      return val.map((item, idx) =>
        PrismaObjectMapper.serializeValue(item, `${pathKey}[${idx}]`),
      );
    }

    if (typeof val === 'object') {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        if (v !== undefined) {
          obj[k] = PrismaObjectMapper.serializeValue(v, `${pathKey}.${k}`);
        }
      }
      return obj;
    }

    throw new ObjectValidationException(
      `Attribute '${pathKey}' contains an unsupported non-serializable value of type ${typeof val}.`,
    );
  }
}
