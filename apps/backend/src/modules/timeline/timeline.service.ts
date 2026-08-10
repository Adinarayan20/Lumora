import { Injectable } from '@nestjs/common';

/**
 * TimelineService — intentional stub.
 *
 * The Timeline module currently operates through use cases directly
 * (RecordTimelineActivityUseCase, GetWorkspaceTimelineQuery).
 * This service class exists as a registered provider for future
 * higher-level timeline orchestration logic that may aggregate
 * multiple use cases (e.g. bulk export, analytics queries).
 *
 * Classification: DEFERRED — not legacy, not dead, intentionally empty.
 * Do NOT delete: it is a registered NestJS provider.
 */
@Injectable()
export class TimelineService {}
