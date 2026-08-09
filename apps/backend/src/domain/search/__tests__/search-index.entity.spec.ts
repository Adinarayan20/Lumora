import { describe, it, expect } from 'vitest';
import {
  IdGenerator,
  UniqueEntityId,
  DomainValidationException,
} from '@lumora/shared';
import { SearchIndexEntity } from '../entities/search-index.entity.js';
import { SearchEntityCategory } from '../value-objects/search-entity-category.js';

describe('SearchIndexEntity Invariants & Projection Rules', () => {
  const makeWorkspaceId = () => new UniqueEntityId(IdGenerator.generate());

  it('should successfully create a valid SearchIndexEntity', () => {
    const workspaceId = makeWorkspaceId();
    const entityId = new UniqueEntityId(IdGenerator.generate());
    const category = SearchEntityCategory.create('OBJECT');

    const index = SearchIndexEntity.create({
      workspaceId,
      entityCategory: category,
      entityId,
      title: 'Project Roadmap',
      content: 'Detailed planning documentation for Q3.',
    });

    expect(index.workspaceId.toValue()).toBe(workspaceId.toValue());
    expect(index.entityId.toString()).toBe(entityId.toString());
    expect(index.title).toBe('Project Roadmap');
    expect(index.entityCategory.getValue()).toBe('OBJECT');
  });

  it('should update content and refresh updatedAt timestamp', () => {
    const workspaceId = makeWorkspaceId();
    const entityId = new UniqueEntityId(IdGenerator.generate());

    const index = SearchIndexEntity.create({
      workspaceId,
      entityCategory: 'SPACE',
      entityId,
      title: 'Engineering Space',
      content: 'Space description.',
    });

    index.updateContent('Engineering Space Updated', 'New description text.');
    expect(index.title).toBe('Engineering Space Updated');
    expect(index.content).toBe('New description text.');
  });

  it('should throw DomainValidationException when workspaceId is missing', () => {
    const entityId = new UniqueEntityId(IdGenerator.generate());
    expect(() =>
      SearchIndexEntity.create({
        workspaceId: null as any,
        entityCategory: 'OBJECT',
        entityId,
        title: 'Title',
        content: 'Content',
      }),
    ).toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException on invalid entity category string', () => {
    const workspaceId = makeWorkspaceId();
    const entityId = new UniqueEntityId(IdGenerator.generate());
    expect(() =>
      SearchIndexEntity.create({
        workspaceId,
        entityCategory: 'INVALID_CATEGORY',
        entityId,
        title: 'Title',
        content: 'Content',
      }),
    ).toThrow(DomainValidationException);
  });
});
