import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
} from '@lumora/shared';
import type {
  TemplateManifest,
  TemplateContent,
  TemplateCategory,
  PublisherTrustLevel,
} from '@lumora/shared';

export interface TemplateProps {
  id?: UniqueEntityId;
  manifest: TemplateManifest;
  content: TemplateContent;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TemplateAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly manifest: TemplateManifest;
  public readonly content: TemplateContent;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: TemplateProps) {
    super(props.id);
    this.manifest = props.manifest;
    this.content = props.content;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: TemplateProps): TemplateAggregate {
    const manifestGuard = Guard.againstNullOrUndefined(
      props.manifest,
      'manifest',
    );
    if (manifestGuard.isFailure) throw manifestGuard.getError();

    const contentGuard = Guard.againstNullOrUndefined(props.content, 'content');
    if (contentGuard.isFailure) throw contentGuard.getError();

    if (!props.manifest.key || props.manifest.key.trim().length === 0) {
      throw new DomainValidationException(
        'TemplateAggregate requires a non-empty key.',
      );
    }

    return new TemplateAggregate(props);
  }

  public get key(): string {
    return this.manifest.key;
  }

  public get version(): string {
    return this.manifest.version;
  }

  public get category(): TemplateCategory {
    return this.manifest.category;
  }

  public get trustLevel(): PublisherTrustLevel {
    return this.manifest.author.trustLevel;
  }
}
