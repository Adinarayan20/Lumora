import { BaseDomainEvent } from '../base-domain-event.js';

export interface WorkspaceCreatedPayload extends Record<string, unknown> {
  readonly workspaceId: string;
  readonly ownerId: string;
  readonly name: string;
  readonly slug: string;
  readonly createdAt: string;
}

/**
 * Event emitted when a workspace is created.
 */
export class WorkspaceCreatedEvent extends BaseDomainEvent<WorkspaceCreatedPayload> {
  public static readonly EVENT_NAME = 'workspace.created';

  constructor(payload: WorkspaceCreatedPayload) {
    super(
      WorkspaceCreatedEvent.EVENT_NAME,
      payload.workspaceId,
      payload,
      payload.workspaceId,
    );
  }
}
