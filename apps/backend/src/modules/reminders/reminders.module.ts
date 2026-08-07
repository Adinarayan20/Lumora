import { Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller.js';
import { RemindersService } from './reminders.service.js';
import { ReminderSchedulerService } from './services/reminder-scheduler.service.js';
import { ReminderRepository } from './repositories/reminder.repository.js';
import { ObjectRepository } from '../objects/repositories/object.repository.js';
import { EventRepository } from '../auth/repositories/event.repository.js';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { REMINDER_REPOSITORY_TOKEN } from './reminders.tokens.js';
import { ScheduleReminderUseCase } from './use-cases/schedule-reminder.use-case.js';
import {
  GetWorkspaceRemindersQuery,
  GetObjectRemindersQuery,
  GetReminderQuery,
  UpdateReminderUseCase,
  SnoozeReminderUseCase,
  CompleteReminderUseCase,
  CancelReminderUseCase,
  RestoreReminderUseCase,
  DeleteReminderUseCase,
} from './use-cases/reminder-use-cases.js';

@Module({
  imports: [PrismaModule, RbacModule, AuthModule],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    ReminderSchedulerService,
    ReminderRepository,
    {
      provide: REMINDER_REPOSITORY_TOKEN,
      useClass: ReminderRepository,
    },
    ObjectRepository,
    EventRepository,
    ScheduleReminderUseCase,
    GetWorkspaceRemindersQuery,
    GetObjectRemindersQuery,
    GetReminderQuery,
    UpdateReminderUseCase,
    SnoozeReminderUseCase,
    CompleteReminderUseCase,
    CancelReminderUseCase,
    RestoreReminderUseCase,
    DeleteReminderUseCase,
  ],
  exports: [
    RemindersService,
    ReminderSchedulerService,
    ReminderRepository,
    REMINDER_REPOSITORY_TOKEN,
  ],
})
export class RemindersModule {}
