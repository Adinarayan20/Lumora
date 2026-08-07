export interface PlatformManagersState {
  readonly overlayActive: boolean;
  readonly hapticsEnabled: boolean;
  readonly keyboardVisible: boolean;
  readonly safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}

export class PlatformManagers {
  public static triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'): void {
    // Platform native haptics trigger placeholder bridge
  }

  public static announceAccessibility(message: string): void {
    // Platform screen reader announcement bridge
  }
}
