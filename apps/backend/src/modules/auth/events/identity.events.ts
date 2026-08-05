export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly deviceId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class SessionCreatedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly deviceId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class SessionRevokedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class PasswordChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class DeviceTrustedEvent {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
    public readonly trusted: boolean,
    public readonly timestamp: Date = new Date(),
  ) {}
}
