import { AggregateRoot, UniqueEntityId, Guard } from '@lumora/shared';
import { ThemePreference } from './value-objects/theme-preference.js';
import { TimezonePreference } from './value-objects/timezone-preference.js';

export interface UserSettingsAggregateProps {
  id?: UniqueEntityId;
  userId: UniqueEntityId;
  theme: ThemePreference;
  locale: string;
  timezone: TimezonePreference;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  updatedAt?: Date;
}

export class UserSettingsAggregate extends AggregateRoot<UniqueEntityId> {
  public readonly userId: UniqueEntityId;
  public theme: ThemePreference;
  public locale: string;
  public timezone: TimezonePreference;
  public notificationsEnabled: boolean;
  public emailNotifications: boolean;
  public pushNotifications: boolean;
  public updatedAt: Date;

  private constructor(props: UserSettingsAggregateProps) {
    super(props.id);
    this.userId = props.userId;
    this.theme = props.theme;
    this.locale = props.locale;
    this.timezone = props.timezone;
    this.notificationsEnabled = props.notificationsEnabled;
    this.emailNotifications = props.emailNotifications;
    this.pushNotifications = props.pushNotifications;
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public static create(
    props: Omit<
      UserSettingsAggregateProps,
      'theme' | 'timezone' | 'locale' | 'notificationsEnabled' | 'emailNotifications' | 'pushNotifications'
    > & {
      theme?: ThemePreference | string;
      timezone?: TimezonePreference | string;
      locale?: string;
      notificationsEnabled?: boolean;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
    },
  ): UserSettingsAggregate {
    const userGuard = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (userGuard.isFailure) throw userGuard.getError();

    const themeObj =
      typeof props.theme === 'string'
        ? ThemePreference.create(props.theme)
        : props.theme ?? ThemePreference.create('SYSTEM');

    const tzObj =
      typeof props.timezone === 'string'
        ? TimezonePreference.create(props.timezone)
        : props.timezone ?? TimezonePreference.create('UTC');

    return new UserSettingsAggregate({
      ...props,
      theme: themeObj,
      locale: props.locale ?? 'en',
      timezone: tzObj,
      notificationsEnabled: props.notificationsEnabled ?? true,
      emailNotifications: props.emailNotifications ?? true,
      pushNotifications: props.pushNotifications ?? true,
    });
  }

  public static reconstitute(props: UserSettingsAggregateProps): UserSettingsAggregate {
    return new UserSettingsAggregate(props);
  }

  public updatePreferences(
    theme?: ThemePreference | string,
    timezone?: TimezonePreference | string,
    locale?: string,
  ): void {
    if (theme) {
      this.theme = typeof theme === 'string' ? ThemePreference.create(theme) : theme;
    }
    if (timezone) {
      this.timezone = typeof timezone === 'string' ? TimezonePreference.create(timezone) : timezone;
    }
    if (locale) {
      this.locale = locale.trim();
    }
    this.updatedAt = new Date();
  }

  public setNotificationChannels(
    notificationsEnabled: boolean,
    emailNotifications: boolean,
    pushNotifications: boolean,
  ): void {
    this.notificationsEnabled = notificationsEnabled;
    this.emailNotifications = emailNotifications;
    this.pushNotifications = pushNotifications;
    this.updatedAt = new Date();
  }
}
