import type { StyleProp, ViewStyle } from "react-native";
import type { SemanticIconName, ExtensionIconName } from "../icon/Icon.types";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonShape = "rounded" | "pill";

export interface ButtonProps {
  /** Text label displayed inside the button */
  readonly label: string;

  /** Visual hierarchy variant (default: 'primary') */
  readonly variant?: ButtonVariant;

  /** Size token (default: contextual viewport size or 'md') */
  readonly size?: ButtonSize;

  /** Shape geometry (default: 'rounded') */
  readonly shape?: ButtonShape;

  /** Leading icon anchor */
  readonly leftIcon?: SemanticIconName | ExtensionIconName;

  /** Trailing icon anchor */
  readonly rightIcon?: SemanticIconName | ExtensionIconName;

  /** MANDATORY touch press handler */
  readonly onPress: () => void;

  /** Indicates active loading/processing state */
  readonly loading?: boolean;

  /** Indicates disabled state */
  readonly disabled?: boolean;

  /** Expands container width to 100% of parent container */
  readonly fullWidth?: boolean;

  /** Explicit accessibility label for screen readers */
  readonly accessibilityLabel?: string;

  /** Accessible hint for screen readers */
  readonly accessibilityHint?: string;

  /** Custom test ID for automated QA */
  readonly testID?: string;

  /** Safe container layout style overrides (height, padding, colors, radii are owned by primitive) */
  readonly style?: StyleProp<
    Omit<
      ViewStyle,
      | "height"
      | "minHeight"
      | "maxHeight"
      | "padding"
      | "paddingHorizontal"
      | "paddingVertical"
      | "transform"
      | "backgroundColor"
      | "borderRadius"
      | "borderWidth"
      | "borderColor"
      | "opacity"
    >
  >;
}

export interface IconButtonProps {
  /** Semantic icon identifier from the Lumora Registry */
  readonly icon: SemanticIconName | ExtensionIconName;

  /** MANDATORY explicit non-empty accessibility label for screen readers */
  readonly accessibilityLabel: string;

  /** Visual hierarchy variant (default: 'ghost') */
  readonly variant?: ButtonVariant;

  /** Size token (default: contextual viewport size or 'md') */
  readonly size?: ButtonSize;

  /** Shape geometry (default: 'rounded') */
  readonly shape?: ButtonShape;

  /** MANDATORY touch press handler */
  readonly onPress: () => void;

  /** Indicates active loading/processing state */
  readonly loading?: boolean;

  /** Indicates disabled state */
  readonly disabled?: boolean;

  /** Accessible hint for screen readers */
  readonly accessibilityHint?: string;

  /** Custom test ID for automated QA */
  readonly testID?: string;

  /** Safe container layout style overrides (geometry is owned by primitive) */
  readonly style?: StyleProp<
    Omit<
      ViewStyle,
      | "width"
      | "minWidth"
      | "maxWidth"
      | "height"
      | "minHeight"
      | "maxHeight"
      | "padding"
      | "paddingHorizontal"
      | "paddingVertical"
      | "transform"
      | "backgroundColor"
      | "borderRadius"
      | "borderWidth"
      | "borderColor"
      | "opacity"
    >
  >;
}
