import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface SearchTermProps extends Record<string, unknown> {
  value: string;
}

export class SearchTerm extends ValueObject<SearchTermProps> {
  private constructor(props: SearchTermProps) {
    super(props);
  }

  public static create(query: string): SearchTerm {
    const nullGuard = Guard.againstNullOrUndefined(query, 'query');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = query.trim().replace(/\s+/g, ' ');
    const emptyGuard = Guard.againstEmptyString(trimmed, 'query');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (trimmed.length < 2) {
      throw new DomainValidationException(
        'Search query term must be at least 2 characters.',
        { query: ['Search term length must be at least 2 characters.'] },
      );
    }

    if (trimmed.length > 200) {
      throw new DomainValidationException(
        'Search query term cannot exceed 200 characters.',
        { query: ['Search term length exceeds 200 characters limit.'] },
      );
    }

    return new SearchTerm({ value: trimmed });
  }

  public getValue(): string {
    return this.props.value;
  }
}
