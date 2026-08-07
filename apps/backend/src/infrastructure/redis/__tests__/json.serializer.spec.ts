import { describe, it, expect } from 'vitest';
import { JsonSerializer } from '../serializers/json.serializer.js';

describe('JsonSerializer Unit Tests', () => {
  it('should serialize objects to valid JSON strings', () => {
    const data = { id: '123', name: 'Lumora' };
    const result = JsonSerializer.serialize(data);
    expect(result).toBe('{"id":"123","name":"Lumora"}');
  });

  it('should deserialize valid JSON strings to target object type', () => {
    const json = '{"id":"123","name":"Lumora"}';
    const result = JsonSerializer.deserialize<{ id: string; name: string }>(
      json,
    );
    expect(result).toEqual({ id: '123', name: 'Lumora' });
  });

  it('should return null safely when deserializing invalid JSON payload', () => {
    const invalidJson = 'invalid-json-payload-string-{';
    const result = JsonSerializer.deserialize(invalidJson);
    expect(result).toBeNull();
  });
});
