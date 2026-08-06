import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

export const ThemeMode = {
  LIGHT: 'LIGHT',
  DARK: 'DARK',
  SYSTEM: 'SYSTEM',
} as const;

export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];

interface ThemePreferenceProps extends Record<string, unknown> {
  value: ThemeMode;
}

export class ThemePreference extends ValueObject<ThemePreferenceProps> {
  private constructor(props: ThemePreferenceProps) {
    super(props);
  }

  public static create(theme: string): ThemePreference {
    const nullGuard = Guard.againstNullOrUndefined(theme, 'theme');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const upper = theme.trim().toUpperCase();
    const validModes: string[] = Object.values(ThemeMode);

    if (!validModes.includes(upper)) {
      throw new DomainValidationException(
        `Invalid theme mode '${theme}'. Must be one of: ${validModes.join(', ')}.`,
        { theme: [`Theme must be one of ${validModes.join(', ')}.`] },
      );
    }

    return new ThemePreference({ value: upper as ThemeMode });
  }

  public getValue(): ThemeMode {
    return this.props.value;
  }
}
