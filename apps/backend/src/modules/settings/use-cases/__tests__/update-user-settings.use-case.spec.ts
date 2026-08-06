import { describe, it, expect, vi } from 'vitest';
import { IdGenerator } from '@lumora/shared';
import { UpdateUserSettingsUseCase } from '../update-user-settings.use-case.js';
import type { IUserSettingsRepository } from '../../../../domain/settings/repositories/user-settings.repository.interface.js';

describe('UpdateUserSettingsUseCase', () => {
  it('should create or update user settings and return UserSettingsResponseDto', async () => {
    const userId = IdGenerator.generate().toString();

    const mockRepo: IUserSettingsRepository = {
      findByUserId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new UpdateUserSettingsUseCase(mockRepo);
    const result = await useCase.execute({
      userId,
      dto: {
        theme: 'DARK',
        timezone: 'America/New_York',
        locale: 'en-US',
      },
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.theme).toBe('DARK');
    expect(dto.timezone).toBe('America/New_York');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
