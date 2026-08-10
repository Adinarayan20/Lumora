export interface InteractionState {
  readonly isPressed: boolean;
  readonly isHovered: boolean;
  readonly isFocused: boolean;
  readonly isSelected: boolean;
}

export class InteractionEngine {
  public static createInteractionHandlers(options?: {
    onPress?: () => void;
    onLongPress?: () => void;
  }) {
    return {
      onPress: options?.onPress,
      onLongPress: options?.onLongPress,
      accessible: true,
      accessibilityRole: "button" as const,
    };
  }
}
