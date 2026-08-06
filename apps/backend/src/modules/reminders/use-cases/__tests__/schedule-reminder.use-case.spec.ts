import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdGenerator } from '@lumora/shared';
import { ScheduleReminderUseCase } from '../schedule-reminder.use-case.js';
import type { IReminderRepository } from '../../../../domain/reminders/repositories/reminder.repository.interface.js';

describe('ScheduleReminderUseCase', () => {
  let useCase: ScheduleReminderUseCase;
  let mockReminderRepository: IReminderRepository;

  beforeEach(() => {
    mockReminderRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      findDueReminders: vi.fn().mockResolvedValue([]),
      findPaginated: vi.fn().mockResolvedValue({
        items: [],
        pageInfo: {
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    };

    useCase = new ScheduleReminderUseCase(mockReminderRepository);
  });

  it('should schedule a reminder and return a ReminderResponseDto', async () => {
    const wsId = IdGenerator.generate();
    const userId = IdGenerator.generate();
    const objId = IdGenerator.generate();
    const futureDate = new Date(Date.now() + 3600000).toISOString();

    const result = await useCase.execute({
      workspaceId: wsId,
      createdById: userId,
      dto: {
        objectId: objId,
        remindAt: futureDate,
        priority: 'HIGH',
      },
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.workspaceId).toBe(wsId);
    expect(dto.objectId).toBe(objId);
    expect(dto.priority).toBe('HIGH');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockReminderRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should fail when given invalid inputs that trigger Guard error', async () => {
    const userId = IdGenerator.generate();
    const objId = IdGenerator.generate();

    const result = await useCase.execute({
      workspaceId: '', // Invalid empty workspace ID triggers Guard failure
      createdById: userId,
      dto: {
        objectId: objId,
        remindAt: new Date().toISOString(),
      },
    });

    expect(result.isFailure).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockReminderRepository.save).not.toHaveBeenCalled();
  });
});
