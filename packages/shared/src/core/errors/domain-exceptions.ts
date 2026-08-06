import { ApplicationException } from "./application-exception.js";
import { ErrorCode } from "./error-code.js";

/**
 * Abstract base class for all domain rule violations.
 */
export abstract class DomainException extends ApplicationException {}

/**
 * Thrown when an aggregate root or domain entity cannot be resolved.
 */
export class EntityNotFoundException extends DomainException {
  public readonly entityName: string;
  public readonly entityId: string | number;

  constructor(entityName: string, entityId: string | number) {
    const message = `${entityName} with identifier '${entityId}' was not found.`;
    super(message, ErrorCode.ENTITY_NOT_FOUND, { entityName, entityId });
    this.entityName = entityName;
    this.entityId = entityId;
  }
}

/**
 * Thrown when domain constraint rules or property validations fail.
 */
export class DomainValidationException extends DomainException {
  public readonly validationErrors?: Record<string, string[]> | undefined;

  constructor(
    message: string,
    validationErrors?: Record<string, string[]> | undefined,
  ) {
    super(message, ErrorCode.DOMAIN_VALIDATION_ERROR, {
      ...(validationErrors !== undefined && { validationErrors }),
    });
    this.validationErrors = validationErrors;
  }
}

/**
 * Thrown when a unique constraint or concurrency collision occurs in the domain.
 */
export class ConflictException extends DomainException {
  public readonly resource: string;
  public readonly conflictReason: string;

  constructor(resource: string, conflictReason: string) {
    const message = `Conflict detected on resource '${resource}': ${conflictReason}.`;
    super(message, ErrorCode.RESOURCE_CONFLICT, { resource, conflictReason });
    this.resource = resource;
    this.conflictReason = conflictReason;
  }
}
