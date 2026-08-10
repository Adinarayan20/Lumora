export interface ToggleProps {
  readonly value: boolean;
  readonly onValueChange: (value: boolean) => void;
  readonly label?: string;
  readonly helperText?: string;
  readonly disabled?: boolean;
  readonly size?: "sm" | "md";
  readonly accessibilityLabel?: string;
  readonly testID?: string;
}

export interface CheckboxProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label?: string;
  readonly helperText?: string;
  readonly disabled?: boolean;
  readonly size?: "sm" | "md";
  readonly accessibilityLabel?: string;
  readonly testID?: string;
}

export interface RadioOption<T = string> {
  readonly label: string;
  readonly value: T;
  readonly description?: string;
  readonly disabled?: boolean;
}

export interface RadioProps<T = string> {
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly testID?: string;
}

export interface RadioGroupProps<T = string> {
  readonly value: T | null;
  readonly onChange: (value: T) => void;
  readonly options: readonly RadioOption<T>[];
  readonly label?: string;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly disabled?: boolean;
  readonly direction?: "row" | "column";
  readonly accessibilityLabel?: string;
  readonly testID?: string;
}
