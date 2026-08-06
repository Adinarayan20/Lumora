import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface CollectionSlugProps extends Record<string, unknown> {
  value: string;
}

/**
 * Value Object encapsulating a validated Collection URL slug.
 */
export class CollectionSlug extends ValueObject<CollectionSlugProps> {
  private static readonly SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  private constructor(props: CollectionSlugProps) {
    super(props);
  }

  public static create(slug: string): CollectionSlug {
    const lengthGuard = Guard.againstInvalidLength(slug, 2, 63, 'collectionSlug');
    if (lengthGuard.isFailure) throw lengthGuard.getError();

    const trimmed = slug.trim().toLowerCase();
    if (!CollectionSlug.SLUG_REGEX.test(trimmed)) {
      throw new DomainValidationException(
        `Invalid collection slug format '${slug}'. Must contain lowercase alphanumeric characters and hyphens.`,
        { collectionSlug: [`Slug format is invalid.`] },
      );
    }

    return new CollectionSlug({ value: trimmed });
  }

  public toValue(): string {
    return this.props.value;
  }

  public override toString(): string {
    return this.props.value;
  }
}
