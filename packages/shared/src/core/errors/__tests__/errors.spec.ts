import { describe, it, expect } from 'vitest';
import {
  ErrorCode,
  ApplicationException,
  EntityNotFoundException,
  DomainValidationException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  SystemException,
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

    it('should serialize cleanly to ApplicationErrorPayload without timestamp', () => {
      const exception = new EntityNotFoundException('Space', 'space-99');
      const payload = exception.toPayload();

      expect(payload.success).toBe(false);
      expect(payload.code).toBe(ErrorCode.ENTITY_NOT_FOUND);
      expect(payload.message).toBe("Space with identifier 'space-99' was not found.");
      expect(payload.details).toEqual({ entityName: 'Space', entityId: 'space-99' });
      expect('timestamp' in payload).toBe(false);
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

  describe('SystemException', () => {
    it('should capture underlying Error cause message', () => {
      const cause = new Error('Database connection timeout');
      const exception = new SystemException('Storage read failure', cause);

      expect(exception.code).toBe(ErrorCode.SYSTEM_ERROR);
      expect(exception.originalError).toBe(cause);
      expect(exception.toPayload().details).toEqual({ causeMessage: 'Database connection timeout' });
    });

    it('should capture underlying string cause', () => {
      const exception = new SystemException('IO failure', 'Disk space full');

      expect(exception.code).toBe(ErrorCode.SYSTEM_ERROR);
      expect(exception.toPayload().details).toEqual({ causeMessage: 'Disk space full' });
    });

    it('should omit causeMessage if originalError is a plain object or unknown type', () => {
      const exception = new SystemException('System failure', { errCode: 500 });

      expect(exception.code).toBe(ErrorCode.SYSTEM_ERROR);
      expect(exception.originalError).toEqual({ errCode: 500 });
      expect(exception.toPayload().details).toBeUndefined();
    });
  });
});
