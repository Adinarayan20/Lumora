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

@Module({
  imports: [PrismaModule, RbacModule, AuthModule],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    ReminderSchedulerService,
    ReminderRepository,
    ObjectRepository,
    EventRepository,
  ],
  exports: [RemindersService, ReminderSchedulerService, ReminderRepository],
})
export class RemindersModule {}
