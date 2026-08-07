import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ArgumentsHost } from '@nestjs/common';
import {
  ApplicationException,
  ErrorCode,
  EntityNotFoundException,
  ConflictException,
  RevisionConflictException,
  EmailAlreadyRegisteredException,
  UsernameTakenException,
  InvalidCredentialsException,
  ForbiddenException,
} from '@lumora/shared';
import { ApplicationExceptionFilter } from '../application-exception.filter.js';

class MockUnknownException extends ApplicationException {
  constructor() {
    super('Unknown exception occurred', 'UNKNOWN_CUSTOM_CODE' as ErrorCode);
  }
}

describe('ApplicationExceptionFilter Unit Tests', () => {
  let filter: ApplicationExceptionFilter;
  let mockResponse: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new ApplicationExceptionFilter();

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  describe('toHttpStatus Mapping', () => {
    it('should map ENTITY_NOT_FOUND to 404', () => {
      const status = ApplicationExceptionFilter.toHttpStatus(
        ErrorCode.ENTITY_NOT_FOUND,
      );
      expect(status).toBe(404);
    });

    it('should map RESOURCE_CONFLICT to 409', () => {
      const status = ApplicationExceptionFilter.toHttpStatus(
        ErrorCode.RESOURCE_CONFLICT,
      );
      expect(status).toBe(409);
    });

    it('should map REVISION_CONFLICT to 409', () => {
      const status = ApplicationExceptionFilter.toHttpStatus(
        ErrorCode.REVISION_CONFLICT,
      );
      expect(status).toBe(409);
    });

    it('should map EMAIL_ALREADY_REGISTERED to 409', () => {
      const status = ApplicationExceptionFilter.toHttpStatus(
        ErrorCode.EMAIL_ALREADY_REGISTERED,
      );
      expect(status).toBe(409);
    });

    it('should map USERNAME_TAKEN to 409', () => {
      const status = ApplicationExceptionFilter.toHttpStatus(
        ErrorCode.USERNAME_TAKEN,
      );
      expect(status).toBe(409);
    });

    it('should map INSUFFICIENT_PERMISSIONS to 403', () => {
      const status = ApplicationExceptionFilter.toHttpStatus(
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
      expect(status).toBe(403);
    });

    it('should map INVALID_CREDENTIALS to 401', () => {
      const status = ApplicationExceptionFilter.toHttpStatus(
        ErrorCode.INVALID_CREDENTIALS,
      );
      expect(status).toBe(401);
    });

    it('should map unknown/unmapped code to 500', () => {
      const status = ApplicationExceptionFilter.toHttpStatus(
        'UNKNOWN_CODE' as ErrorCode,
      );
      expect(status).toBe(500);
    });
  });

  describe('catch() Response Serialization', () => {
    it('should format 404 response for EntityNotFoundException', () => {
      const exception = new EntityNotFoundException('Workspace', 'ws-123');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCode.ENTITY_NOT_FOUND,
          message: "Workspace with identifier 'ws-123' was not found.",
          details: { entityName: 'Workspace', entityId: 'ws-123' },
        },
      });
    });

    it('should format 409 response for ConflictException', () => {
      const exception = new ConflictException(
        'Workspace',
        'Slug already exists',
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCode.RESOURCE_CONFLICT,
          message:
            "Conflict detected on resource 'Workspace': Slug already exists.",
          details: {
            resource: 'Workspace',
            conflictReason: 'Slug already exists',
          },
        },
      });
    });

    it('should format 409 response for RevisionConflictException', () => {
      const exception = new RevisionConflictException('Object', 1, 2);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCode.REVISION_CONFLICT,
          message: 'Object revision mismatch: current is 1, update expected 2.',
          details: {
            entityName: 'Object',
            currentRevision: 1,
            expectedRevision: 2,
          },
        },
      });
    });

    it('should format 409 response for EmailAlreadyRegisteredException', () => {
      const exception = new EmailAlreadyRegisteredException('user@example.com');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCode.EMAIL_ALREADY_REGISTERED,
          message: "Email address 'user@example.com' is already registered.",
          details: { email: 'user@example.com' },
        },
      });
    });

    it('should format 409 response for UsernameTakenException', () => {
      const exception = new UsernameTakenException('johndoe');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCode.USERNAME_TAKEN,
          message: "Username 'johndoe' is already taken.",
          details: { username: 'johndoe' },
        },
      });
    });

    it('should format 403 response for ForbiddenException', () => {
      const exception = new ForbiddenException('workspace:write');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message:
            "Access denied. Missing required permission 'workspace:write'.",
          details: { requiredPermission: 'workspace:write' },
        },
      });
    });

    it('should format 401 response for InvalidCredentialsException', () => {
      const exception = new InvalidCredentialsException();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email/username or password.',
        },
      });
    });

    it('should format 500 response for unknown exception code', () => {
      const exception = new MockUnknownException();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'UNKNOWN_CUSTOM_CODE',
          message: 'Unknown exception occurred',
        },
      });
    });
  });
});
