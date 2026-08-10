export type TemplateOperationType =
  | "INSTALL"
  | "UPGRADE"
  | "UNINSTALL"
  | "ROLLBACK"
  | "IMPORT"
  | "EXPORT"
  | "VALIDATE";

export interface TemplateOperationContext {
  readonly workspaceId: string;
  readonly userId: string;
  readonly transactionId: string;
  readonly timestamp: Date;
  readonly permissions: readonly string[];
  readonly featureFlags: Readonly<Record<string, boolean>>;
  readonly templateVersion: string;
  readonly platformVersion: string;
  readonly locale: string;
  readonly timezone: string;
  readonly operationType: TemplateOperationType;
}
