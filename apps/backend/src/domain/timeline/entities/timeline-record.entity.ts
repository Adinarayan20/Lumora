import { UniqueEntityId, Guard } from '@lumora/shared';
import { TimelineAction } from '../value-objects/timeline-action.js';
import { TimelineCategory } from '../value-objects/timeline-category.js';

export interface TimelineRecordEntityProps {
  id?: UniqueEntityId;
  workspaceId: UniqueEntityId;
  userId: UniqueEntityId;
  entityCategory: TimelineCategory;
  entityId: UniqueEntityId;
  action: TimelineAction;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Immutable Read-Side Temporal Ledger Record representing historical activity within a Workspace timeline.
 */
export class TimelineRecordEntity {
  public readonly id: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly userId: UniqueEntityId;
  public readonly entityCategory: TimelineCategory;
  public readonly entityId: UniqueEntityId;
  public readonly action: TimelineAction;
  public readonly timestamp: Date;
  public readonly metadata?: Record<string, unknown> | undefined;

  private constructor(props: TimelineRecordEntityProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.workspaceId = props.workspaceId;
    this.userId = props.userId;
    this.entityCategory = props.entityCategory;
    this.entityId = props.entityId;
    this.action = props.action;
    this.timestamp = props.timestamp ?? new Date();
    this.metadata = props.metadata;
  }

  public static create(
    props: Omit<TimelineRecordEntityProps, 'entityCategory' | 'action'> & {
      entityCategory: TimelineCategory | string;
      action: TimelineAction | string;
    },
  ): TimelineRecordEntity {
    const wsGuard = Guard.againstNullOrUndefined(
      props.workspaceId,
      'workspaceId',
    );
    if (wsGuard.isFailure) throw wsGuard.getError();

    const userGuard = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (userGuard.isFailure) throw userGuard.getError();

    const catObj =
      typeof props.entityCategory === 'string'
        ? TimelineCategory.create(props.entityCategory)
        : props.entityCategory;

    const actionObj =
      typeof props.action === 'string'
        ? TimelineAction.create(props.action)
        : props.action;

    return new TimelineRecordEntity({
      ...props,
      entityCategory: catObj,
      action: actionObj,
    });
  }

  public static reconstitute(
    props: TimelineRecordEntityProps,
  ): TimelineRecordEntity {
    return new TimelineRecordEntity(props);
  }
}
