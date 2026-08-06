import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { PrismaTimelineRepository } from '../../infrastructure/prisma/repositories/prisma-timeline.repository.js';
import { TimelineService } from './timeline.service.js';
import { TimelineController } from './timeline.controller.js';
import { TIMELINE_REPOSITORY_TOKEN } from './timeline.tokens.js';
import { RecordTimelineActivityUseCase } from './use-cases/record-timeline-activity.use-case.js';
import { GetWorkspaceTimelineQuery } from './use-cases/get-workspace-timeline.query.js';

@Module({
  imports: [PrismaModule],
  providers: [
    TimelineService,
    {
      provide: TIMELINE_REPOSITORY_TOKEN,
      useClass: PrismaTimelineRepository,
    },
    RecordTimelineActivityUseCase,
    GetWorkspaceTimelineQuery,
  ],
  controllers: [TimelineController],
  exports: [
    RecordTimelineActivityUseCase,
    GetWorkspaceTimelineQuery,
    TIMELINE_REPOSITORY_TOKEN,
  ],
})
export class TimelineModule {}
