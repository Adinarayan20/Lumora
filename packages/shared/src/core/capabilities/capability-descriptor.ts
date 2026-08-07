import type { SystemTrait } from "../catalog/system-trait.js";
import type { FieldSchema } from "../catalog/field-schema.js";
import type { ExecutionPolicy, FailurePolicy } from "./capability-policies.js";

export interface CapabilityDependencySpec {
  readonly capabilityKey: string;
  readonly dependencyType: "REQUIRED" | "OPTIONAL";
  readonly versionRange: string;
}

export interface CapabilityDescriptor {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly priority: number;
  readonly executionOrder: number;
  readonly defaultEnabled: boolean;
  readonly systemRequired: boolean;
  readonly cannotDisable: boolean;
  readonly isExperimental: boolean;
  readonly executionPolicy: ExecutionPolicy;
  readonly failurePolicy: FailurePolicy;
  readonly featureFlag?: string;
  readonly minimumPlatformVersion?: string;
  readonly maximumPlatformVersion?: string;
  readonly supportsOffline: boolean;
  readonly supportsUndo: boolean;
  readonly dependencies: readonly CapabilityDependencySpec[];
  readonly requiredTraits: readonly SystemTrait[];
  readonly permissionRequirements?: readonly string[];
  readonly computeRequirements?: Readonly<Record<string, unknown>>;
  readonly storageRequirements?: Readonly<Record<string, unknown>>;
  readonly networkRequirements?: Readonly<Record<string, unknown>>;
  readonly schemaExtension?: readonly FieldSchema[];
}
