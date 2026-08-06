import {
  ApplicationException,
  ConflictException,
  EntityNotFoundException,
  DomainValidationException,
  SystemException,
} from '@lumora/shared';

export interface PrismaKnownError {
  code: string;
  message: string;
  meta?: Record<string, unknown> | undefined;
}

/**
 * Utility mapping Prisma database errors into standardized domain exceptions.
 * Prevents ORM-specific error leakage into domain use cases or API layers.
 */
export class PrismaExceptionMapper {
  /**
   * Evaluates an unknown error and transforms Prisma error instances into domain exceptions.
   */
  public static toDomainException(
    error: unknown,
    entityName: string = 'Record',
  ): ApplicationException {
    if (error instanceof ApplicationException) {
      return error;
    }

    if (this.isPrismaKnownError(error)) {
      switch (error.code) {
        case 'P2002': {
          const target = Array.isArray(error.meta?.['target'])
            ? (error.meta['target'] as string[]).join(', ')
            : 'unique field';
          return new ConflictException(
            `${entityName} already exists with duplicate ${target}.`,
            { [target]: [`Duplicate entry violates unique constraint.`] },
          );
        }

        case 'P2025': {
          return new EntityNotFoundException(
            `${entityName} not found in persistence storage.`,
            entityName,
          );
        }

        case 'P2003': {
          const fieldName = typeof error.meta?.['field_name'] === 'string'
            ? (error.meta['field_name'] as string)
            : 'foreign key';
          return new DomainValidationException(
            `Foreign key constraint failed on ${entityName} field '${fieldName}'.`,
            { [fieldName]: [`Referenced relation entity does not exist.`] },
          );
        }

        case 'P2000':
        case 'P2006': {
          return new DomainValidationException(
            `Invalid value provided for ${entityName} storage.`,
            { entity: [`Data value exceeds field bounds or column type spec.`] },
          );
        }

        default:
          return new SystemException(
            `Database operation failed for ${entityName} [Prisma Code: ${error.code}].`,
            error.message,
          );
      }
    }

    if (error instanceof Error) {
      return new SystemException(
        `Unexpected persistence infrastructure failure for ${entityName}.`,
        error.message,
      );
    }

    return new SystemException(
      `Unknown persistence failure occurred for ${entityName}.`,
    );
  }

  private static isPrismaKnownError(error: unknown): error is PrismaKnownError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as Record<string, unknown>)['code'] === 'string' &&
      'message' in error
    );
  }
}
