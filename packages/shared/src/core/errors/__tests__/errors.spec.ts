import { describe, it, expect } from 'vitest';
import {
  ErrorCode,
  ApplicationException,
  EntityNotFoundException,
  DomainValidationException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  InfrastructureException,
} from '../index.js';

describe('Standardized Error Architecture', () => {
  describe('EntityNotFoundException', () => {
    it('should format message, code, and details correctly', () => {
      const exception = new EntityNotFoundException('Reminder', 'uuid-1234');

      expect(exception.message).toBe("Reminder with identifier 'uuid-1234' was not found.");
      expect(exception.code).toBe(ErrorCode.ENTITY_NOT_FOUND);
      expect(exception.entityName).toBe('Reminder');
      expect(exception.entityId).toBe('uuid-1234');
      expect(exception).toBeInstanceOf(ApplicationException);
      expect(exception).toBeInstanceOf(EntityNotFoundException);
    });

    it('should serialize cleanly to ApplicationErrorPayload', () => {
      const exception = new EntityNotFoundException('Space', 'space-99');
      const payload = exception.toPayload();

      expect(payload.success).toBe(false);
      expect(payload.code).toBe(ErrorCode.ENTITY_NOT_FOUND);
      expect(payload.message).toBe("Space with identifier 'space-99' was not found.");
      expect(payload.details).toEqual({ entityName: 'Space', entityId: 'space-99' });
      expect(typeof payload.timestamp).toBe('string');
    });
  });

  describe('DomainValidationException', () => {
    it('should capture validation field errors', () => {
      const validationErrors = { title: ['Title is required', 'Title must be non-empty'] };
      const exception = new DomainValidationException('Validation failed', validationErrors);

      expect(exception.code).toBe(ErrorCode.DOMAIN_VALIDATION_ERROR);
      expect(exception.validationErrors).toEqual(validationErrors);
      expect(exception.toPayload().details).toEqual({ validationErrors });
    });
  });

  describe('ConflictException', () => {
    it('should format conflict resource and reason', () => {
      const exception = new ConflictException('WorkspaceSlug', 'Slug is already taken');

      expect(exception.code).toBe(ErrorCode.RESOURCE_CONFLICT);
      expect(exception.message).toBe("Conflict detected on resource 'WorkspaceSlug': Slug is already taken.");
      expect(exception.resource).toBe('WorkspaceSlug');
      expect(exception.conflictReason).toBe('Slug is already taken');
    });
  });

  describe('SecurityExceptions', () => {
    it('should construct UnauthorizedException with default message', () => {
      const exception = new UnauthorizedException();

      expect(exception.code).toBe(ErrorCode.UNAUTHENTICATED);
      expect(exception.message).toBe('Authentication credentials are missing or invalid.');
      expect(exception.toPayload().details).toBeUndefined();
    });

    it('should construct ForbiddenException with required permission key', () => {
      const exception = new ForbiddenException('workspace:write');

      expect(exception.code).toBe(ErrorCode.INSUFFICIENT_PERMISSIONS);
      expect(exception.requiredPermission).toBe('workspace:write');
      expect(exception.toPayload().details).toEqual({ requiredPermission: 'workspace:write' });
    });
  });

  describe('InfrastructureException', () => {
    it('should capture underlying cause message', () => {
      const cause = new Error('Database connection timeout');
      const exception = new InfrastructureException('Storage read failure', cause);

      expect(exception.code).toBe(ErrorCode.INTERNAL_INFRASTRUCTURE_ERROR);
      expect(exception.originalError).toBe(cause);
      expect(exception.toPayload().details).toEqual({ causeMessage: 'Database connection timeout' });
    });
  });
});
