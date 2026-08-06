import { UniqueEntityId, Guard } from '@lumora/shared';
import { SearchEntityCategory } from '../value-objects/search-entity-category.js';

export interface SearchIndexEntityProps {
  id?: UniqueEntityId;
  entityCategory: SearchEntityCategory;
  entityId: UniqueEntityId;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain projection entity representing a searchable index record for Universal Objects, Spaces, or Collections.
 */
export class SearchIndexEntity {
  public readonly id: UniqueEntityId;
  public readonly entityCategory: SearchEntityCategory;
  public readonly entityId: UniqueEntityId;
  public title: string;
  public content: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: SearchIndexEntityProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.entityCategory = props.entityCategory;
    this.entityId = props.entityId;
    this.title = props.title;
    this.content = props.content;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(
    props: Omit<SearchIndexEntityProps, 'entityCategory'> & {
      entityCategory: SearchEntityCategory | string;
    },
  ): SearchIndexEntity {
    const entGuard = Guard.againstNullOrUndefined(props.entityId, 'entityId');
    if (entGuard.isFailure) throw entGuard.getError();

    const titleGuard = Guard.againstEmptyString(props.title, 'title');
    if (titleGuard.isFailure) throw titleGuard.getError();

    const catObj =
      typeof props.entityCategory === 'string'
        ? SearchEntityCategory.create(props.entityCategory)
        : props.entityCategory;

    return new SearchIndexEntity({
      ...props,
      entityCategory: catObj,
    });
  }

  public static reconstitute(props: SearchIndexEntityProps): SearchIndexEntity {
    return new SearchIndexEntity(props);
  }

  public updateContent(title: string, content: string): void {
    const titleGuard = Guard.againstEmptyString(title, 'title');
    if (titleGuard.isFailure) throw titleGuard.getError();

    this.title = title;
    this.content = content;
    this.updatedAt = new Date();
  }
}
