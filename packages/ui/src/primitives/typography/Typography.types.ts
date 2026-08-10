import type { TextStyle } from "react-native";
import type { SemanticTypographyRole } from "@lumora/theme";

export type TypographyColorToken =
  | "textPrimary"
  | "textSecondary"
  | "textMuted"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "inverse";

export type TypographyEmphasis =
  "default" | "strong" | "subtle" | "disabled" | "accent";

export type TypographyAlign = "auto" | "left" | "right" | "center" | "justify";

export interface TypographyProps {
  readonly children?: React.ReactNode;
  readonly role?: SemanticTypographyRole;
  readonly color?: TypographyColorToken;
  readonly emphasis?: TypographyEmphasis;
  readonly align?: TypographyAlign;
  readonly numberOfLines?: number;
  readonly selectable?: boolean;
  readonly truncate?: boolean;
  readonly italic?: boolean;
  readonly uppercase?: boolean;
  readonly readingWidth?: boolean;
  readonly maxFontSizeMultiplier?: number;
  readonly accessibilityHint?: string;
  readonly accessibilityLanguage?: string;
  readonly importantForAccessibility?:
    "auto" | "yes" | "no" | "no-hide-descendants";
  readonly writingDirection?: "auto" | "ltr" | "rtl";
  readonly gradient?: boolean;
  readonly gradientStops?: readonly string[];
  readonly animated?: boolean;
  readonly markdown?: boolean;
  readonly selectableLinks?: boolean;
  readonly copyable?: boolean;
  readonly contextMenu?: boolean;
  readonly sharedElementTag?: string;
  readonly style?: TextStyle;
  readonly accessibilityLabel?: string;
  readonly testID?: string;
}

export interface HeadingProps extends Omit<TypographyProps, "role"> {
  readonly level?: 1 | 2 | 3 | 4;
}

export interface TextProps extends TypographyProps {}
