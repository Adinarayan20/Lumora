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
            entityName,
            `${entityName} already exists with duplicate ${target}`,
          );
        }

        case 'P2025': {
          return new EntityNotFoundException(entityName, 'unknown');
        }

        case 'P2003': {
          const field = (error.meta?.['field_name'] as string) ?? 'foreign key';
          return new DomainValidationException(
            `Foreign key constraint failed on field ${field}.`,
            {
              [field]: [
                `Referenced entity in field '${field}' does not exist.`,
              ],
            },
          );
        }

        default: {
          return new SystemException(
            `Database operation failed with error code ${error.code}: ${error.message}`,
            error.message,
          );
        }
      }
    }

    if (error instanceof Error) {
      return new SystemException(
        `Unexpected persistence error in ${entityName}: ${error.message}`,
        error.stack,
      );
    }

    return new SystemException(
      `An unknown error occurred in ${entityName} persistence layer.`,
      String(error),
    );
  }

  private static isPrismaKnownError(error: unknown): error is PrismaKnownError {
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    const errObj = error as Record<string, unknown>;
    return typeof errObj['code'] === 'string' && errObj['code'].startsWith('P');
  }
}
