import { DomainException } from '../../errors/domain-exceptions.js';
import { ErrorCode } from '../../errors/error-code.js';

/**
 * Base exception for all Universal Object Runtime errors.
 */
export abstract class ObjectRuntimeError extends DomainException {}

/**
 * Thrown when a Universal Object cannot be found by ID.
 */
export class ObjectNotFoundException extends ObjectRuntimeError {
  constructor(public readonly objectId: string) {
    super(
      `Universal Object with identifier '${objectId}' was not found.`,
      ErrorCode.ENTITY_NOT_FOUND,
      { objectId },
    );
  }
}

/**
 * Thrown when attempting to create an object with an ID that already exists.
 */
export class ObjectAlreadyExistsException extends ObjectRuntimeError {
  constructor(public readonly objectId: string) {
    super(
      `Universal Object with identifier '${objectId}' already exists.`,
      ErrorCode.RESOURCE_CONFLICT,
      { objectId },
    );
  }
}

/**
 * Thrown when attributes fail schema or invariant validation.
 */
export class ObjectValidationException extends ObjectRuntimeError {
  constructor(
    message: string,
    public readonly errors?: Readonly<Record<string, readonly string[]>>,
  ) {
    super(message, ErrorCode.DOMAIN_VALIDATION_ERROR, { errors });
  }
}

/**
 * Thrown when an illegal lifecycle transition is requested (e.g. archiving an already archived object).
 */
export class ObjectLifecycleConflictException extends ObjectRuntimeError {
  constructor(
    public readonly objectId: string,
    public readonly currentStatus: string,
    public readonly requestedTransition: string,
  ) {
    super(
      `Cannot perform transition '${requestedTransition}' on object '${objectId}' in status '${currentStatus}'.`,
      ErrorCode.DOMAIN_VALIDATION_ERROR,
      { objectId, currentStatus, requestedTransition },
    );
  }
}

/**
 * Thrown when an object's type key does not match the provided ObjectDefinition or SchemaDefinition.
 */
export class ObjectSchemaMismatchException extends ObjectRuntimeError {
  constructor(
    public readonly objectTypeKey: string,
    public readonly expectedTypeKey: string,
  ) {
    super(
      `Object typeKey '${objectTypeKey}' does not match schema typeKey '${expectedTypeKey}'.`,
      ErrorCode.DOMAIN_VALIDATION_ERROR,
      { objectTypeKey, expectedTypeKey },
    );
  }
}

/**
 * Thrown when an optimistic concurrency revision mismatch occurs during update.
 */
export class ObjectConcurrencyException extends ObjectRuntimeError {
  constructor(
    public readonly objectId: string,
    public readonly expectedVersion: number,
    public readonly actualVersion: number,
  ) {
    super(
      `Concurrency error on object '${objectId}': expected version ${expectedVersion}, but actual version is ${actualVersion}.`,
      ErrorCode.REVISION_CONFLICT,
      { objectId, expectedVersion, actualVersion },
    );
  }
}
