import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle, TextInputProps } from 'react-native';
import type { SemanticIconName } from '../icon/Icon.types';

export type InputVariant = 'default' | 'filled' | 'ghost';
export type InputSize = 'sm' | 'md' | 'lg';

export interface FieldControlProps {
  readonly children: ReactNode;
  readonly label?: string;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly testID?: string;
}

export interface InputProps {
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly label?: string;
  readonly placeholder?: string;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly variant?: InputVariant;
  readonly size?: InputSize;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly leftIcon?: SemanticIconName;
  readonly rightIcon?: SemanticIconName;
  readonly onRightIconPress?: () => void;
  readonly rightIconAccessibilityLabel?: string;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly testID?: string;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
  readonly onSubmitEditing?: () => void;
  readonly keyboardType?: TextInputProps['keyboardType'];
  readonly returnKeyType?: TextInputProps['returnKeyType'];
  readonly autoCapitalize?: TextInputProps['autoCapitalize'];
  readonly autoCorrect?: boolean;
  readonly secureTextEntry?: boolean;
  readonly multiline?: boolean;
  readonly numberOfLines?: number;
  readonly style?: StyleProp<
    Omit<
      ViewStyle,
      | 'height'
      | 'minHeight'
      | 'maxHeight'
      | 'padding'
      | 'paddingHorizontal'
      | 'paddingVertical'
      | 'backgroundColor'
      | 'borderRadius'
      | 'borderWidth'
      | 'borderColor'
      | 'opacity'
    >
  >;
}

export interface TextAreaProps extends Omit<InputProps, 'multiline'> {
  readonly numberOfLines?: number;
}
