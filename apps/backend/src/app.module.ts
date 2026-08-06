import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ObjectsModule } from './modules/objects/objects.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { SearchModule } from './modules/search/search.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SpacesModule } from './modules/spaces/spaces.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { RbacModule } from './modules/rbac/rbac.module';

import { LoggerModule } from './infrastructure/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    RbacModule,
    CatalogModule,
    SpacesModule,
    CollectionsModule,
    ObjectsModule,
    RemindersModule,
    TimelineModule,
    NotificationsModule,
    MediaModule,
    SearchModule,
    SettingsModule,
  ],
})
export class AppModule {}
