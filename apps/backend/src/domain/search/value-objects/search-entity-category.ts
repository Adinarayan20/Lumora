import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

export const SearchCategoryType = {
  OBJECT: 'OBJECT',
  SPACE: 'SPACE',
  COLLECTION: 'COLLECTION',
} as const;

export type SearchCategoryType =
  (typeof SearchCategoryType)[keyof typeof SearchCategoryType];

interface SearchEntityCategoryProps extends Record<string, unknown> {
  value: SearchCategoryType;
}

/**
 * Value Object encapsulating entity categories supported by the Search Indexing engine.
 * 
 * FUTURE EXTENSIBILITY:
 * As Lumora expands Universal Object Model capabilities, this Value Object registry
 * will be seamlessly expanded to index additional entity categories including:
 * - REMINDER
 * - NOTE
 * - HABIT
 * - DOCUMENT
 * - FILE_ASSET
 */
export class SearchEntityCategory extends ValueObject<SearchEntityCategoryProps> {
  private constructor(props: SearchEntityCategoryProps) {
    super(props);
  }

  public static create(category: string): SearchEntityCategory {
    const nullGuard = Guard.againstNullOrUndefined(category, 'category');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const upper = category.trim().toUpperCase();
    const validCategories: string[] = Object.values(SearchCategoryType);

    if (!validCategories.includes(upper)) {
      throw new DomainValidationException(
        `Invalid search entity category '${category}'. Must be one of: ${validCategories.join(', ')}.`,
        { category: [`Category must be one of ${validCategories.join(', ')}.`] },
      );
    }

    return new SearchEntityCategory({ value: upper as SearchCategoryType });
  }

  public getValue(): SearchCategoryType {
    return this.props.value;
  }
}
