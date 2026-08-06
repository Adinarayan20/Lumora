import { Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { ReminderSchedulerService } from './services/reminder-scheduler.service';
import { ReminderRepository } from './repositories/reminder.repository';
import { ObjectRepository } from '../objects/repositories/object.repository';
import { EventRepository } from '../auth/repositories/event.repository';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuthModule } from '../auth/auth.module';
import {
  CreateReminderFacadeUseCase,
  GetWorkspaceRemindersQuery,
  GetObjectRemindersQuery,
  GetReminderQuery,
  UpdateReminderUseCase,
  SnoozeReminderUseCase,
  CompleteReminderUseCase,
  CancelReminderUseCase,
  RestoreReminderUseCase,
  DeleteReminderUseCase,
} from './use-cases/reminder-use-cases';

@Module({
  imports: [PrismaModule, RbacModule, AuthModule],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    ReminderSchedulerService,
    ReminderRepository,
    ObjectRepository,
    EventRepository,
    CreateReminderFacadeUseCase,
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
  exports: [RemindersService, ReminderSchedulerService, ReminderRepository],
})
export class RemindersModule {}
