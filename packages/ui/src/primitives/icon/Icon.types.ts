import type { StyleProp, ViewStyle } from 'react-native';

export type SemanticIconName =
  // Navigation
  | 'nav.home'
  | 'nav.timeline'
  | 'nav.settings'
  | 'nav.back'
  | 'nav.forward'
  | 'nav.close'
  | 'nav.menu'
  | 'nav.more'
  // Actions
  | 'action.add'
  | 'action.edit'
  | 'action.delete'
  | 'action.search'
  | 'action.filter'
  | 'action.share'
  // Universal Objects
  | 'object.task'
  | 'object.note'
  | 'object.reminder'
  | 'object.event'
  | 'object.collection'
  // Status
  | 'status.success'
  | 'status.warning'
  | 'status.error'
  | 'status.info'
  // Settings & Security & System
  | 'settings.gear'
  | 'settings.theme'
  | 'security.user'
  | 'security.lock'
  | 'system.playground';

export type ExtensionIconName = `ext:${string}`;

export type SemanticIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'display';

export type IconStrokeWeight = 'auto' | 'thin' | 'regular' | 'strong';

export type SemanticIconColor =
  | 'icon.primary'
  | 'icon.secondary'
  | 'icon.muted'
  | 'icon.disabled'
  | 'icon.brand'
  | 'icon.accent'
  | 'icon.inverse'
  | 'icon.success'
  | 'icon.warning'
  | 'icon.danger';

export type IconAccessibilityMode = 'interactive' | 'decorative' | 'informative';

export interface IconProps {
  /** Semantic icon identifier from the Lumora Registry or registered domain extension */
  readonly name: SemanticIconName | ExtensionIconName;
  /** Semantic size token (default: contextual viewport size or 'md') */
  readonly size?: SemanticIconSize;
  /** Semantic stroke weight token (default: 'auto') */
  readonly strokeWeight?: IconStrokeWeight;
  /** Semantic color token resolved via @lumora/theme (default: 'icon.primary') */
  readonly color?: SemanticIconColor;
  /** Explicit accessibility classification override */
  readonly accessibilityMode?: IconAccessibilityMode;
  /** Accessible label required for interactive icon buttons */
  readonly accessibilityLabel?: string;
  /** Accessible hint for screen readers */
  readonly accessibilityHint?: string;
  /** Touch press handler. If passed, evaluates component to interactive mode. */
  readonly onPress?: () => void;
  /** Custom test ID for automated QA */
  readonly testID?: string;
  /** Safe container style overrides (width/height/transform are controlled by primitive) */
  readonly style?: StyleProp<Omit<ViewStyle, 'width' | 'height' | 'transform'>>;
  /** Indicates active loading state */
  readonly isLoading?: boolean;
  /** Indicates selected/active state */
  readonly isSelected?: boolean;
  /** Optional override for RTL mirroring */
  readonly isRTLMirrorable?: boolean;
}
