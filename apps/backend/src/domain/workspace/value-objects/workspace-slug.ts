import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface WorkspaceSlugProps extends Record<string, unknown> {
  value: string;
}

/**
 * Value Object encapsulating a validated Workspace URL slug.
 */
export class WorkspaceSlug extends ValueObject<WorkspaceSlugProps> {
  private static readonly SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  private constructor(props: WorkspaceSlugProps) {
    super(props);
  }

  public static create(slug: string): WorkspaceSlug {
    const lengthGuard = Guard.againstInvalidLength(slug, 3, 63, 'slug');
    if (lengthGuard.isFailure) throw lengthGuard.getError();

    const trimmed = slug.trim().toLowerCase();
    if (!WorkspaceSlug.SLUG_REGEX.test(trimmed)) {
      throw new DomainValidationException(
        `Invalid workspace slug format '${slug}'. Must contain lowercase alphanumeric characters and hyphens.`,
        { slug: [`Slug format is invalid.`] },
      );
    }

    return new WorkspaceSlug({ value: trimmed });
  }

  public toValue(): string {
    return this.props.value;
  }

  public override toString(): string {
    return this.props.value;
  }
}
