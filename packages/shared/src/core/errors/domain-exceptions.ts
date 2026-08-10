import { ApplicationException } from "./application-exception.js";
import { ErrorCode } from "./error-code.js";

// ─── Abstract Base ─────────────────────────────────────────────────────────────

/**
 * Abstract base class for all domain rule violations.
 * All concrete domain exceptions must extend this class.
 */
export abstract class DomainException extends ApplicationException {}

// ─── Generic Domain Exceptions ────────────────────────────────────────────────

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
 * Details of a single failed capability execution hook within an aggregate execution phase.
 */
export interface CapabilityFailureDetail {
  readonly capabilityKey: string;
  readonly phase: string;
  readonly error: Error;
  readonly attempts: number;
  readonly executionPolicy: string;
  readonly correlationId?: string | undefined;
  readonly transactionId?: string | undefined;
  readonly runtimeState?: string | undefined;
  readonly objectId?: string | undefined;
}

/**
 * Thrown when one or more capability execution hooks fail during parallel dispatch.
 */
export class AggregateCapabilityException extends DomainException {
  public readonly failures: readonly CapabilityFailureDetail[];

  constructor(failures: readonly CapabilityFailureDetail[]) {
    const capList = failures.map((f) => f.capabilityKey).join(", ");
    const message = `Aggregate capability execution failure in parallel dispatch (${failures.length} capabilities failed: ${capList}).`;
    super(message, ErrorCode.DOMAIN_VALIDATION_ERROR, { failures });
    this.failures = failures;
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

/**
 * Thrown when an optimistic-concurrency revision mismatch is detected on update.
 * Current revision in storage does not match the revision provided by the caller.
 */
export class RevisionConflictException extends DomainException {
  public readonly entityName: string;
  public readonly currentRevision: number;
  public readonly expectedRevision: number;

  constructor(
    entityName: string,
    currentRevision: number,
    expectedRevision: number,
  ) {
    const message = `${entityName} revision mismatch: current is ${currentRevision}, update expected ${expectedRevision}.`;
    super(message, ErrorCode.REVISION_CONFLICT, {
      entityName,
      currentRevision,
      expectedRevision,
    });
    this.entityName = entityName;
    this.currentRevision = currentRevision;
    this.expectedRevision = expectedRevision;
  }
}

// ─── Auth Domain Exceptions ───────────────────────────────────────────────────

/**
 * Thrown when registration is rejected because the email address is already in use.
 */
export class EmailAlreadyRegisteredException extends DomainException {
  constructor(email: string) {
    super(
      `Email address '${email}' is already registered.`,
      ErrorCode.EMAIL_ALREADY_REGISTERED,
      { email },
    );
  }
}

/**
 * Thrown when registration is rejected because the username is already taken.
 */
export class UsernameTakenException extends DomainException {
  constructor(username: string) {
    super(
      `Username '${username}' is already taken.`,
      ErrorCode.USERNAME_TAKEN,
      { username },
    );
  }
}

/**
 * Thrown when a login attempt fails due to invalid credentials.
 * The message is intentionally generic to prevent user enumeration.
 */
export class InvalidCredentialsException extends DomainException {
  constructor() {
    super("Invalid email/username or password.", ErrorCode.INVALID_CREDENTIALS);
  }
}

/**
 * Thrown when a supplied refresh token is invalid, revoked, or expired.
 */
export class InvalidRefreshTokenException extends DomainException {
  constructor() {
    super(
      "The refresh token is invalid or has been revoked.",
      ErrorCode.INVALID_REFRESH_TOKEN,
    );
  }
}

/**
 * Thrown when an OAuth provider authentication flow cannot be resolved to a Lumora user.
 */
export class OAuthAccountResolutionFailedException extends DomainException {
  constructor(provider: string) {
    super(
      `Unable to resolve a Lumora account for OAuth provider '${provider}'.`,
      ErrorCode.OAUTH_ACCOUNT_RESOLUTION_FAILED,
      { provider },
    );
  }
}

// ─── Workspace Domain Exceptions ──────────────────────────────────────────────

/**
 * Thrown when attempting to delete a PERSONAL workspace.
 * Personal workspaces are permanent and cannot be removed.
 */
export class PersonalWorkspaceDeletionForbiddenException extends DomainException {
  constructor() {
    super(
      "Personal workspace cannot be deleted.",
      ErrorCode.PERSONAL_WORKSPACE_DELETION_FORBIDDEN,
    );
  }
}

/**
 * Thrown when the target user for a membership or ownership operation is not a
 * current active workspace member.
 */
export class TargetNotWorkspaceMemberException extends DomainException {
  constructor(workspaceId: string, userId: string) {
    super(
      "Target user must be an active workspace member.",
      ErrorCode.TARGET_NOT_WORKSPACE_MEMBER,
      { workspaceId, userId },
    );
  }
}

// ─── Reminder Domain Exceptions ───────────────────────────────────────────────

/**
 * Thrown when a supplied RRULE string is not a valid RFC 5545 recurrence rule.
 */
export class RecurrenceRuleInvalidException extends DomainException {
  constructor(rule: string, cause?: string) {
    super(
      cause
        ? `Invalid recurrence rule: ${cause}`
        : `The supplied recurrence rule is not a valid RFC 5545 RRULE.`,
      ErrorCode.RECURRENCE_RULE_INVALID,
      { rule, ...(cause !== undefined && { cause }) },
    );
  }
}

/**
 * Thrown when a snooze operation is attempted on a reminder that is not ACTIVE.
 */
export class ReminderNotActiveForSnoozeException extends DomainException {
  constructor(reminderId: string, currentStatus: string) {
    super(
      `Only ACTIVE reminders can be snoozed. Reminder '${reminderId}' is '${currentStatus}'.`,
      ErrorCode.REMINDER_ONLY_ACTIVE_CAN_SNOOZE,
      { reminderId, currentStatus },
    );
  }
}
