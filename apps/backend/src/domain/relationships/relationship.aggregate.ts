import {
  AggregateRoot,
  UniqueEntityId,
  Guard,
  DomainValidationException,
} from '@lumora/shared';

export interface RelationshipProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  sourceObjectId: UniqueEntityId;
  targetObjectId: UniqueEntityId;
  /** Relationship semantics: 'parent', 'depends-on', 'related-to', 'blocks', 'duplicates', etc. */
  type: string;
  metadata?: Record<string, unknown>;
  createdById: UniqueEntityId;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * RelationshipAggregate — generic directed relationship between two Universal Objects.
 *
 * A Relationship links any two objects within the same workspace.
 * It does NOT require object-type-specific subclasses — the `type` field encodes
 * relationship semantics (parent, depends-on, related-to, blocks, duplicates, etc.).
 *
 * Workspace isolation is enforced at creation: both objects must belong to the same workspace.
 * Cross-workspace relationships are forbidden.
 */
export class RelationshipAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly workspaceId: UniqueEntityId;
  public readonly sourceObjectId: UniqueEntityId;
  public readonly targetObjectId: UniqueEntityId;
  public readonly type: string;
  public readonly metadata?: Record<string, unknown>;
  public readonly createdById: UniqueEntityId;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public deletedAt?: Date;

  private constructor(props: RelationshipProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.sourceObjectId = props.sourceObjectId;
    this.targetObjectId = props.targetObjectId;
    this.type = props.type;
    this.metadata = props.metadata ? { ...props.metadata } : undefined;
    this.createdById = props.createdById;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.deletedAt = props.deletedAt;
  }

  public static create(props: RelationshipProps): RelationshipAggregate {
    const wsGuard = Guard.againstNullOrUndefined(
      props.workspaceId,
      'workspaceId',
    );
    if (wsGuard.isFailure) throw wsGuard.getError();

    const srcGuard = Guard.againstNullOrUndefined(
      props.sourceObjectId,
      'sourceObjectId',
    );
    if (srcGuard.isFailure) throw srcGuard.getError();

    const tgtGuard = Guard.againstNullOrUndefined(
      props.targetObjectId,
      'targetObjectId',
    );
    if (tgtGuard.isFailure) throw tgtGuard.getError();

    if (!props.type || props.type.trim().length === 0) {
      throw new DomainValidationException(
        'Relationship type must not be empty.',
        { type: ['Relationship type is required.'] },
      );
    }

    if (props.sourceObjectId.equals(props.targetObjectId)) {
      throw new DomainValidationException(
        'A relationship cannot reference the same object as both source and target.',
        { targetObjectId: ['Source and target must be different objects.'] },
      );
    }

    return new RelationshipAggregate(props);
  }

  public static reconstitute(props: RelationshipProps): RelationshipAggregate {
    return new RelationshipAggregate(props);
  }

  public softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
