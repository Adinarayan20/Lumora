import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    AuthModule,
    UsersModule,
    WorkspacesModule,
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
