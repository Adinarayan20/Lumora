import { describe, it, expect } from 'vitest';
import { DomainValidationException } from '@lumora/shared';
import { SearchTerm } from '../value-objects/search-term.js';

describe('SearchTerm Value Object', () => {
  it('should trim and normalize whitespace in search query terms', () => {
    const term = SearchTerm.create('   project   planning   ');
    expect(term.getValue()).toBe('project planning');
  });

  it('should throw DomainValidationException for search terms under 2 characters', () => {
    expect(() => SearchTerm.create('a')).toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException for empty or whitespace-only terms', () => {
    expect(() => SearchTerm.create('    ')).toThrow();
  });
});
