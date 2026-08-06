import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniqueEntityId, IdGenerator } from '@lumora/shared';
import { PrismaTimelineRepository } from '../prisma-timeline.repository.js';
import { TimelineRecordEntity } from '../../../../domain/timeline/entities/timeline-record.entity.js';
import { PrismaService } from '../../prisma.service.js';

describe('PrismaTimelineRepository Unit Tests', () => {
  let repository: PrismaTimelineRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      timeline: {
        upsert: vi.fn(),
        findMany: vi.fn(),
      },
    };

    repository = new PrismaTimelineRepository(mockPrisma as unknown as PrismaService);
  });

  it('should save timeline record to database', async () => {
    const record = TimelineRecordEntity.create({
      workspaceId: new UniqueEntityId(),
      userId: new UniqueEntityId(),
      entityCategory: 'OBJECT',
      entityId: new UniqueEntityId(),
      action: 'OBJECT_CREATED',
    });

    mockPrisma.timeline.upsert.mockResolvedValue({
      id: record.id.toString(),
      objectId: record.entityId.toString(),
      startedAt: record.timestamp,
      endedAt: null,
      timezone: 'UTC',
    });

    await repository.save(record);

    expect(mockPrisma.timeline.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: record.id.toString() },
        create: expect.objectContaining({
          id: record.id.toString(),
          objectId: record.entityId.toString(),
        }),
      }),
    );
  });

  it('should find workspace timeline records sorted chronologically', async () => {
    const wsId = new UniqueEntityId();

    mockPrisma.timeline.findMany.mockResolvedValue([
      {
        id: IdGenerator.generate().toString(),
        objectId: IdGenerator.generate().toString(),
        startedAt: new Date(),
        endedAt: null,
        timezone: 'UTC',
      },
    ]);

    const results = await repository.findWorkspaceTimeline(wsId, 10);

    expect(results).toHaveLength(1);
    expect(results[0].entityId).toBeDefined();
    expect(mockPrisma.timeline.findMany).toHaveBeenCalledWith({
      take: 10,
      orderBy: { startedAt: 'desc' },
    });
  });
});
