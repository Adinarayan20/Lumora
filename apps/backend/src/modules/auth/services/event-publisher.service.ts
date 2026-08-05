import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { PrismaTransaction } from '../repositories/audit-log.repository';
import {
  UserRegisteredEvent,
  UserLoggedInEvent,
  SessionCreatedEvent,
  SessionRevokedEvent,
  PasswordChangedEvent,
  DeviceTrustedEvent,
} from '../events/identity.events';

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);

  constructor(private readonly eventRepository: EventRepository) {}

  async publishUserRegistered(
    event: UserRegisteredEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: UserRegistered - User ${event.userId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.userId,
        type: 'UserRegistered',
        payload: {
          email: event.email,
          username: event.username,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishUserLoggedIn(
    event: UserLoggedInEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: UserLoggedIn - User ${event.userId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.userId,
        type: 'UserLoggedIn',
        payload: {
          sessionId: event.sessionId,
          deviceId: event.deviceId,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishSessionCreated(
    event: SessionCreatedEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: SessionCreated - Session ${event.sessionId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.userId,
        type: 'SessionCreated',
        payload: {
          sessionId: event.sessionId,
          deviceId: event.deviceId,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishSessionRevoked(
    event: SessionRevokedEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: SessionRevoked - Session ${event.sessionId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.userId,
        type: 'SessionRevoked',
        payload: {
          sessionId: event.sessionId,
          reason: event.reason,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishPasswordChanged(
    event: PasswordChangedEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: PasswordChanged - User ${event.userId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.userId,
        type: 'PasswordChanged',
        payload: {
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishDeviceTrusted(
    event: DeviceTrustedEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: DeviceTrusted - Device ${event.deviceId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.userId,
        type: 'DeviceTrusted',
        payload: {
          deviceId: event.deviceId,
          trusted: event.trusted,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }
}
