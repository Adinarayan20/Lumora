/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniqueEntityId, IdGenerator } from '@lumora/shared';
import { PrismaTimelineRepository } from '../prisma-timeline.repository.js';
import { TimelineRecordEntity } from '../../../../domain/timeline/entities/timeline-record.entity.js';

describe('PrismaTimelineRepository Unit Tests', () => {
  let repository: PrismaTimelineRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      timeline: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    repository = new PrismaTimelineRepository(mockPrisma);
  });

  it('should save timeline record to database using append-only create semantics', async () => {
    const record = TimelineRecordEntity.create({
      workspaceId: new UniqueEntityId(),
      userId: new UniqueEntityId(),
      entityCategory: 'OBJECT',
      entityId: new UniqueEntityId(),
      action: 'OBJECT_CREATED',
      metadata: { key: 'value' },
    });

    mockPrisma.timeline.create.mockResolvedValue({
      id: record.id.toString(),
      objectId: record.entityId.toString(),
      workspaceId: record.workspaceId.toString(),
      userId: record.userId.toString(),
      action: 'OBJECT_CREATED',
      metadata: { key: 'value' },
      startedAt: record.timestamp,
      endedAt: null,
      timezone: 'UTC',
    });

    await repository.save(record);

    expect(mockPrisma.timeline.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: record.id.toString(),
          objectId: record.entityId.toString(),
          workspaceId: record.workspaceId.toString(),
          userId: record.userId.toString(),
          action: 'OBJECT_CREATED',
          metadata: { key: 'value' },
        }),
      }),
    );
  });

  it('should find workspace timeline records filtered by workspaceId and sorted chronologically', async () => {
    const wsId = new UniqueEntityId();
    const userId = new UniqueEntityId();

    mockPrisma.timeline.findMany.mockResolvedValue([
      {
        id: IdGenerator.generate().toString(),
        objectId: IdGenerator.generate().toString(),
        workspaceId: wsId.toString(),
        userId: userId.toString(),
        action: 'OBJECT_UPDATED',
        metadata: null,
        startedAt: new Date(),
        endedAt: null,
        timezone: 'UTC',
      },
    ]);

    const results = await repository.findWorkspaceTimeline(wsId, 10);

    expect(results).toHaveLength(1);
    expect(results[0].workspaceId.toString()).toBe(wsId.toString());
    expect(results[0].userId.toString()).toBe(userId.toString());
    expect(results[0].action.getValue()).toBe('OBJECT_UPDATED');
    expect(mockPrisma.timeline.findMany).toHaveBeenCalledWith({
      where: {
        workspaceId: wsId.toString(),
      },
      take: 10,
      orderBy: { startedAt: 'desc' },
    });
  });

  it('should find user timeline records filtered by workspaceId and userId', async () => {
    const wsId = new UniqueEntityId();
    const userId = new UniqueEntityId();

    mockPrisma.timeline.findMany.mockResolvedValue([
      {
        id: IdGenerator.generate().toString(),
        objectId: IdGenerator.generate().toString(),
        workspaceId: wsId.toString(),
        userId: userId.toString(),
        action: 'OBJECT_DELETED',
        metadata: null,
        startedAt: new Date(),
        endedAt: null,
        timezone: 'UTC',
      },
    ]);

    const results = await repository.findUserTimeline(wsId, userId, 10);

    expect(results).toHaveLength(1);
    expect(results[0].workspaceId.toString()).toBe(wsId.toString());
    expect(results[0].userId.toString()).toBe(userId.toString());
    expect(results[0].action.getValue()).toBe('OBJECT_DELETED');
    expect(mockPrisma.timeline.findMany).toHaveBeenCalledWith({
      where: {
        workspaceId: wsId.toString(),
        userId: userId.toString(),
      },
      take: 10,
      orderBy: { startedAt: 'desc' },
    });
  });
});
