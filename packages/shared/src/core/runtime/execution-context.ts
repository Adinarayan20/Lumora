/**
 * Immutable execution context passed down across runtime operations and capability hooks.
 */
export interface ExecutionContext {
  readonly workspaceId: string;
  readonly userId: string;
  readonly transactionId: string;
  readonly timezone: string;
  readonly locale: string;
  readonly permissions: readonly string[];
  readonly device: Readonly<{
    platform: "web" | "ios" | "android" | "desktop";
    isOffline: boolean;
    appVersion: string;
  }>;
  readonly featureFlags: Readonly<Record<string, boolean>>;
  readonly timestamp: Date;
}
