import { describe, it, expect } from 'vitest';
import { UniqueEntityId, FieldType } from '@lumora/shared';
import { SchemaRegistryAggregate } from '../schema-registry.aggregate.js';

describe('SchemaRegistryAggregate', () => {
  it('should instantiate a valid SchemaRegistryAggregate and update version on field change', () => {
    const workspaceId = new UniqueEntityId();
    const schema = SchemaRegistryAggregate.create({
      workspaceId,
      typeKey: 'book_review',
      schemaVersion: 1,
      fields: [
        {
          key: 'rating',
          label: 'Rating',
          type: FieldType.NUMBER,
          validation: { min: 1, max: 5 },
        },
      ],
    });

    expect(schema.typeKey).toBe('book_review');
    expect(schema.schemaVersion).toBe(1);

    schema.updateFields([
      ...schema.fields,
      {
        key: 'reviewerNotes',
        label: 'Notes',
        type: FieldType.STRING,
      },
    ]);

    expect(schema.schemaVersion).toBe(2);
    expect(schema.fields.length).toBe(2);
  });
});
