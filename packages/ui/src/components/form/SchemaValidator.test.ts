import { describe, it, expect } from 'vitest';
import { FieldType, type FieldSchema } from '@lumora/shared';
import { SchemaValidator } from './SchemaValidator';

describe('SchemaValidator Contract', () => {
  const fields: FieldSchema[] = [
    {
      key: 'title',
      label: 'Task Title',
      type: FieldType.STRING,
      validation: { required: true, minLength: 3, maxLength: 50 },
    },
    {
      key: 'priority',
      label: 'Priority Level',
      type: FieldType.NUMBER,
      validation: { min: 1, max: 5 },
    },
    {
      key: 'isCompleted',
      label: 'Completed Status',
      type: FieldType.BOOLEAN,
      validation: { required: true },
    },
  ];

  it('passes validation when all fields fulfill schema constraints', () => {
    const values = {
      title: 'Valid Task Title',
      priority: 3,
      isCompleted: false,
    };

    const errors = SchemaValidator.validate(fields, values);
    expect(Object.keys(errors).length).toBe(0);
  });

  it('fails validation when required fields are missing or empty', () => {
    const values = {
      title: '  ',
      priority: 3,
      isCompleted: false,
    };

    const errors = SchemaValidator.validate(fields, values);
    expect(errors.title).toBe('Task Title is required.');
  });

  it('handles zero (0) and false correctly as non-empty valid values', () => {
    const values = {
      title: 'Task Title',
      priority: 0, // min is 1
      isCompleted: false, // required is true, false is valid!
    };

    const errors = SchemaValidator.validate(fields, values);
    expect(errors.isCompleted).toBeUndefined();
    expect(errors.priority).toBe('Priority Level must be at least 1.');
  });

  it('enforces string minLength and maxLength validation rules', () => {
    const tooShort = { title: 'Ab', priority: 2, isCompleted: true };
    expect(SchemaValidator.validate(fields, tooShort).title).toBe(
      'Task Title must be at least 3 characters.',
    );

    const tooLong = { title: 'A'.repeat(51), priority: 2, isCompleted: true };
    expect(SchemaValidator.validate(fields, tooLong).title).toBe(
      'Task Title must be at most 50 characters.',
    );
  });
});
