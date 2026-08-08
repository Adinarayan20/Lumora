import type { SemanticIconName } from '../icon/Icon.types';
import type { InputVariant, InputSize } from '../input/Input.types';

export interface SelectOption<T = string> {
  readonly label: string;
  readonly value: T;
  readonly description?: string;
  readonly icon?: SemanticIconName;
  readonly disabled?: boolean;
}

export interface SelectProps<T = string> {
  readonly value: T | null;
  readonly onChange: (value: T) => void;
  readonly options: readonly SelectOption<T>[];
  readonly label?: string;
  readonly placeholder?: string;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly size?: InputSize;
  readonly variant?: InputVariant;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly accessibilityLabel?: string;
  readonly testID?: string;
}
