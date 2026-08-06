import { describe, it, expect, vi } from 'vitest';
import { IdGenerator } from '@lumora/shared';
import { RecordTimelineActivityUseCase } from '../record-timeline-activity.use-case.js';
import type { ITimelineRepository } from '../../../../domain/timeline/repositories/timeline.repository.interface.js';

describe('RecordTimelineActivityUseCase', () => {
  it('should record timeline activity and return TimelineRecordResponseDto', async () => {
    const wsId = IdGenerator.generate().toString();
    const userId = IdGenerator.generate().toString();
    const entityId = IdGenerator.generate().toString();

    const mockRepo: ITimelineRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findWorkspaceTimeline: vi.fn(),
      findUserTimeline: vi.fn(),
    };

    const useCase = new RecordTimelineActivityUseCase(mockRepo);
    const result = await useCase.execute({
      dto: {
        workspaceId: wsId,
        userId,
        entityCategory: 'OBJECT',
        entityId,
        action: 'OBJECT_CREATED',
        metadata: { source: 'TEST' },
      },
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.workspaceId).toBe(wsId);
    expect(dto.action).toBe('OBJECT_CREATED');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
