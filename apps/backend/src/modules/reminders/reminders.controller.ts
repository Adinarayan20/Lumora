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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { Permissions } from '../rbac/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { FilterReminderDto } from './dto/filter-reminder.dto';
import { SnoozeReminderDto } from './dto/snooze-reminder.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId')
export class RemindersController {
  constructor(
    private readonly createReminderUseCase: ScheduleReminderUseCase,
    private readonly getWorkspaceRemindersQuery: GetWorkspaceRemindersQuery,
    private readonly getObjectRemindersQuery: GetObjectRemindersQuery,
    private readonly getReminderQuery: GetReminderQuery,
    private readonly updateReminderUseCase: UpdateReminderUseCase,
    private readonly snoozeReminderUseCase: SnoozeReminderUseCase,
    private readonly completeReminderUseCase: CompleteReminderUseCase,
    private readonly cancelReminderUseCase: CancelReminderUseCase,
    private readonly restoreReminderUseCase: RestoreReminderUseCase,
    private readonly deleteReminderUseCase: DeleteReminderUseCase,
  ) {}

  @Post('objects/:objectId/reminders')
  @RequirePermissions(Permissions.Reminder.Create)
  async createReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('objectId') objectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReminderDto,
  ) {
    const result = await this.createReminderUseCase.execute({
      workspaceId,
      createdById: userId,
      dto: {
        ...dto,
        objectId: dto.objectId || objectId,
      },
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get('reminders')
  @RequirePermissions(Permissions.Reminder.Read)
  async getWorkspaceReminders(
    @Param('workspaceId') workspaceId: string,
    @Query() filter: FilterReminderDto,
  ) {
    const result = await this.getWorkspaceRemindersQuery.execute({
      workspaceId,
      filter,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get('objects/:objectId/reminders')
  @RequirePermissions(Permissions.Reminder.Read)
  async getObjectReminders(
    @Param('workspaceId') workspaceId: string,
    @Param('objectId') objectId: string,
  ) {
    const result = await this.getObjectRemindersQuery.execute({
      workspaceId,
      objectId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get('reminders/:id')
  @RequirePermissions(Permissions.Reminder.Read)
  async getReminderById(
    @Param('workspaceId') workspaceId: string,
    @Param('id') reminderId: string,
  ) {
    const result = await this.getReminderQuery.execute({
      workspaceId,
      reminderId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Patch('reminders/:id')
  @RequirePermissions(Permissions.Reminder.Update)
  async updateReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('id') reminderId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateReminderDto,
  ) {
    const result = await this.updateReminderUseCase.execute({
      workspaceId,
      reminderId,
      userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Post('reminders/:id/snooze')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.Reminder.Update)
  async snoozeReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('id') reminderId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SnoozeReminderDto,
  ) {
    const result = await this.snoozeReminderUseCase.execute({
      workspaceId,
      reminderId,
      userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Post('reminders/:id/complete')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.Reminder.Update)
  async completeReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('id') reminderId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.completeReminderUseCase.execute({
      workspaceId,
      reminderId,
      userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Post('reminders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.Reminder.Update)
  async cancelReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('id') reminderId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.cancelReminderUseCase.execute({
      workspaceId,
      reminderId,
      userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Post('reminders/:id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.Reminder.Update)
  async restoreReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('id') reminderId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.restoreReminderUseCase.execute({
      workspaceId,
      reminderId,
      userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Delete('reminders/:id')
  @RequirePermissions(Permissions.Reminder.Delete)
  async softDeleteReminder(
    @Param('workspaceId') workspaceId: string,
    @Param('id') reminderId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.deleteReminderUseCase.execute({
      workspaceId,
      reminderId,
      userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }
}
