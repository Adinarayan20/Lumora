import type React from "react";
import type { SemanticIconName } from "../icon/Icon.types";

export type BadgeVariant =
  "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  readonly variant?: BadgeVariant;
  readonly size?: BadgeSize;
  readonly icon?: SemanticIconName;
  readonly children: React.ReactNode;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
}
