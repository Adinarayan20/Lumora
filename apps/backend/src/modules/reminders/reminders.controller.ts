import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { SnoozeReminderDto } from './dto/snooze-reminder.dto';
import { FilterReminderDto } from './dto/filter-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { Permissions } from '../rbac/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post('objects/:objectId/reminder')
  @RequirePermissions(Permissions.Reminder.Create)
  async createReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('objectId') objectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReminderDto,
  ) {
    return this.remindersService.createReminder(
      workspaceId,
      objectId,
      userId,
      dto,
    );
  }

  @Get('reminders')
  @RequirePermissions(Permissions.Reminder.Read)
  async getWorkspaceReminders(
    @Param('workspaceId') workspaceId: string,
    @Query() filter: FilterReminderDto,
  ) {
    return this.remindersService.getWorkspaceReminders(workspaceId, filter);
  }

  @Get('objects/:objectId/reminder')
  @RequirePermissions(Permissions.Reminder.Read)
  async getObjectReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('objectId') objectId: string,
  ) {
    return this.remindersService.getObjectReminder(workspaceId, objectId);
  }

  @Patch('objects/:objectId/reminder')
  @RequirePermissions(Permissions.Reminder.Update)
  async updateReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('objectId') objectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.updateReminder(
      workspaceId,
      objectId,
      userId,
      dto,
    );
  }

  @Post('objects/:objectId/reminder/snooze')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.Reminder.Update)
  async snoozeReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('objectId') objectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SnoozeReminderDto,
  ) {
    return this.remindersService.snoozeReminder(
      workspaceId,
      objectId,
      userId,
      dto,
    );
  }

  @Post('objects/:objectId/reminder/complete')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.Reminder.Update)
  async completeReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('objectId') objectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.remindersService.completeReminder(
      workspaceId,
      objectId,
      userId,
    );
  }

  @Delete('objects/:objectId/reminder')
  @RequirePermissions(Permissions.Reminder.Delete)
  async softDeleteReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('objectId') objectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.remindersService.softDeleteReminder(
      workspaceId,
      objectId,
      userId,
    );
  }
}
