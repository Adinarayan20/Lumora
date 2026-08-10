import { describe, it, expect, vi } from 'vitest';
import { IdGenerator, UniqueEntityId } from '@lumora/shared';
import { GetWorkspaceTimelineQuery } from '../get-workspace-timeline.query.js';
import { TimelineRecordEntity } from '../../../../domain/timeline/entities/timeline-record.entity.js';
import type { ITimelineRepository } from '../../../../domain/timeline/repositories/timeline.repository.interface.js';

describe('GetWorkspaceTimelineQuery', () => {
  it('should query workspace timeline and return list of TimelineRecordResponseDto', async () => {
    const wsId = IdGenerator.generate().toString();
    const record = TimelineRecordEntity.create({
      workspaceId: new UniqueEntityId(wsId),
      userId: new UniqueEntityId(IdGenerator.generate()),
      entityCategory: 'SPACE',
      entityId: new UniqueEntityId(IdGenerator.generate()),
      action: 'SPACE_CREATED',
    });

    const mockRepo: ITimelineRepository = {
      save: vi.fn(),
      findWorkspaceTimeline: vi.fn().mockResolvedValue([record]),
      findUserTimeline: vi.fn(),
      findObjectTimeline: vi.fn().mockResolvedValue([]),
    };

    const queryHandler = new GetWorkspaceTimelineQuery(mockRepo);
    const result = await queryHandler.execute({ workspaceId: wsId });

    expect(result.isSuccess).toBe(true);
    const dtos = result.getValue();
    expect(dtos).toHaveLength(1);
    expect(dtos[0].action).toBe('SPACE_CREATED');
  });
});


