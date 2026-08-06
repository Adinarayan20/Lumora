import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface SpaceSlugProps extends Record<string, unknown> {
  value: string;
}

/**
 * Value Object encapsulating a validated Space URL slug within a Workspace.
 */
export class SpaceSlug extends ValueObject<SpaceSlugProps> {
  private static readonly SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  private constructor(props: SpaceSlugProps) {
    super(props);
  }

  public static create(slug: string): SpaceSlug {
    const lengthGuard = Guard.againstInvalidLength(slug, 2, 63, 'spaceSlug');
    if (lengthGuard.isFailure) throw lengthGuard.getError();

    const trimmed = slug.trim().toLowerCase();
    if (!SpaceSlug.SLUG_REGEX.test(trimmed)) {
      throw new DomainValidationException(
        `Invalid space slug format '${slug}'. Must contain lowercase alphanumeric characters and hyphens.`,
        { spaceSlug: [`Slug format is invalid.`] },
      );
    }

    return new SpaceSlug({ value: trimmed });
  }

  public toValue(): string {
    return this.props.value;
  }

  public override toString(): string {
    return this.props.value;
  }
}
