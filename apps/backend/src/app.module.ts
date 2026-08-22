import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { KernelModule } from './infrastructure/kernel/kernel.module.js';
import { OutboxModule } from './infrastructure/events/outbox/outbox.module.js';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ObjectsModule } from './modules/objects/objects.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { ApplicationExceptionFilter } from './common/filters/index.js';

//
// REMOVED from V1 (see cleanup report §5, §6):
//   - RelationshipsModule: deferred to LATER per 02 §41, 03 §11
//   - SearchModule: deferred to LATER per 02 §41, 03 §11
//   - SpacesModule: Space domain aggregate removed per 02 Invariant 38
//
// REMOVED (deleted, see cleanup report §10, §11):
//   - Capability engine modules (deleted from codebase)
//   - HouseholdsModule (deleted from codebase)
//

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    PrismaModule,
    OutboxModule,
    KernelModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    RbacModule,
    CatalogModule,
    CollectionsModule,
    ObjectsModule,
    RemindersModule,
    TimelineModule,
    NotificationsModule,
    MediaModule,
    SettingsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApplicationExceptionFilter,
    },
  ],
})
export class AppModule {}
