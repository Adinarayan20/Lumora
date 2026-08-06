import { describe, it, expect } from 'vitest';
import { PrismaExceptionMapper } from '../prisma-exception.mapper.js';
import {
  ConflictException,
  EntityNotFoundException,
  DomainValidationException,
  SystemException,
} from '@lumora/shared';

describe('PrismaExceptionMapper', () => {
  it('should map P2002 duplicate unique constraint error to ConflictException', () => {
    const error = {
      code: 'P2002',
      message: 'Unique constraint failed on the fields: (email)',
      meta: { target: ['email'] },
    };

    const domainException = PrismaExceptionMapper.toDomainException(
      error,
      'User',
    );

    expect(domainException).toBeInstanceOf(ConflictException);
    expect(domainException.message).toContain('User already exists');
  });

  it('should map P2025 record not found error to EntityNotFoundException', () => {
    const error = {
      code: 'P2025',
      message:
        'An operation failed because it depends on one or more records that were required but not found.',
    };

    const domainException = PrismaExceptionMapper.toDomainException(
      error,
      'Object',
    );

    expect(domainException).toBeInstanceOf(EntityNotFoundException);
  });

  it('should map P2003 foreign key constraint error to DomainValidationException', () => {
    const error = {
      code: 'P2003',
      message: 'Foreign key constraint failed on the field: workspace_id',
      meta: { field_name: 'workspace_id' },
    };

    const domainException = PrismaExceptionMapper.toDomainException(
      error,
      'Object',
    );

    expect(domainException).toBeInstanceOf(DomainValidationException);
  });

  it('should map unknown errors to SystemException', () => {
    const error = new Error('Database connection lost');

    const domainException = PrismaExceptionMapper.toDomainException(
      error,
      'Reminder',
    );

    expect(domainException).toBeInstanceOf(SystemException);
  });
});
